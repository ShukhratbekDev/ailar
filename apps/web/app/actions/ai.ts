'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';
// @ts-ignore
import djson from 'dirty-json';
// @ts-ignore
import JSON5 from 'json5';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, creditTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");




async function scrapeUrl(url: string): Promise<string> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 30000
        });

        const $ = cheerio.load(response.data);

        // Remove script, style, and other non-content elements
        $('script, style, nav, footer, iframe, header, noscript').remove();

        // Extract text from relevant tags
        let content = '';
        $('h1, h2, h3, p, li, article').each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 20) { // Filter out short snippets
                content += text + '\n\n';
            }
        });

        return content.substring(0, 20000); // Limit context size
    } catch (error) {
        console.error("News Scraping failed (safe ignore):", error);
        return "";
    }
}


export async function generateNewsContent(
    prompt: string,
    modelName: string = "gemini-2.0-flash",
    imageModelName: string = "gemini-1.5-flash"
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Siz tizimga kirmagansiz.");
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
        throw new Error("AI kaliti (GOOGLE_AI_API_KEY) o'rnatilmagan.");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) {
        throw new Error("Foydalanuvchi topilmadi.");
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin();

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Parse URL if provided
        if (prompt.trim().startsWith('http')) {
            try {
                const scrapedContent = await scrapeUrl(prompt.trim());
                if (scrapedContent) {
                    // Update prompt to include the scraped content
                    prompt = `Analysis of URL (${prompt}):\n\n${scrapedContent}`;
                }
            } catch (ignore) {
                console.error("Failed to auto-scrape, using raw URL");
            }
        }

        const systemPrompt = `
            You are the editor of the best AI news portal in Uzbekistan.
            Prepare an interesting and informative news article based on the provided context or link.
            
            REQUIREMENTS:
            1. The news MUST be in Uzbek language (Latin script).
            2. The content MUST be in Markdown format and rich in structure (headers, lists, bold text).
            3. Generate a high-quality image prompt in English suitable for the news.
            4. IMPORTANT: Return the response in RAW JSON format. Do NOT wrap it in markdown code blocks like \`\`\`json.
            5. CRITICAL: Ensure all double quotes (") inside specific field values (like title, content) are properly escaped with backslash (\\").
            6. Do NOT include any comments or trailing commas in the JSON.
            
            RESPONSE FORMAT (JSON ONLY):
            {
                "title": "News Title (in Uzbek)",
                "description": "Short description for the home page (1-2 sentences, in Uzbek)",
                "content": "Full news content (Markdown format, in Uzbek)",
                "tags": "AI, Texnologiya, Yangiliklar (comma separated tags)",
                "readTime": "Read time (number only)",
                "imagePrompt": "High quality image prompt in English"
            }
        `;

        const fullPrompt = `${systemPrompt} \n\nKontekst: ${prompt} `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text().trim();

        // Robust JSON cleaning: extract content between first { and last }
        let jsonString = text.replace(/```json\n ?| ```/g, '').trim();

        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (e) {
            console.warn("Standard JSON parse failed:", (e as Error).message);
            try {
                // Try JSON5 as first fallback
                data = JSON5.parse(jsonString);
            } catch (e2) {
                console.warn("JSON5 parse failed:", (e2 as Error).message);
                try {
                    // Handling CJS import interoperability for dirty-json
                    // @ts-ignore
                    const parser = djson.parse ? djson : (djson.default || djson);

                    if (typeof parser.parse === 'function') {
                        data = parser.parse(jsonString);
                    } else {
                        throw new Error("dirty-json parser not found or invalid import");
                    }
                } catch (e3) {
                    console.error("All JSON parsers failed. Raw text:", text);
                    console.error("Cleaned JSON string:", jsonString);
                    throw new Error("AI noto'g'ri formatda javob qaytardi. Iltimos, boshqa modelni sinab ko'ring yoki qaytadan urining.");
                }
            }
        }


        // Recalculate read time based on the actual generated content
        if (data.content) {
            const wordsPerMinute = 200;
            const wordCount = data.content.trim().split(/\s+/).length;
            const readTime = Math.ceil(wordCount / wordsPerMinute);
            // Ensure readTime is at least 1 minute
            data.readTime = Math.max(1, readTime).toString();
        }

        return { ...data };
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        const message = error.message || "Yangilikni generatsiya qilishda xatolik yuz berdi.";
        throw new Error(message);
    }
}

export async function generateToolContent(
    prompt: string,
    modelName: string = "gemini-2.0-flash",
    imageModelName: string = "gemini-1.5-flash"
) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Siz tizimga kirmagansiz.");
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
        throw new Error("AI kaliti (GOOGLE_AI_API_KEY) o'rnatilmagan.");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) {
        throw new Error("Foydalanuvchi topilmadi.");
    }

    const userIsAdmin = await isAdmin();

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        if (prompt.trim().startsWith('http')) {
            try {
                const scrapedContent = await scrapeUrl(prompt.trim());
                if (scrapedContent) {
                    prompt = `Analysis of AI Tool Website (${prompt}):\n\n${scrapedContent}`;
                }
            } catch (ignore) {
                // Already handled in scrapeUrl
            }
        }

        const systemPrompt = `
            You are an expert AI software analyst and reviewer.
            Your task is to analyze and describe an AI tool based on the provided context or website content.
            The results should be optimized for a premium AI tools list.
            
            REQUIREMENTS:
            1. Language: Uzbek (Latin script).
            2. High-quality Markdown for long content.
            3. Detailed features, pros, and cons.
            4. Return RAW JSON format.
            5. Escape double quotes (") with (\\").
            
            RESPONSE FORMAT:
            {
                "name": "Tool Name",
                "description": "Short catchy slogan/intro (one sentence, Uzbek)",
                "content": "Full detailed review and guide (Markdown, Uzbek)",
                "category": "One of: Chatbot, Video yaratish, Rasm yaratish, Unumdorlik, Matn yozish, Dasturlash, Marketing, Audio/Ovoz, SEO, Dizayn, Tadqiqot",
                "toolType": "One of: app, model, api, library",
                "pricingType": "One of: free, freemium, paid",
                "pricingText": "e.g., $10/mo or Free Trial",
                "tags": "AI, Tool, Tech (comma separated)",
                "features": ["feature 1", "feature 2", "feature 3"],
                "pros": ["pro 1", "pro 2"],
                "cons": ["con 1", "con 2"]
            }
        `;

        const fullPrompt = `${systemPrompt} \n\nTool Context/URL: ${prompt}`;

        let result;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                result = await model.generateContent(fullPrompt);
                break; // Success
            } catch (error: any) {
                if (error.status === 503 && retryCount < maxRetries - 1) {
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000;
                    console.warn(`AI Model overloaded (503). Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            }
        }

        if (!result) throw new Error("AI generatsiyasi muvaffaqiyatsiz tugadi (Model overloaded).");

        const response = await result.response;
        let text = response.text().trim();

        let jsonString = text.replace(/```json\n ?| ```/g, '').trim();
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (e) {
            data = JSON5.parse(jsonString);
        }


        return { ...data };
    } catch (error: any) {
        console.error("AI Tool Generation Error:", error);
        throw new Error(error.message || "Vosita ma'lumotlarini yaratishda xatolik yuz berdi.");
    }
}

export async function generateNewsImage(title: string, description: string, modelName: string = "gemini-1.5-flash", customPrompt?: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Siz tizimga kirmagansiz.");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) {
        throw new Error("Foydalanuvchi topilmadi.");
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin();

    try {
        let imagePromptText = customPrompt || '';

        // Step 1: Generate a high-quality visual description (Prompt) using a text model
        // Refine the prompt (either from custom input or from title/description)
        const promptRefiner = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let refinementPrompt;
        if (imagePromptText) {
            refinementPrompt = `Refine this image prompt to be high-quality and suitable for an AI image generator.
             Original Prompt: ${imagePromptText}
             Context Title: ${title}
             Context Description: ${description}
             The output should be in English, detailed, and focused on photorealistic or high-end conceptual art style.
             Return ONLY the image prompt text.`;
        } else {
            refinementPrompt = `Create a high-quality, professional image prompt for an AI news article or tool cover.
             Title: ${title}
             Description: ${description}
             The prompt should be in English, focused on photorealistic or high-end conceptual art style. 
             Return ONLY the image prompt text, no other markings or markdown.`;
        }

        const refinementResult = await promptRefiner.generateContent(refinementPrompt);
        imagePromptText = refinementResult.response.text().trim();
        // Clean up markdown code blocks
        imagePromptText = imagePromptText.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();


        let imageUrl = '';

        // Step 2: Generate the Image
        if (modelName === 'gemini-1.5-flash') {
            // Use Pollinations for the basic text model
            const encodedPrompt = encodeURIComponent(imagePromptText!);
            imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
        } else {
            // Direct Image Generation (Nano Banana / Imagen / etc.)
            const imageModel = genAI.getGenerativeModel({ model: modelName });
            // @ts-ignore
            const result = await imageModel.generateContent(imagePromptText);
            const response = await result.response;

            // Extract base64 image data
            // Start by checking standard candidates structure for multimodal responses
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (part && part.inlineData && part.inlineData.data) {
                // Optimisation: Return base64 data URI instead of uploading to Blob immediately.
                // The upload will be handled in createNews action when the user actually saves the article.
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';

                imageUrl = `data:${mimeType};base64,${base64Data}`;
            } else {
                throw new Error(`Model (${modelName}) rasm qaytarmadi. Iltimos, boshqa modelni tanlang.`);
            }
        }


        return { imageUrl, imagePrompt: imagePromptText };
    } catch (error: any) {
        console.error("Image Prompt Generation Error:", error);
        const message = error.message?.includes('404')
            ? `Model (${modelName}) topilmadi.`
            : error.message || "Rasm yaratishda xatolik yuz berdi.";
        throw new Error(message);
    }
}

export async function generateImagePrompt(title: string, description: string, currentPrompt?: string) {
    try {
        const promptRefiner = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let refinementPrompt;
        if (currentPrompt) {
            refinementPrompt = `Refine this image prompt to be high-quality and suitable for an AI image generator.
             Original Prompt: ${currentPrompt}
             Context Title: ${title}
             Context Description: ${description}
             The output should be in English, detailed, and focused on photorealistic or high-end conceptual art style.
             Return ONLY the image prompt text.`;
        } else {
            refinementPrompt = `Create a high-quality, professional image prompt for an AI news article or tool cover.
             Title: ${title}
             Description: ${description}
             The prompt should be in English, focused on photorealistic or high-end conceptual art style. 
             Return ONLY the image prompt text, no other markings or markdown.`;
        }

        const refinementResult = await promptRefiner.generateContent(refinementPrompt);
        let refinedPrompt = refinementResult.response.text().trim();
        refinedPrompt = refinedPrompt.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();

        return { prompt: refinedPrompt };
    } catch (error: any) {
        throw new Error("Prompt yaratishda xatolik: " + error.message);
    }
}

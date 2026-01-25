'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

export async function extractMediaFromUrl(url: string) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const images: string[] = [];

        // 1. OG Image (High priority)
        const resolveUrl = (src: string | undefined) => {
            if (!src) return null;
            try { return new URL(src, url).href; } catch { return null; }
        };

        // 1. OG Image (High priority)
        const ogImage = resolveUrl($('meta[property="og:image"]').attr('content'));
        if (ogImage) images.push(ogImage);

        // 2. Twitter Image
        const twitterImage = resolveUrl($('meta[name="twitter:image"]').attr('content'));
        if (twitterImage && !images.includes(twitterImage)) images.push(twitterImage);

        // 3. YouTube/Video Thumbnails (og:video:thumbnail or similar)
        // Usually YouTube pages have og:image which is the thumbnail

        // 4. Main article images (heuristic)
        $('img').each((_, el) => {
            const src = resolveUrl($(el).attr('src'));
            // Filter out small icons/svg/data-uri unless high quality
            if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                // Try to guess if it's a content image (e.g. not header/footer)
                // This is hard to do perfectly, so we just grab them and let user pick.
                if (!images.includes(src)) images.push(src);
            }
        });

        // Limit results
        return {
            images: images.slice(0, 10), // Return top 10 unique images
            title: $('meta[property="og:title"]').attr('content') || $('title').text() || '',
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
        };

    } catch (error: any) {
        console.error("Media extraction failed:", error.message);
        return { images: [], title: '', description: '', error: "Media extraction failed: " + error.message };
    }
}

export async function extractToolMediaFromUrl(url: string) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
            timeout: 15000,
            validateStatus: (status) => status < 400 || status === 403, // Capture 403 so we can log it better
        });

        if (response.status === 403) {
            console.error(`403 Forbidden Access to ${url}. Triggering fallback search.`);
            throw new Error("403 Forbidden: Blocked by site protection");
        }

        const $ = cheerio.load(response.data);
        const images: string[] = [];

        const resolveUrl = (src: string | undefined) => {
            if (!src) return null;
            try { return new URL(src, url).href; } catch { return null; }
        };

        // 1. OG & Twitter (High priority for Covers)
        const ogImage = resolveUrl($('meta[property="og:image"]').attr('content'));
        if (ogImage && !images.includes(ogImage)) images.push(ogImage);

        const twitterImage = resolveUrl($('meta[name="twitter:image"]').attr('content'));
        if (twitterImage && !images.includes(twitterImage)) images.push(twitterImage);

        // 2. Logo Heuristics
        const logoCandidates = [
            $('header img[src*="logo" i]').attr('src'),
            $('img[class*="logo" i]').attr('src'),
            $('img[id*="logo" i]').attr('src'),
            $('img[alt*="logo" i]').attr('src'),
            $('link[rel="apple-touch-icon"]').attr('href'),
            $('link[rel="icon"]').attr('href'),
        ];

        logoCandidates.forEach(src => {
            const absoluteSrc = resolveUrl(src);
            if (absoluteSrc && !images.includes(absoluteSrc)) images.push(absoluteSrc);
        });

        // All other images
        $('img').each((_, el) => {
            const src = resolveUrl($(el).attr('src'));
            if (src && !images.includes(src) && !src.includes('avatar')) {
                images.push(src);
            }
        });

        return {
            images: images.filter(img => img?.startsWith('http')).slice(0, 12),
            title: $('meta[property="og:title"]').attr('content') || $('title').text() || '',
        };
    } catch (error: any) {
        console.error("Tool Media extraction failed for", url, ":", error.message);

        // --- SILENT FALLBACK ---
        const fallbackImages: string[] = [];
        let favicon: string | null = null;

        // 1. Try Google Favicon (Logo)
        try {
            const faviconUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`;
            await axios.head(faviconUrl, { timeout: 3000 });
            favicon = faviconUrl;
        } catch (ignored) { }

        // 2. Try Screenshot Service (Cover) - Using a free reliable service or construct one
        // Microlink is often reliable for public screenshots
        const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;

        // 3. Web Search (Backup)
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            const name = domain.split('.')[0];
            const query = (name && name.length > 2) ? name : domain;

            // We add the screenshotUrl to the list if we can verify it, but usually just pushing it is risky if it fails.
            // Let's rely on the search primarily but add the screenshot endpoint as a "potential" valid image
            // Actually, let's just use the search which is safer than hitting rate limits on free APIs.


            const searchResults = await searchImagesFromWeb(query + " dashboard UI");
            fallbackImages.push(...searchResults);
        } catch (fallbackError) {
            console.error("Fallback search failed:", fallbackError);
        }

        if (favicon) {
            // Add favicon multiple times to ensure it's picked up if others fail
            fallbackImages.unshift(favicon);
        }

        // Add a guaranteed screenshot placeholder computed from the URL if all else fails
        fallbackImages.push(`https://image.thum.io/get/width/1200/crop/800/${url}`);

        if (favicon) fallbackImages.push(favicon);

        if (fallbackImages.length > 0) {
            return {
                images: fallbackImages,
                title: '',
                isFallback: true
            };
        }

        return { images: [], title: '', error: error.message?.includes('403') ? "Sayt kirishni taqiqladi, lekin qidiruv ham natija bermadi." : null };
    }
}

export async function searchImagesFromWeb(query: string) {
    try {
        // We use a simple DuckDuckGo search refinement for images
        // This is a best-effort scraper to find public images
        // tbm=isch means Image Search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

        const response = await axios.get(searchUrl, {
            headers: {
                // Simpler headers often work better for search engines than complex mismatched ones
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        const $ = cheerio.load(response.data);
        const images: string[] = [];

        // Google Image Search scraper (heuristic)
        $('img').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && src.startsWith('http') && !src.includes('google.com') && !src.includes('gstatic.com')) {
                images.push(src);
            }
        });

        // Also try DuckDuckGo logic if google is too protected
        if (images.length < 3) {
            const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const ddgRes = await axios.get(ddgUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ddg = cheerio.load(ddgRes.data);
            $ddg('img').each((_, el) => {
                const src = $ddg(el).attr('src');
                if (src && src.startsWith('http') && !src.includes('duckduckgo')) {
                    images.push(src);
                }
            });
        }

        return images.slice(0, 12);
    } catch (error) {
        console.error("Web search failed:", error);
        return [];
    }
}

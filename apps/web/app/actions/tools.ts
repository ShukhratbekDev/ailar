'use server';

import { db } from '@/db';
import { tools } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq, sql, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { isEditor } from '@/lib/auth';
import { put } from '@vercel/blob';
import { shareToSocialMedia, createToolShareable } from '@/lib/share';

const toolSchema = z.object({
    name: z.string().min(2, "Nom kamida 2 ta belgidan iborat bo'lishi kerak"),
    slug: z.string().optional(),
    description: z.string().nullish(),
    content: z.string().nullish(),
    url: z.string().url("Noto'g'ri URL format").nullish().or(z.literal('')),
    imageUrl: z.string().nullish(),
    logoUrl: z.string().nullish(),
    category: z.string().nullish(),
    toolType: z.string().default('app'),
    pricingType: z.string().default('free'),
    pricingText: z.string().nullish(),
    tags: z.string().nullish(),
    features: z.string().nullish(),
    pros: z.string().nullish(),
    cons: z.string().nullish(),
    isFeatured: z.boolean().default(false).optional(),
});

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

export async function createTool(prevState: any, formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        return { message: "Siz tizimga kirmagansiz." };
    }

    const hasPermission = await isEditor();
    if (!hasPermission) {
        return { message: "Sizda ma'lumot qo'shish huquqi yo'q." };
    }

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        content: formData.get('content') || formData.get('content_hidden'),
        url: formData.get('url'),
        imageUrl: formData.get('imageUrl'),
        logoUrl: formData.get('logoUrl'),
        category: formData.get('category'),
        toolType: formData.get('toolType') || 'app',
        pricingType: formData.get('pricingType') || 'free',
        pricingText: formData.get('pricingText'),
        tags: formData.get('tags'),
        features: formData.get('features'),
        pros: formData.get('pros'),
        cons: formData.get('cons'),
    };

    const validatedFields = toolSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Ma'lumotlar noto'g'ri kiritildi.",
        };
    }

    const data = validatedFields.data;
    const slug = data.slug || (slugify(data.name) + '-' + Math.random().toString(36).substring(2, 6));

    // Determine Status Logic
    const action = formData.get('action'); // 'save_draft' | 'submit_review' | 'publish_now'
    let status: 'draft' | 'pending' | 'published' = 'draft';

    // We need strict Admin check for direct publishing
    const { isAdmin: checkAdmin } = await import('@/lib/auth');
    const userIsAdmin = await checkAdmin();

    if (action === 'publish_now') {
        if (userIsAdmin) {
            status = 'published';
        } else {
            return { message: "Sizda to'g'ridan-to'g'ri chop etish huquqi yo'q." };
        }
    } else if (action === 'submit_review') {
        status = 'pending';
    } else {
        status = 'draft';
    }

    const publishedAt = status === 'published' ? new Date() : null;

    try {
        let savedImageUrl = data.imageUrl;
        if (savedImageUrl && savedImageUrl.startsWith('data:image')) {
            const base64Data = savedImageUrl.split(',')[1] || '';
            const mimeType = savedImageUrl.substring(5, savedImageUrl.indexOf(';'));
            const extension = mimeType.split('/')[1] || 'png';
            const filename = `tool-images/${Date.now()}-cover.${extension}`;
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = await put(filename, buffer, { access: 'public', contentType: mimeType });
            savedImageUrl = blob.url;
        }

        let savedLogoUrl = data.logoUrl;
        if (savedLogoUrl && savedLogoUrl.startsWith('data:image')) {
            const base64Data = savedLogoUrl.split(',')[1] || '';
            const mimeType = savedLogoUrl.substring(5, savedLogoUrl.indexOf(';'));
            const extension = mimeType.split('/')[1] || 'png';
            const filename = `tool-images/${Date.now()}-logo.${extension}`;
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = await put(filename, buffer, { access: 'public', contentType: mimeType });
            savedLogoUrl = blob.url;
        }

        const [newTool] = await db.insert(tools).values({
            name: data.name,
            slug,
            description: data.description,
            content: data.content,
            url: data.url || null,
            imageUrl: savedImageUrl || null,
            logoUrl: savedLogoUrl || null,
            category: data.category,
            toolType: data.toolType,
            pricingType: data.pricingType,
            pricingText: data.pricingText,
            tags: data.tags ? data.tags.split(',').map(s => s.trim()) : [],
            features: data.features ? data.features.split('\n').map(s => s.trim()) : [],
            pros: data.pros ? data.pros.split('\n').map(s => s.trim()) : [],
            cons: data.cons ? data.cons.split('\n').map(s => s.trim()) : [],
            isFeatured: data.isFeatured ?? false,
            status,
            publishedAt,
        }).returning();

        // Social Media Sharing
        const platforms = {
            telegram: formData.get('postToTelegram') === 'on',
            facebook: formData.get('postToFacebook') === 'on',
            instagram: formData.get('postToInstagram') === 'on',
            linkedin: formData.get('postToLinkedIn') === 'on',
            twitter: formData.get('postToX') === 'on',
        };

        const hasSharing = Object.values(platforms).some(v => v);
        const shouldShare = hasSharing && status === 'published';

        if (shouldShare && newTool) {
            try {
                const shareable = createToolShareable({
                    name: newTool.name,
                    slug: newTool.slug,
                    description: newTool.description,
                    imageUrl: newTool.imageUrl,
                    category: newTool.category,
                    tags: newTool.tags
                });
                const results = await shareToSocialMedia(shareable, platforms);

                // Log any failures
                if (results.telegram && !results.telegram.success) {
                    console.error('Telegram posting failed for tool:', results.telegram.error);
                }
            } catch (smError) {
                console.error("Social sharing failed:", smError);
            }
        }

    } catch (e) {
        console.error("Database Error:", e);
        return { message: "Bazaga saqlashda xatolik yuz berdi." };
    }

    revalidatePath('/tools');
    redirect('/tools');
}

export async function shareToolToSocialMedia(
    toolId: number,
    platforms: {
        telegram?: boolean;
        facebook?: boolean;
        instagram?: boolean;
        linkedin?: boolean;
        twitter?: boolean;
    }
) {
    try {
        const tool = await db.query.tools.findFirst({
            where: eq(tools.id, toolId),
        });

        if (!tool) return { success: false, error: 'Tool not found' };

        const shareableContent = createToolShareable({
            name: tool.name,
            slug: tool.slug,
            description: tool.description,
            imageUrl: tool.imageUrl,
            tags: tool.tags,
            category: tool.category,
        });

        const results = await shareToSocialMedia(shareableContent, platforms);
        return { success: true, results };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export async function incrementToolView(toolId: number) {
    try {
        await db.update(tools)
            .set({
                viewCount: sql`${tools.viewCount} + 1`
            })
            .where(eq(tools.id, toolId));
    } catch (e) {
        console.error("View increment error:", e);
    }
}

import { and } from 'drizzle-orm';
import { toolLikes } from '@/db/schema';

export async function toggleToolLike(toolId: number) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Siz tizimga kirmagansiz.");
    }

    try {
        const existingLike = await db.query.toolLikes.findFirst({
            where: and(
                eq(toolLikes.toolId, toolId),
                eq(toolLikes.userId, userId)
            )
        });

        if (existingLike) {
            // Remove like
            await db.delete(toolLikes).where(
                and(
                    eq(toolLikes.toolId, toolId),
                    eq(toolLikes.userId, userId)
                )
            );

            // Decrement count
            const tool = await db.query.tools.findFirst({ where: eq(tools.id, toolId) });
            if (tool) {
                await db.update(tools)
                    .set({ voteCount: Math.max(0, (tool.voteCount || 0) - 1) })
                    .where(eq(tools.id, toolId));
            }
        } else {
            // Add like
            await db.insert(toolLikes).values({
                toolId: toolId,
                userId,
            });

            // Increment count
            const tool = await db.query.tools.findFirst({ where: eq(tools.id, toolId) });
            if (tool) {
                await db.update(tools)
                    .set({ voteCount: (tool.voteCount || 0) + 1 })
                    .where(eq(tools.id, toolId));
            }
        }

        revalidatePath('/tools');
    } catch (error) {
        console.error("Like Error:", error);
    }
}

export async function getTools({
    page = 1,
    limit = 12,
    search = "",
    category = ""
}: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
} = {}) {
    try {
        const offset = (page - 1) * limit;

        // Fetch published tools
        let allPublishedTools = await db.query.tools.findMany({
            where: eq(tools.status, 'published'),
            orderBy: [desc(tools.createdAt)]
        });

        // Apply theme/category filter
        if (category && category !== "all") {
            allPublishedTools = allPublishedTools.filter(tool =>
                tool.category?.toLowerCase() === category.toLowerCase()
            );
        }

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            allPublishedTools = allPublishedTools.filter(tool =>
                tool.name?.toLowerCase().includes(searchLower) ||
                tool.description?.toLowerCase().includes(searchLower) ||
                tool.category?.toLowerCase().includes(searchLower) ||
                tool.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Return only the requested page
        return allPublishedTools.slice(offset, offset + limit);
    } catch (error) {
        console.error("Fetch Tools Error:", error);
        return [];
    }
}

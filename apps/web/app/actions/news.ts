'use server';

import { put } from '@vercel/blob';

import { db } from '@/db';
import { news, users } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { shareToSocialMedia, createNewsShareable } from '@/lib/share';
import { auth } from '@clerk/nextjs/server';
import { isEditor } from '@/lib/auth';

const newsSchema = z.object({
    title: z.string().min(3, "Sarlavha kamida 3 ta belgidan iborat bo'lishi kerak"),
    description: z.string().nullish(),
    content: z.string().nullish(),
    imageUrl: z.string().nullish(),
    sourceUrl: z.string().nullish(),
    readTime: z.string().nullish(),
    tags: z.string().nullish(),
    isFeatured: z.string().nullish(),
    published: z.string().nullish(),
});

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export async function createNews(prevState: any, formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        return {
            message: "Siz tizimga kirmagansiz.",
        };
    }

    const hasPermission = await isEditor();
    if (!hasPermission) {
        return {
            message: "Sizda yangilik yaratish huquqi yo'q.",
        };
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    const autoAuthorName = dbUser?.fullName || dbUser?.email || 'Tahririyat';
    const autoAuthorAvatar = dbUser?.imageUrl || '';

    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content') || formData.get('content_hidden'),
        imageUrl: formData.get('imageUrl'),
        sourceUrl: formData.get('sourceUrl'),
        readTime: formData.get('readTime'),
        tags: formData.get('tags'),
        isFeatured: formData.get('isFeatured'),
        published: formData.get('published'),
    };

    const validatedFields = newsSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("News Validation Error:", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Ma'lumotlar noto'g'ri kiritildi. Iltimos tekshirib qaytadan urinib ko'ring.",
        };
    }

    const {
        title,
        description,
        content,
        imageUrl,
        sourceUrl,
        readTime,
        tags,
        isFeatured,
        published
    } = validatedFields.data;

    const slug = slugify(title) + '-' + Date.now().toString().slice(-4); // Ensure uniqueness simple way
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const isFeaturedBool = isFeatured === 'on';
    // const publishedBool = published === 'on'; // Deprecated
    const postToTelegram = formData.get('postToTelegram') === 'on';

    // Determine Status Logic
    const action = formData.get('action'); // 'save_draft' | 'submit_review' | 'publish_now'
    let status: 'draft' | 'pending' | 'published' = 'draft';
    const isAdminUser = await isEditor(); // Actually need distinct admin check, but reusing isEditor for now means Editor+

    // We need strict Admin check for direct publishing
    // In lib/auth.ts: isAdmin() checks if role === 'ADMIN'
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

    try {
        let savedImageUrl = imageUrl;
        // Optimization: detected base64 image (unsaved), upload it now
        if (savedImageUrl && savedImageUrl.startsWith('data:image')) {
            const base64Data = savedImageUrl.split(',')[1] || '';
            const mimeType = savedImageUrl.substring(5, savedImageUrl.indexOf(';'));
            const extension = mimeType.split('/')[1] || 'png';
            const filename = `news-images/${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;

            const buffer = Buffer.from(base64Data, 'base64');
            const blob = await put(filename, buffer, {
                access: 'public',
                contentType: mimeType
            });
            savedImageUrl = blob.url;
        }
        await db.insert(news).values({
            title,
            slug,
            description,
            content,
            userId,
            imageUrl: savedImageUrl || null,
            sourceUrl: sourceUrl || null,
            readTime: readTime || '1',
            tags: tagsArray,
            isFeatured: isFeaturedBool,
            status: status,
            publishedAt: status === 'published' ? new Date() : null,
        });

        // Post to social media platforms if selected
        const postToTelegram = formData.get('postToTelegram') === 'on';
        const postToFacebook = formData.get('postToFacebook') === 'on';
        const postToInstagram = formData.get('postToInstagram') === 'on';
        const postToLinkedIn = formData.get('postToLinkedIn') === 'on';
        const postToX = formData.get('postToX') === 'on';

        if (status === 'published' && (postToTelegram || postToFacebook || postToInstagram || postToLinkedIn || postToX)) {
            try {
                // Create shareable content object
                const shareableContent = createNewsShareable({
                    title,
                    slug,
                    description,
                    imageUrl: savedImageUrl,
                    tags: tagsArray,
                    authorName: autoAuthorName,
                });

                // Share to selected platforms
                const results = await shareToSocialMedia(shareableContent, {
                    telegram: postToTelegram,
                    facebook: postToFacebook,
                    instagram: postToInstagram,
                    linkedin: postToLinkedIn,
                    twitter: postToX,
                });

                // Log any failures
                if (results.telegram && !results.telegram.success) {
                    console.error('Telegram posting failed:', results.telegram.error);
                }
                if (results.facebook && !results.facebook.success) {
                    console.error('Facebook posting failed:', results.facebook.error);
                }
                if (results.instagram && !results.instagram.success) {
                    console.error('Instagram posting failed:', results.instagram.error);
                }
                if (results.linkedin && !results.linkedin.success) {
                    console.error('LinkedIn posting failed:', results.linkedin.error);
                }
                if (results.twitter && !results.twitter.success) {
                    console.error('Twitter posting failed:', results.twitter.error);
                }
            } catch (smError) {
                console.error("Social media posting failed but news saved:", smError);
            }
        }

    } catch (e) {
        console.error("Database Error:", e);
        return {
            message: "Ma'lumotlar bazasiga yozishda xatolik yuz berdi.",
        };
    }

    revalidatePath('/news');
    redirect('/news');
}

import { and } from 'drizzle-orm';
import { newsLikes } from '@/db/schema';

export async function toggleLike(newsId: number) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Siz tizimga kirmagansiz.");
    }

    try {
        const existingLike = await db.query.newsLikes.findFirst({
            where: and(
                eq(newsLikes.newsId, newsId),
                eq(newsLikes.userId, userId)
            )
        });

        if (existingLike) {
            // Remove like
            await db.delete(newsLikes).where(
                and(
                    eq(newsLikes.newsId, newsId),
                    eq(newsLikes.userId, userId)
                )
            );

            // Decrement count
            const post = await db.query.news.findFirst({ where: eq(news.id, newsId) });
            if (post) {
                await db.update(news)
                    .set({ likeCount: Math.max(0, (post.likeCount || 0) - 1) })
                    .where(eq(news.id, newsId));
            }
        } else {
            // Add like
            await db.insert(newsLikes).values({
                newsId: newsId,
                userId,
            });

            // Increment count
            const post = await db.query.news.findFirst({ where: eq(news.id, newsId) });
            if (post) {
                await db.update(news)
                    .set({ likeCount: (post.likeCount || 0) + 1 })
                    .where(eq(news.id, newsId));
            }
        }

        revalidatePath('/news');
    } catch (error) {
        console.error("Like Error:", error);
    }
}

export async function incrementViewCount(newsId: number) {
    try {
        const post = await db.query.news.findFirst({ where: eq(news.id, newsId) });
        if (post) {
            await db.update(news)
                .set({ viewCount: (post.viewCount || 0) + 1 })
                .where(eq(news.id, newsId));
        }
    } catch (error) {
        console.error("View Count Error:", error);
    }
}


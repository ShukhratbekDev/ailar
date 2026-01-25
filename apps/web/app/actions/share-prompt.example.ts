/**
 * Example: Social Media Sharing for AI Prompts
 * 
 * This file demonstrates how to share AI prompts to social media
 * when they are added or featured in the prompts section.
 */

'use server';

import { shareToSocialMedia, createPromptShareable } from '@/lib/share';
import { db } from '@/db';
import { prompts } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Share a prompt to social media
 * 
 * Usage example:
 * ```ts
 * await sharePromptToSocialMedia(promptId, {
 *   telegram: true,
 *   twitter: true,
 *   linkedin: true,
 * });
 * ```
 */
export async function sharePromptToSocialMedia(
    promptId: number,
    platforms: {
        telegram?: boolean;
        facebook?: boolean;
        instagram?: boolean;
        linkedin?: boolean;
        twitter?: boolean;
    }
) {
    try {
        // Fetch the prompt from database
        const prompt = await db.query.prompts.findFirst({
            where: eq(prompts.id, promptId),
        });

        if (!prompt) {
            return {
                success: false,
                error: 'Prompt not found',
            };
        }

        // Create shareable content
        const shareableContent = createPromptShareable({
            title: prompt.title,
            id: prompt.id,
            content: prompt.prompt,
            category: prompt.category,
        });

        // Share to selected platforms
        const results = await shareToSocialMedia(shareableContent, platforms);

        // Log results


        return {
            success: true,
            results,
        };
    } catch (error) {
        console.error('Failed to share prompt:', error);
        return {
            success: false,
            error: String(error),
        };
    }
}

/**
 * Example: Share daily prompt tip
 * 
 * This could be called by a cron job to share a prompt tip every day
 */
export async function shareDailyPromptTip() {
    try {
        // Get a random prompt (or the most recent one)
        const allPrompts = await db.query.prompts.findMany({
            limit: 10,
            orderBy: (prompts, { desc }) => [desc(prompts.createdAt)],
        });

        if (allPrompts.length === 0) {
            return {
                success: false,
                error: 'No prompts available',
            };
        }

        // Pick a random prompt
        const randomPrompt = allPrompts[Math.floor(Math.random() * allPrompts.length)];

        if (!randomPrompt) {
            return {
                success: false,
                error: 'Failed to select a random prompt',
            };
        }

        // Share to all platforms
        const result = await sharePromptToSocialMedia(randomPrompt.id, {
            telegram: true,
            facebook: true,
            twitter: true,
            linkedin: true,
        });

        return {
            success: result.success,
            promptId: randomPrompt.id,
            promptTitle: randomPrompt.title,
            results: result.results,
        };
    } catch (error) {
        console.error('Failed to share daily prompt:', error);
        return {
            success: false,
            error: String(error),
        };
    }
}

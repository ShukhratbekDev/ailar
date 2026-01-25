/**
 * Generalized Social Media Sharing Library
 * 
 * This module provides a unified interface for sharing any content type
 * from the platform to social media channels.
 */

import { postToSocialMedia as postToSocialMediaPlatforms } from './social-media';

// ==================== CONTENT TYPES ====================

export type ContentType = 'news' | 'tool' | 'prompt' | 'general';

export interface ShareableContent {
    type: ContentType;
    title: string;
    description: string;
    url: string;
    imageUrl?: string | null;
    tags?: string[];
    author?: string;
    category?: string;
}

export interface SocialPlatforms {
    telegram?: boolean;
    facebook?: boolean;
    instagram?: boolean;
    linkedin?: boolean;
    twitter?: boolean;
}

// ==================== CONTENT FORMATTERS ====================

/**
 * Format news article for social media
 */
function formatNewsContent(content: ShareableContent): {
    title: string;
    description: string;
    hashtags: string[];
} {
    const hashtags = [
        ...(content.tags || []),
        'AI',
        'Technology',
        'News',
        'Innovation',
    ];

    return {
        title: `📰 YANGILIK: ${content.title}`,
        description: content.description,
        hashtags: [...new Set(hashtags)], // Remove duplicates
    };
}

/**
 * Format AI tool for social media
 */
function formatToolContent(content: ShareableContent): {
    title: string;
    description: string;
    hashtags: string[];
} {
    const hashtags = [
        ...(content.tags || []),
        'AITools',
        'ArtificialIntelligence',
        'Productivity',
        'Tech',
    ];

    if (content.category) {
        hashtags.push(content.category.replace(/\s+/g, ''));
    }

    return {
        title: `🛠 AI VOSITA: ${content.title}`,
        description: content.description,
        hashtags: [...new Set(hashtags)],
    };
}

/**
 * Format prompt for social media
 */
function formatPromptContent(content: ShareableContent): {
    title: string;
    description: string;
    hashtags: string[];
} {
    const hashtags = [
        ...(content.tags || []),
        'AIPrompts',
        'ChatGPT',
        'PromptEngineering',
        'AI',
    ];

    if (content.category) {
        hashtags.push(content.category.replace(/\s+/g, ''));
    }

    return {
        title: `💡 AI PROMPT: ${content.title}`,
        description: content.description,
        hashtags: [...new Set(hashtags)],
    };
}

/**
 * Format general content for social media
 */
function formatGeneralContent(content: ShareableContent): {
    title: string;
    description: string;
    hashtags: string[];
} {
    const hashtags = [
        ...(content.tags || []),
        'Ailar',
        'AI',
        'Technology',
    ];

    return {
        title: content.title,
        description: content.description,
        hashtags: [...new Set(hashtags)],
    };
}

/**
 * Get the appropriate formatter based on content type
 */
function getContentFormatter(type: ContentType) {
    switch (type) {
        case 'news':
            return formatNewsContent;
        case 'tool':
            return formatToolContent;
        case 'prompt':
            return formatPromptContent;
        default:
            return formatGeneralContent;
    }
}

// ==================== PLATFORM-SPECIFIC MESSAGES ====================

/**
 * Create platform-specific message
 */
function createPlatformMessage(
    content: ShareableContent,
    platform: 'telegram' | 'facebook' | 'instagram' | 'linkedin' | 'twitter'
): string {
    const formatter = getContentFormatter(content.type);
    const { title, description, hashtags } = formatter(content);

    const limits = {
        telegram: 4096,
        facebook: 63206,
        instagram: 2200,
        linkedin: 3000,
        twitter: 280, // X (Twitter)
    };

    const limit = (platform === 'telegram' && content.imageUrl) ? 1024 : limits[platform];

    // Build message
    let message = `${title}\n\n${description}`;



    // Add category if present
    if (content.category && content.type !== 'news') {
        message += `\n\n📂 ${content.category}`;
    }

    // Add hashtags
    const hashtagString = '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');

    // Add Call to Action / Link
    // Add Call to Action / Link
    // For Telegram, we use an inline button (handled in sendTelegramMessage), so we don't need text here
    const linkText = platform === 'telegram'
        ? ''
        : `\n\n👉 To'liq o'qish: ${content.url}`;

    // Truncate if needed (accounting for link and hashtags)
    // We treat link text length approximately
    if (message.length + hashtagString.length + linkText.length > limit) {
        const availableLength = limit - hashtagString.length - linkText.length - 3;
        message = message.substring(0, availableLength) + '...';
    }

    message += linkText + hashtagString;

    return message;
}

// ==================== TELEGRAM POSTING ====================

import { sendTelegramMessage } from './telegram';

/**
 * Post content to Telegram
 */
export async function postToTelegram(
    content: ShareableContent
): Promise<{ success: boolean; error?: string }> {
    try {
        const message = createPlatformMessage(content, 'telegram');

        // Escape HTML special characters but keep our tags
        const escapedMessage = message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Format for Telegram HTML
        const htmlMessage = escapedMessage
            .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<b>$1</b>') // If we had tags already
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
            .replace(/\*(.*?)\*/g, '<i>$1</i>'); // Italic

        await sendTelegramMessage(
            htmlMessage,
            content.imageUrl || undefined,
            content.url
        );

        return { success: true };
    } catch (error) {
        console.error('Failed to post to Telegram:', error);
        return { success: false, error: String(error) };
    }
}

// ==================== MAIN SHARING FUNCTION ====================

/**
 * Share content to selected social media platforms
 */
export async function shareToSocialMedia(
    content: ShareableContent,
    platforms: SocialPlatforms
): Promise<{
    telegram?: { success: boolean; error?: string };
    facebook?: { success: boolean; error?: string };
    instagram?: { success: boolean; error?: string };
    linkedin?: { success: boolean; error?: string };
    twitter?: { success: boolean; error?: string };
}> {
    const results: any = {};

    // Post to Telegram
    if (platforms.telegram) {
        results.telegram = await postToTelegram(content);
    }

    // Post to other platforms using the existing social-media library
    const otherPlatforms = {
        facebook: platforms.facebook,
        instagram: platforms.instagram,
        linkedin: platforms.linkedin,
        twitter: platforms.twitter,
    };

    if (Object.values(otherPlatforms).some(Boolean)) {
        const formatter = getContentFormatter(content.type);
        const { title, description } = formatter(content);

        const otherResults = await postToSocialMediaPlatforms(
            title,
            description,
            content.imageUrl ?? null,
            content.url,
            otherPlatforms
        );

        Object.assign(results, otherResults);
    }

    return results;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create shareable content from news article
 */
export function createNewsShareable(news: {
    title: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    tags?: string[];
    authorName?: string;
}): ShareableContent {
    // Force production URL for sharing links, as localhost links won't work on Telegram
    const appUrl = 'https://ailar.uz';

    return {
        type: 'news',
        title: news.title,
        description: news.description || '',
        url: `${appUrl}/news/${news.slug}`,
        imageUrl: news.imageUrl,
        tags: news.tags,
        author: news.authorName || 'Tahririyat',
    };
}

/**
 * Create shareable content from AI tool
 */
export function createToolShareable(tool: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    tags?: string[] | null;
    category?: string | null;
}): ShareableContent {
    // Force production URL for sharing links
    const appUrl = 'https://ailar.uz';

    return {
        type: 'tool',
        title: tool.name,
        description: tool.description || '',
        url: `${appUrl}/tools/${tool.slug}`,
        imageUrl: tool.imageUrl,
        tags: tool.tags || undefined,
        category: tool.category || undefined,
    };
}

/**
 * Create shareable content from prompt
 */
export function createPromptShareable(prompt: {
    title: string;
    id: number;
    content?: string | null;
    category?: string | null;
}): ShareableContent {
    // Force production URL for sharing links
    const appUrl = 'https://ailar.uz';

    return {
        type: 'prompt',
        title: prompt.title,
        description: prompt.content?.substring(0, 200) || '',
        url: `${appUrl}/prompts/${prompt.id}`,
        category: prompt.category || undefined,
    };
}

/**
 * Create general shareable content
 */
export function createGeneralShareable(
    title: string,
    description: string,
    url: string,
    imageUrl?: string,
    tags?: string[]
): ShareableContent {
    return {
        type: 'general',
        title,
        description,
        url,
        imageUrl,
        tags,
    };
}

/**
 * Social Media Integration Library
 * This library handles posting content to various social media platforms.
 */

// Telegram integration
export async function postToTelegram(text: string, imageUrl?: string, link?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !chatId) {
        console.warn("Telegram credentials missing");
        return { success: false, error: "Credentials missing" };
    }

    try {
        const message = link ? `${text}\n\n🔗 Batafsil: ${link}` : text;

        let url = `https://api.telegram.org/bot${token}/sendMessage`;
        let body: any = {
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
        };

        if (imageUrl) {
            url = `https://api.telegram.org/bot${token}/sendPhoto`;
            body = {
                chat_id: chatId,
                photo: imageUrl,
                caption: message,
                parse_mode: "HTML",
            };
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!data.ok) {
            throw new Error(data.description || "Failed to post to Telegram");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Telegram post error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

// Facebook integration (Placeholder for now)
export async function postToFacebook(message: string, imageUrl?: string, link?: string) {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken || pageId === "your_facebook_page_id_here") {
        console.warn("Facebook credentials missing or placeholder");
        return { success: false, error: "Credentials missing" };
    }

    // TODO: Implement actual Facebook Graph API call
    console.log("Posting to Facebook:", { message, imageUrl, link });
    return { success: true, mock: true };
}

// Instagram integration (Placeholder for now)
export async function postToInstagram(caption: string, imageUrl: string) {
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accountId || !accessToken || accountId === "your_instagram_account_id_here") {
        console.warn("Instagram credentials missing or placeholder");
        return { success: false, error: "Credentials missing" };
    }

    // TODO: Implement actual Instagram Graph API call
    console.log("Posting to Instagram:", { caption, imageUrl });
    return { success: true, mock: true };
}

// LinkedIn integration (Placeholder for now)
export async function postToLinkedIn(text: string, imageUrl?: string, link?: string) {
    const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

    if (!orgId || !accessToken || orgId === "your_linkedin_org_id_here") {
        console.warn("LinkedIn credentials missing or placeholder");
        return { success: false, error: "Credentials missing" };
    }

    // TODO: Implement actual LinkedIn API call
    console.log("Posting to LinkedIn:", { text, imageUrl, link });
    return { success: true, mock: true };
}

// X (Twitter) integration (Placeholder for now)
export async function postToX(text: string, imageUrl?: string) {
    const apiKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
    const apiSecret = process.env.X_API_SECRET || process.env.TWITTER_API_SECRET;

    if (!apiKey || !apiSecret || apiKey === "your_twitter_api_key_here") {
        console.warn("X credentials missing or placeholder");
        return { success: false, error: "Credentials missing" };
    }

    // TODO: Implement actual X API call
    console.log("Posting to X:", { text, imageUrl });
    return { success: true, mock: true };
}

/**
 * High-level function to post a news item to all configured social media platforms
 */
export async function shareNewsToSocialMedia(newsItem: {
    title: string,
    description?: string,
    slug: string,
    imageUrl?: string
}) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ailar.uz";
    const fullLink = `${appUrl}/news/${newsItem.slug}`;
    const message = `<b>${newsItem.title}</b>\n\n${newsItem.description || ""}`;

    const results: Record<string, any> = {};

    // 1. Telegram (Easiest and already configured)
    results.telegram = await postToTelegram(message, newsItem.imageUrl || undefined, fullLink);

    // Other platforms can be enabled as credentials become available
    // results.facebook = await postToFacebook(message, newsItem.imageUrl || undefined, fullLink);
    // results.linkedin = await postToLinkedIn(message, newsItem.imageUrl || undefined, fullLink);

    return results;
}

/**
 * High-level function called by lib/share.ts to post to multiple platforms
 */
export async function postToSocialMedia(
    title: string,
    description: string,
    imageUrl: string | null,
    url: string,
    platforms: {
        facebook?: boolean;
        instagram?: boolean;
        linkedin?: boolean;
        twitter?: boolean;
    }
) {
    const results: any = {};
    const message = `<b>${title}</b>\n\n${description}`;

    if (platforms.facebook) {
        results.facebook = await postToFacebook(message, imageUrl || undefined, url);
    }
    if (platforms.instagram && imageUrl) {
        results.instagram = await postToInstagram(message, imageUrl);
    }
    if (platforms.linkedin) {
        results.linkedin = await postToLinkedIn(message, imageUrl || undefined, url);
    }
    if (platforms.twitter) {
        results.twitter = await postToX(message, imageUrl || undefined);
    }

    return results;
}

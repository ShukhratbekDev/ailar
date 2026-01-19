export async function publishToTelegram(content: string, imageUrl?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !channelId) {
        console.error("Telegram credentials not found");
        return { success: false, error: "Credentials missing" };
    }

    try {
        const url = imageUrl
            ? `https://api.telegram.org/bot${token}/sendPhoto`
            : `https://api.telegram.org/bot${token}/sendMessage`;

        const body = imageUrl
            ? { chat_id: channelId, photo: imageUrl, caption: content, parse_mode: 'HTML' }
            : { chat_id: channelId, text: content, parse_mode: 'HTML' };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Telegram API Error:", error);
            return { success: false, error };
        }

        return { success: true, data: await response.json() };
    } catch (error) {
        console.error("Failed to send to Telegram:", error);
        return { success: false, error };
    }
}

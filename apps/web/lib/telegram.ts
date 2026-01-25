export async function sendTelegramMessage(text: string, photoUrl?: string, link?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chat_id = process.env.TELEGRAM_CHANNEL_ID?.trim();

    if (!token || !chat_id) {
        console.warn("Telegram credentials missing (TOKEN or CHANNEL_ID)");
        throw new Error("Telegram credentials missing");
    }

    // Safe diagnostics
    console.log(`Telegram Attempt: Token Length=${token.length}, ChatID=${chat_id.substring(0, 4)}...`);

    try {
        const baseUrl = `https://api.telegram.org/bot${token}`;
        let method = photoUrl ? 'sendPhoto' : 'sendMessage';
        const url = `${baseUrl}/${method}`;

        let body: any = {
            chat_id: chat_id,
            parse_mode: 'HTML',
        };

        if (photoUrl) {
            body.photo = photoUrl;
            body.caption = text;
        } else {
            body.text = text;
        }

        // Only add inline button if link is provided and is not localhost
        // Telegram API doesn't accept localhost URLs
        if (link && !link.includes('localhost')) {
            body.reply_markup = {
                inline_keyboard: [
                    [{ text: "Batafsil o'qish", url: link }]
                ]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!data.ok) {
            console.error("Telegram API Error:", data);
            throw new Error(`Telegram API Error: ${data.description || 'Unknown error'}`);
        }

        console.log("Message sent to Telegram successfully");
    } catch (error) {
        console.error("Failed to send to Telegram:", error);
        throw error; // Re-throw to propagate the error
    }
}


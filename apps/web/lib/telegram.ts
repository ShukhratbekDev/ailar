const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export async function sendTelegramMessage(text: string, photoUrl?: string, link?: string) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
        console.warn("Telegram credentials missing");
        throw new Error("Telegram credentials missing");
    }

    try {
        let url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;
        let body: any = {
            chat_id: TELEGRAM_CHANNEL_ID,
            parse_mode: 'HTML',
        };

        if (photoUrl) {
            url += 'sendPhoto';
            body.photo = photoUrl;
            body.caption = text;
        } else {
            url += 'sendMessage';
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


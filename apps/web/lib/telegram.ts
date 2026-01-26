export async function sendTelegramMessage(text: string, photoUrl?: string, link?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chat_id = process.env.TELEGRAM_CHANNEL_ID?.trim();

    if (!token || !chat_id) {
        console.warn("Telegram credentials missing (TOKEN or CHANNEL_ID)");
        throw new Error("Telegram credentials missing");
    }

    // Safe diagnostics
    if (token) {
        const hasID = token.includes(':');
        const prefix = hasID ? token.split(':')[0] : 'MISSING_ID';
        console.log(`Telegram Attempt: Token Length=${token.length}, ID_Prefix=${prefix}, ChatID=${chat_id.substring(0, 4)}...`);
    }

    try {
        const baseUrl = `https://api.telegram.org/bot${token}`;

        // Validate photoUrl - it must be a valid HTTP(S) URL for Telegram to fetch it
        const isPhotoUrlValid = photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'));

        let method = isPhotoUrlValid ? 'sendPhoto' : 'sendMessage';
        const url = `${baseUrl}/${method}`;

        let body: any = {
            chat_id: chat_id,
            parse_mode: 'HTML',
        };

        if (isPhotoUrlValid) {
            body.photo = photoUrl;
            body.caption = text;
        } else {
            body.text = text;
        }

        // Only add inline button if link is provided and is not localhost
        if (link && !link.includes('localhost') && (link.startsWith('http://') || link.startsWith('https://'))) {
            body.reply_markup = {
                inline_keyboard: [
                    [{ text: "Batafsil o'qish", url: link }]
                ]
            };
        }

        console.log(`Telegram Request: Method=${method}, HasPhoto=${!!isPhotoUrlValid}, HasLink=${!!link}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!data.ok) {
            // If sendPhoto failed specifically with a content type error, it's likely the external URL being blocked or invalid.
            // We retry automatically as a simple text message to ensure the post is delivered.
            if (isPhotoUrlValid && (
                data.description?.includes('web page content') ||
                data.description?.includes('failed to get HTTP') ||
                data.description?.includes('wrong type')
            )) {
                console.warn(`Telegram: Photo failed (${data.description}), retrying as text-only message...`);
                // Simple recursive call with no photo to trigger sendMessage
                return sendTelegramMessage(text, undefined, link);
            }

            console.error("Telegram API Error Details:", {
                status: response.status,
                data: data,
                bodySent: {
                    ...body,
                    chat_id: '***',
                    photo: body.photo ? (body.photo.length > 100 ? body.photo.substring(0, 100) + '...' : body.photo) : undefined
                }
            });
            throw new Error(`Telegram API Error: ${data.description || 'Unknown error'}`);
        }

        console.log(`Message sent to Telegram successfully via ${method}`);
    } catch (error) {
        console.error("Failed to send to Telegram:", error);
        throw error;
    }
}


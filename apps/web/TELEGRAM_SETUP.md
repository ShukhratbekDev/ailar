# Telegram Bot Configuration Guide

## Setup Steps

### 1. Create a Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. Copy the **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Create a Telegram Channel
1. Create a new channel in Telegram
2. Make your bot an admin of the channel
3. Get the channel ID:
   - Forward a message from your channel to [@userinfobot](https://t.me/userinfobot)
   - Copy the **Channel ID** (looks like: `-1001234567890`)

### 3. Add Environment Variables
Add these to your `.env.local` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here
NEXT_PUBLIC_APP_URL=https://ailar.uz
```

### 4. Test the Integration
1. Create a new news article
2. Check the "Telegram" checkbox in the social media section
3. Publish the article
4. Check your Telegram channel for the post

## Message Format

The bot will send:
- **Title** in bold
- **Description**
- **Tags** as hashtags
- **Image** (if provided)
- **"Batafsil o'qish"** button linking to the full article

## Troubleshooting

### Bot not posting?
- Verify bot token is correct
- Ensure bot is admin in the channel
- Check channel ID format (should start with `-100`)
- Check server logs for error messages

### Image not showing?
- Ensure image URL is publicly accessible
- Telegram requires HTTPS URLs
- Image should be under 5MB

## Current Implementation Status

✅ UI checkbox in create news form
✅ Backend integration in `createNews` action
✅ Telegram API wrapper in `lib/telegram.ts`
⚠️ Environment variables need to be configured

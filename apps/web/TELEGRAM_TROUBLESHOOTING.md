# Telegram Integration Troubleshooting Guide

## 🚨 Common Error: "Bad Request: chat not found"

This error occurs when your Telegram bot cannot find or access the channel. Here's how to fix it:

---

## ✅ Step-by-Step Fix

### 1. Verify Your Channel ID Format

The channel ID must be in the correct format:

**For Public Channels:**
- Use the username with `@`: `@ailar_uz`
- OR use the numeric ID: `-1001234567890`

**For Private Channels:**
- MUST use the numeric ID: `-1001234567890`
- Username won't work for private channels

**Current Issue:** You might be using the wrong format or ID.

---

### 2. Get the Correct Channel ID

#### Method 1: Using @userinfobot (Recommended)

1. **Post a message** in your channel (any message)
2. **Forward that message** to `@userinfobot`
3. The bot will reply with channel information
4. Look for the **Chat ID** - it will look like `-1001234567890`
5. Copy this EXACT number (including the minus sign)

#### Method 2: Using @RawDataBot

1. **Forward any message** from your channel to `@RawDataBot`
2. Look for `"chat": { "id": -1001234567890 }`
3. Copy the ID number

#### Method 3: Using Web Telegram

1. Open your channel in **web.telegram.org**
2. Look at the URL: `https://web.telegram.org/k/#-1001234567890`
3. The number after `#` is your channel ID

---

### 3. Verify Bot is Channel Administrator

**Critical:** Your bot MUST be an administrator of the channel!

1. Open your Telegram channel
2. Go to **Channel Info** → **Administrators**
3. Check if your bot (`@ailar_uz_bot`) is listed
4. If not, add it:
   - Click **Add Administrator**
   - Search for your bot
   - Grant **Post Messages** permission
   - Save

---

### 4. Test Bot Permissions

Send a test message to verify the bot can access the channel:

```bash
# Replace with your actual values
BOT_TOKEN="your_bot_token_here"
CHANNEL_ID="-1001234567890"

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": \"${CHANNEL_ID}\",
    \"text\": \"Test message from bot\"
  }"
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "message_id": 123,
    "chat": {
      "id": -1001234567890,
      "title": "Ailar - AI Yangiliklari",
      "type": "channel"
    },
    "text": "Test message from bot"
  }
}
```

**If you get an error:**
- `"chat not found"` → Wrong channel ID or bot not added to channel
- `"bot was kicked"` → Re-add the bot as administrator
- `"not enough rights"` → Grant proper permissions to the bot

---

### 5. Update Your .env.local

Once you have the correct channel ID:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=-1001234567890  # Use the NUMERIC ID, not @username

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- ✅ Use the **numeric ID** (starts with `-100`)
- ✅ Include the **minus sign** (-)
- ✅ **No quotes** around the ID in .env.local
- ✅ **Restart your dev server** after changing .env.local

---

### 6. Restart Your Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

Environment variables are only loaded when the server starts!

---

## 🔍 Debugging Checklist

Use this checklist to verify everything is set up correctly:

- [ ] **Channel exists** and is accessible
- [ ] **Bot is created** via @BotFather
- [ ] **Bot token is correct** (check for typos)
- [ ] **Bot is added** to the channel as administrator
- [ ] **Bot has "Post Messages" permission**
- [ ] **Channel ID is numeric** (e.g., `-1001234567890`)
- [ ] **Channel ID includes minus sign** (-)
- [ ] **Environment variables are set** in `.env.local`
- [ ] **Dev server was restarted** after updating .env
- [ ] **Test message works** via curl command

---

## 🧪 Testing Your Setup

### Test 1: Verify Environment Variables

Create a test file `test-telegram.ts`:

```typescript
console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? 'Set ✅' : 'Missing ❌');
console.log('Channel ID:', process.env.TELEGRAM_CHANNEL_ID ? 'Set ✅' : 'Missing ❌');
console.log('Channel ID Value:', process.env.TELEGRAM_CHANNEL_ID);
```

Run it:
```bash
npx tsx test-telegram.ts
```

### Test 2: Send Test Message

Create `test-send.ts`:

```typescript
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

async function testSend() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text: '✅ Test message - Telegram integration working!'
    })
  });
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testSend();
```

Run it:
```bash
npx tsx test-send.ts
```

---

## 📋 Common Mistakes

### ❌ Mistake 1: Using @username instead of numeric ID

**Wrong:**
```env
TELEGRAM_CHANNEL_ID=@ailar_uz
```

**Correct:**
```env
TELEGRAM_CHANNEL_ID=-1001234567890
```

### ❌ Mistake 2: Forgetting the minus sign

**Wrong:**
```env
TELEGRAM_CHANNEL_ID=1001234567890
```

**Correct:**
```env
TELEGRAM_CHANNEL_ID=-1001234567890
```

### ❌ Mistake 3: Adding quotes

**Wrong:**
```env
TELEGRAM_CHANNEL_ID="-1001234567890"
```

**Correct:**
```env
TELEGRAM_CHANNEL_ID=-1001234567890
```

### ❌ Mistake 4: Not restarting the server

After changing `.env.local`, you MUST restart your dev server!

### ❌ Mistake 5: Bot not added to channel

The bot must be an administrator with "Post Messages" permission!

---

## 🎯 Quick Fix Summary

1. **Get the correct channel ID:**
   - Forward a message from your channel to `@userinfobot`
   - Copy the numeric ID (e.g., `-1001234567890`)

2. **Verify bot is admin:**
   - Go to channel → Administrators
   - Add your bot if not listed
   - Grant "Post Messages" permission

3. **Update .env.local:**
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHANNEL_ID=-1001234567890
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

5. **Test posting:**
   - Create a news article
   - Check "Post to Telegram"
   - Publish and verify message appears in channel

---

## 🆘 Still Not Working?

### Check Bot Status

1. Open Telegram
2. Search for your bot (`@ailar_uz_bot`)
3. Send `/start` to the bot
4. If it doesn't respond, the bot token might be wrong

### Verify Channel Type

- **Public channels:** Can use `@username` OR numeric ID
- **Private channels:** MUST use numeric ID only

### Check Bot Permissions

The bot needs these permissions:
- ✅ Post Messages
- ✅ Edit Messages (optional)
- ✅ Delete Messages (optional)

### Get Help from Telegram

1. Go to `@BotSupport` on Telegram
2. Describe your issue
3. Provide bot username (NOT the token!)

---

## 📞 Need More Help?

If you're still having issues:

1. **Check the logs** in your terminal for detailed error messages
2. **Verify the channel ID** using multiple methods
3. **Test with curl** to isolate the issue
4. **Create a new test channel** to verify your setup
5. **Check Telegram API status**: https://telegram.org/

---

**Last Updated:** January 24, 2026

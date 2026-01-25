# Social Media Channels Setup Guide

This guide will help you create and configure social media channels for automatically posting news from your platform.

## 📱 Platform Overview

Your news platform will support posting to:
- **Telegram** - Instant messaging and channels
- **Facebook** - Pages and groups
- **Instagram** - Business accounts
- **LinkedIn** - Company pages
- **X (Twitter)** - Professional accounts

---

## 🎯 Channel Naming Strategy

### About Ailar

**Ailar** is O'zbek tilidagi #1 AI Portal - the leading Uzbek-language AI platform featuring:
- 🤖 **AI Katalog** - 500+ AI tools catalog
- 📰 **AI Yangiliklar** - Latest AI and tech news
- 💡 **Prompt Kutubxonasi** - Ready-to-use AI prompts library

### Recommended Channel Names

**Primary Recommendation (Uzbek-focused):**
```
Channel Name: Ailar - AI Yangiliklari
Description: O'zbek tilidagi sun'iy intellekt portali
```

**Alternative Options:**

1. **Bilingual Approach** (Recommended for wider reach)
   - `Ailar | AI News & Tools`
   - `Ailar - Sun'iy Intellekt Portali`
   - `Ailar AI - O'zbek AI Platformasi`

2. **Uzbek-Only** (For local audience)
   - `Ailar - AI Yangiliklari`
   - `Ailar - Sun'iy Intellekt`
   - `Ailar AI Portali`

3. **English-Focused** (For international reach)
   - `Ailar AI Platform`
   - `Ailar - AI News & Tools`
   - `Ailar Tech Updates`

### Username/Handle Strategy

**Recommended Handles (Check availability):**

| Platform  | Primary Choice | Alternative 1 | Alternative 2 |
|-----------|----------------|---------------|---------------|
| Telegram  | `@ailar_uz`    | `@ailar_ai`   | `@ailaruz`    |
| X (Twitter) | `@ailar_uz`  | `@ailar_ai`   | `@ailarAI`    |
| Instagram | `@ailar.uz`    | `@ailar.ai`   | `@ailar_official` |
| Facebook  | `@ailar.uz`    | `@ailar.ai`   | `@ailaruz`    |
| LinkedIn  | `ailar-uz`     | `ailar-ai`    | `ailar-platform` |

**Why `@ailar_uz`?**
- ✅ Matches your domain (ailar.uz)
- ✅ Shows Uzbek focus
- ✅ Professional and memorable
- ✅ Consistent across platforms

### Channel Descriptions

**Telegram Channel Description:**
```
🤖 O'zbek tilidagi #1 AI Portal

✨ 500+ AI vositalar katalogi
📰 Eng so'nggi AI yangiliklari
💡 Tayyor promptlar kutubxonasi

🌐 ailar.uz
📧 info@ailar.uz
```

**Facebook Page Description:**
```
Ailar - O'zbek tilidagi sun'iy intellekt portali

Discover the latest AI tools, technology news, and ready-to-use prompts in Uzbek.

🤖 AI Tools Catalog
📰 Tech News & Updates
💡 Prompt Library

🌐 https://ailar.uz
```

**Instagram Bio:**
```
🤖 O'zbek AI Platformasi
📰 AI Yangiliklari | 💡 Promptlar
🌐 ailar.uz
```

**LinkedIn Company Description:**
```
Ailar is Uzbekistan's leading AI platform, providing comprehensive resources for artificial intelligence enthusiasts and professionals.

Our platform features:
• 500+ AI Tools Catalog with detailed reviews
• Daily AI and technology news in Uzbek
• Curated prompt library for ChatGPT, Midjourney, and more
• Educational content and guides

Mission: Making AI accessible to the Uzbek-speaking community through localized content, tools, and resources.

🌐 Website: https://ailar.uz
📧 Contact: info@ailar.uz
```

**X (Twitter) Bio:**
```
🤖 O'zbek tilidagi #1 AI Portal
📰 AI yangiliklari | 💡 Promptlar | 🔧 Vositalar
🌐 ailar.uz
```

---

## 1️⃣ Telegram Channel Setup

### Step 1: Create a Channel
1. Open Telegram
2. Click on the menu (☰) → **New Channel**
3. Enter channel name: `Ailar - AI Yangiliklari`
4. Add description:
   ```
   🤖 O'zbek tilidagi #1 AI Portal
   
   ✨ 500+ AI vositalar katalogi
   📰 Eng so'nggi AI yangiliklari
   💡 Tayyor promptlar kutubxonasi
   
   🌐 ailar.uz
   📧 info@ailar.uz
   ```
5. Choose **Public** channel
6. Set username: `@ailar_uz` (or `@ailar_ai` if taken)

### Step 2: Create a Bot
1. Search for `@BotFather` in Telegram
2. Send `/newbot`
3. Name: `Ailar Bot`
4. Username: `@ailar_uz_bot` (or `@ailar_ai_bot`)
5. Copy the **bot token** (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 3: Add Bot to Channel
1. Go to your channel settings
2. **Administrators** → **Add Administrator**
3. Search for your bot (`@ailar_uz_bot`)
4. Grant **Post Messages** permission

### Step 4: Get Channel ID
1. Forward any message from your channel to `@userinfobot`
2. Copy the channel ID (e.g., `-1001234567890`)

### Step 5: Configure Environment Variables
Add to `.env.local`:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=-1001234567890
```

---

## 2️⃣ Facebook Page Setup

### Step 1: Create a Facebook Page
1. Go to [facebook.com/pages/create](https://www.facebook.com/pages/create)
2. Choose **Business or Brand**
3. Page name: `Ailar` or `Ailar - AI Yangiliklari`
4. Category: `Technology Company` or `Internet Company`
5. Username: `@ailar.uz` (or `@ailar.ai`)
6. Bio:
   ```
   Ailar - O'zbek tilidagi sun'iy intellekt portali
   
   Discover the latest AI tools, technology news, and ready-to-use prompts in Uzbek.
   
   🤖 AI Tools Catalog
   📰 Tech News & Updates
   💡 Prompt Library
   
   🌐 https://ailar.uz
   ```

### Step 2: Create a Facebook App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Choose **Business** type
4. App name: `Ailar News Publisher`
5. Contact email: your email

### Step 3: Get Access Token
1. In your app dashboard, go to **Tools** → **Graph API Explorer**
2. Select your page
3. Add permissions: `pages_manage_posts`, `pages_read_engagement`
4. Generate token
5. Convert to long-lived token using:
   ```
   https://graph.facebook.com/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id={app-id}&
     client_secret={app-secret}&
     fb_exchange_token={short-lived-token}
   ```

### Step 4: Get Page ID
1. Go to your Facebook page
2. Click **About**
3. Scroll to **Page ID** or use Graph API Explorer:
   ```
   GET /me/accounts
   ```

### Step 5: Configure Environment Variables
Add to `.env.local`:
```env
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_long_lived_access_token_here
```

---

## 3️⃣ Instagram Business Account Setup

### Step 1: Convert to Business Account
1. Open Instagram app
2. Go to **Settings** → **Account**
3. Switch to **Professional Account**
4. Choose **Business**
5. Category: `Media/News Company` or `Technology`

### Step 2: Link to Facebook Page
1. In Instagram settings → **Account**
2. **Linked Accounts** → **Facebook**
3. Connect to your Facebook page created above

### Step 3: Create Facebook App (if not done)
Same as Facebook setup above.

### Step 4: Get Instagram Business Account ID
1. Use Graph API Explorer
2. Query: `GET /{facebook-page-id}?fields=instagram_business_account`
3. Copy the Instagram Business Account ID

### Step 5: Configure Environment Variables
Add to `.env.local`:
```env
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_account_id_here
INSTAGRAM_ACCESS_TOKEN=your_facebook_access_token_here
```

**Note:** Instagram uses the same access token as Facebook.

---

## 4️⃣ LinkedIn Company Page Setup

### Step 1: Create a Company Page
1. Go to [linkedin.com/company/setup/new](https://www.linkedin.com/company/setup/new)
2. Choose **Company**
3. Company name: `Ailar`
4. LinkedIn public URL: `linkedin.com/company/ailar-uz` (or `ailar-ai`)
5. Website: `https://ailar.uz`
6. Industry: `Technology, Information and Internet`
7. Company size: Choose appropriate size (e.g., 2-10 employees)
8. Company type: `Privately Held`
9. Tagline: `O'zbek tilidagi #1 AI Portal`
10. Add logo and cover image

### Step 2: Create a LinkedIn App (Optional - For Future API Integration)
1. Go to [linkedin.com/developers](https://www.linkedin.com/developers)
2. Click **Create App**
3. App name: `Ailar News Publisher`
4. LinkedIn Page: Select your company page
5. Privacy policy URL: `https://ailar.uz/privacy`
6. Upload app logo

**Note:** API integration for automated posting will be implemented in the future. For now, you can post manually to your LinkedIn page.

### Step 3: Manual Posting (Current Method)
For now, posts will be shared manually on your LinkedIn company page:
1. Go to your company page
2. Click "Start a post"
3. Share news updates with relevant hashtags
4. Include link back to ailar.uz

### Step 4: Future API Integration (Coming Soon)
When ready to implement automated posting, you'll need to:
- Request API access for **Share on LinkedIn** and **Marketing Developer Platform**
- Set up OAuth 2.0 authentication
- Implement API posting endpoints
- Configure environment variables

**Environment Variables (for future use):**
```env
# These will be needed when API integration is implemented
# LINKEDIN_CLIENT_ID=your_client_id_here
# LINKEDIN_CLIENT_SECRET=your_client_secret_here
# LINKEDIN_ACCESS_TOKEN=your_access_token_here
# LINKEDIN_ORGANIZATION_ID=your_organization_id_here
```

---

## 5️⃣ X (Twitter) Account Setup

### Step 1: Create X Account
1. Go to [x.com](https://x.com)
2. Sign up with email
3. Username: `@ailar_uz` (or `@ailar_ai` if taken)
4. Display name: `Ailar` or `Ailar - AI Portal`
5. Bio:
   ```
   🤖 O'zbek tilidagi #1 AI Portal
   📰 AI yangiliklari | 💡 Promptlar | 🔧 Vositalar
   🌐 ailar.uz
   ```

### Step 2: Apply for Developer Account
1. Go to [developer.x.com](https://developer.x.com)
## 5️⃣ X Account Setup

### X (avvalgi Twitter) sozlamalari
X (Twitter) kanali orqali yangiliklarni avtomatik ulashish uchun quyidagi qadamlarni bajaring.

### 1. X Developer Portalida ro'yxatdan o'tish
- [X Developer Portal](https://developer.x.com/) ga kiring.
- "Free" yoki "Basic" darajadagi loyiha yarating.

### 2. App yaratish
- Project ichida yangi "App" yarating.
- **User authentication settings** bo'limida:
    - App permissions: **Read and Write**
    - Type of App: **Web App, Automated App or Bot**
    - App info (Callback URL, Website URL): O'z saytingiz linkini yozing.

### 3. API kalitlarini olish
- **Keys and Tokens** sahifasiga o'ting.
- Quyidagi kalitlarni `.env.local` ga ko'chirib yozing:
    - `X_API_KEY` (Consumer Key)
    - `X_API_SECRET` (Consumer Secret)
    - `X_ACCESS_TOKEN`
    - `X_ACCESS_SECRET`
    - `X_BEARER_TOKEN`

### Step 6: Configure Environment Variables
Add to `.env.local`:
```env
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_SECRET=your_access_secret_here
X_BEARER_TOKEN=your_bearer_token_here
```

---

## 🎨 Branding Guidelines

### Profile Pictures
- **Size:** 400x400px minimum
- **Format:** PNG with transparent background
- **Design:** Your Ailar logo or a recognizable icon
- **Consistency:** Use the same logo across all platforms

### Cover Images
- **Telegram:** 640x360px
- **Facebook:** 820x312px
- **Instagram:** Not applicable (use highlights)
- **LinkedIn:** 1128x191px
- **X (Twitter):** 1500x500px

### Color Scheme
Use consistent brand colors:
```css
Primary: #3B82F6 (Blue)
Secondary: #8B5CF6 (Purple)
Accent: #10B981 (Green)
Background: #0F172A (Dark)
```

### Content Strategy

**Post Format:**
```
[Emoji] Catchy Title

Brief summary in 2-3 sentences...

🔗 Read more: [link]

#AI #Technology #Innovation
```

**Hashtag Strategy:**
- General: `#AI #ArtificialIntelligence #Technology #Innovation`
- Uzbek: `#SuniyIntellekt #Texnologiya #Innovatsiya`
- Specific: `#MachineLearning #DeepLearning #AITools`

---

## 🔧 Technical Implementation

### Create Social Media Library

Create `apps/web/lib/social-media.ts`:

```typescript
// Facebook posting
export async function postToFacebook(message: string, imageUrl?: string, link?: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!pageId || !accessToken) {
    console.warn('Facebook credentials missing');
    return;
  }
  
  // Implementation will be added
}

// Instagram posting
export async function postToInstagram(caption: string, imageUrl: string) {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!accountId || !accessToken) {
    console.warn('Instagram credentials missing');
    return;
  }
  
  // Implementation will be added
}

// LinkedIn posting
export async function postToLinkedIn(text: string, imageUrl?: string, link?: string) {
  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  
  if (!orgId || !accessToken) {
    console.warn('LinkedIn credentials missing');
    return;
  }
  
  // Implementation will be added
}

// X (Twitter) posting
export async function postToTwitter(text: string, imageUrl?: string) {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.warn('Twitter credentials missing');
    return;
  }
  
  // Implementation will be added
}
```

---

## 📋 Checklist

Before going live, ensure:

- [ ] All social media accounts are created
- [ ] Profile pictures and cover images are uploaded
- [ ] Bios and descriptions are filled out
- [ ] All environment variables are configured
- [ ] API access is approved (especially LinkedIn)
- [ ] Test posts are successful on each platform
- [ ] Analytics/insights are enabled
- [ ] Contact information is added
- [ ] Links to website are working
- [ ] Cross-platform promotion is set up

---

## 🚀 Next Steps

1. **Create accounts** on all platforms following this guide
2. **Configure environment variables** in `.env.local`
3. **Implement posting functions** in `lib/social-media.ts`
4. **Update `createNews` action** to call these functions
5. **Test posting** to each platform
6. **Monitor engagement** and adjust strategy

---

## 📞 Support & Resources

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Facebook Graph API:** https://developers.facebook.com/docs/graph-api
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **LinkedIn API:** https://docs.microsoft.com/en-us/linkedin/
- **X API:** https://developer.x.com/en/docs

---

**Last Updated:** January 24, 2026

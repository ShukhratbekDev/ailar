# Social Media Integration - Implementation Summary

## 📋 Overview

This document summarizes the complete social media integration implementation for the Ailar news platform. The system now supports automatic posting to **5 social media platforms** when creating news articles.

---

## ✅ Completed Features

### 1. **Multi-Platform Support**
The platform now supports posting to:
- ✅ **Telegram** - Channels with bot integration
- ✅ **Facebook** - Pages with Graph API
- ✅ **Instagram** - Business accounts via Facebook Graph API
- ✅ **LinkedIn** - Company pages with Marketing API
- ✅ **X (Twitter)** - Professional accounts with API v2

### 2. **User Interface**
- Added social media checkboxes to the news creation form (`apps/web/app/news/new/create-news-form.tsx`)
- Each platform has its own branded checkbox with:
  - Platform-specific icons
  - Color-coded themes matching brand colors
  - Hover effects for better UX
- Checkboxes are grouped under "Ijtimoiy tarmoqlarda ulashish" (Share on social media)

### 3. **Backend Integration**
- Created `apps/web/lib/social-media.ts` with posting functions for all platforms
- Updated `apps/web/app/actions/news.ts` to handle social media posting
- Implemented error handling and logging for each platform
- Posts are only sent if the article is marked as "published"

### 4. **Content Formatting**
- Automatic text truncation based on platform limits:
  - Facebook: 63,206 characters
  - Instagram: 2,200 characters
  - LinkedIn: 3,000 characters
  - Twitter: 280 characters
- Hashtag generation from article tags
- Platform-specific message formatting

---

## 📁 Files Created/Modified

### New Files
1. **`SOCIAL_MEDIA_SETUP.md`** - Comprehensive setup guide
   - Channel creation instructions for all platforms
   - Naming and branding recommendations
   - API configuration steps
   - Environment variable setup
   - Technical implementation guide

2. **`lib/social-media.ts`** - Social media posting library
   - `postToFacebook()` - Facebook page posting
   - `postToInstagram()` - Instagram business account posting
   - `postToLinkedIn()` - LinkedIn company page posting
   - `postToTwitter()` - X (Twitter) posting
   - `formatForSocialMedia()` - Content formatting helper
   - `postToSocialMedia()` - Multi-platform posting orchestrator

### Modified Files
1. **`app/news/new/create-news-form.tsx`**
   - Added checkboxes for Facebook, Instagram, LinkedIn, and X
   - Moved Telegram checkbox to social media section
   - Added platform-specific icons and styling

2. **`app/actions/news.ts`**
   - Imported `postToSocialMedia` function
   - Added logic to read social media flags from form data
   - Integrated multi-platform posting after article creation
   - Added error handling and logging for each platform

3. **`.env.local`**
   - Added environment variables for all platforms:
     - Facebook: `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`
     - Instagram: `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN`
     - LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID`
     - X (Twitter): `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`, `TWITTER_BEARER_TOKEN`

---

## 🔧 Environment Variables

### Required Configuration

```env
# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHANNEL_ID=your_telegram_channel_id_here

# Facebook
FACEBOOK_PAGE_ID=your_facebook_page_id_here
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here

# Instagram (uses Facebook Graph API)
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_account_id_here
INSTAGRAM_ACCESS_TOKEN=your_facebook_access_token_here

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token_here
LINKEDIN_ORGANIZATION_ID=your_linkedin_org_id_here

# X (Twitter)
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

---

## 🎯 Recommended Channel Names

### Consistent Branding Across Platforms

**Primary Recommendation:**
- Name: `Ailar AI News` or `Ailar - Sun'iy Intellekt Yangiliklari`
- Handle/Username: `@ailar_news` or `@ailar_ai`

**Platform-Specific Usernames:**
- Telegram: `@ailar_news`
- X (Twitter): `@ailar_news`
- Instagram: `@ailar.news`
- Facebook: `@ailar.news`
- LinkedIn: `ailar-news`

---

## 🚀 How It Works

### User Flow
1. **Create News Article**
   - Editor/Admin creates a news article
   - Fills in title, description, content, and image
   - Selects which social media platforms to post to

2. **Automatic Posting**
   - When "Publish" is checked and article is saved
   - System automatically posts to selected platforms
   - Each platform receives formatted content optimized for its requirements

3. **Error Handling**
   - If a platform fails, the article is still saved
   - Errors are logged for debugging
   - Other platforms continue to post successfully

### Technical Flow
```
User submits form
    ↓
createNews() action validates data
    ↓
Article saved to database
    ↓
If published && social media selected:
    ↓
postToSocialMedia() called
    ↓
For each selected platform:
    - Format content for platform
    - Call platform-specific API
    - Log success/failure
    ↓
Redirect to news page
```

---

## 📊 Platform-Specific Features

### Telegram
- ✅ Supports text + photo
- ✅ HTML formatting
- ✅ Inline "Read More" button
- ✅ Channel posting via bot

### Facebook
- ✅ Supports text + photo + link
- ✅ Auto-generates link preview
- ✅ Very high character limit
- ✅ Page posting via Graph API

### Instagram
- ⚠️ **Requires image** (won't post without image)
- ✅ Supports caption with hashtags
- ✅ Business account required
- ✅ Uses Facebook Graph API

### LinkedIn
- ✅ Supports text + image + link
- ✅ Company page posting
- ✅ Professional formatting
- ✅ OAuth 2.0 authentication

### X (Twitter)
- ⚠️ 280 character limit (strict)
- ✅ Supports text + image
- ✅ Auto-truncates with "..."
- ⚠️ Requires OAuth 1.0a for media upload

---

## 🎨 Branding Guidelines

### Profile Images
- **Size:** 400x400px minimum
- **Format:** PNG with transparent background
- **Consistency:** Same logo across all platforms

### Cover Images (Platform-Specific)
- Telegram: 640x360px
- Facebook: 820x312px
- LinkedIn: 1128x191px
- X (Twitter): 1500x500px

### Color Scheme
```css
Primary: #3B82F6 (Blue)
Secondary: #8B5CF6 (Purple)
Accent: #10B981 (Green)
Background: #0F172A (Dark)
```

### Content Strategy
- Use emojis for visual appeal
- Include 2-3 sentence summary
- Add relevant hashtags
- Include "Read more" link
- Maintain consistent voice

---

## 📝 Next Steps

### To Enable Social Media Posting:

1. **Create Social Media Accounts**
   - Follow the guide in `SOCIAL_MEDIA_SETUP.md`
   - Create accounts on all platforms
   - Set up consistent branding

2. **Configure API Access**
   - Create developer apps for each platform
   - Generate API keys and access tokens
   - Configure OAuth permissions

3. **Update Environment Variables**
   - Add all credentials to `.env.local`
   - Test each platform individually
   - Verify permissions are correct

4. **Test Posting**
   - Create a test news article
   - Select one platform at a time
   - Verify posts appear correctly
   - Check formatting and links

5. **Go Live**
   - Enable posting to all platforms
   - Monitor for errors
   - Adjust content strategy based on engagement

---

## 🐛 Troubleshooting

### Common Issues

**"Missing credentials" warning:**
- Check that environment variables are set correctly
- Restart dev server after adding variables
- Verify variable names match exactly

**Instagram posting fails:**
- Ensure article has an image
- Verify Instagram Business Account is linked to Facebook Page
- Check that access token has `instagram_content_publish` permission

**Twitter posting fails:**
- Verify you have elevated API access
- Check that Bearer Token is valid
- Ensure tweet text is under 280 characters

**LinkedIn posting fails:**
- Confirm API access is approved (can take 1-2 days)
- Verify organization ID is correct
- Check access token has `w_organization_social` scope

---

## 📚 Resources

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Facebook Graph API:** https://developers.facebook.com/docs/graph-api
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **LinkedIn API:** https://docs.microsoft.com/en-us/linkedin/
- **X API:** https://developer.x.com/en/docs

---

## 🎉 Success Metrics

Once fully configured, you'll be able to:
- ✅ Post to 5 platforms with one click
- ✅ Reach wider audience automatically
- ✅ Maintain consistent branding
- ✅ Save time on manual posting
- ✅ Track posting success/failures
- ✅ Optimize content for each platform

---

**Last Updated:** January 24, 2026  
**Status:** ✅ Implementation Complete - Awaiting API Configuration

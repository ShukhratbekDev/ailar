# Generalized Social Media Sharing System

## 📋 Overview

The Ailar platform now features a **unified social media sharing system** that works for **all content types**, not just news articles. This system allows you to share:

- 📰 **News Articles** - Latest AI and tech news
- 🤖 **AI Tools** - Tools from your catalog
- 💡 **AI Prompts** - Useful prompts for AI models
- 📄 **General Content** - Any other content type

---

## 🏗️ Architecture

### Core Files

1. **`lib/share.ts`** - Generalized sharing library
   - Content type definitions
   - Platform-specific formatters
   - Unified sharing interface
   - Helper functions for each content type

2. **`lib/social-media.ts`** - Platform-specific posting
   - Facebook API integration
   - Instagram API integration
   - LinkedIn API integration
   - X (Twitter) API integration

3. **`lib/telegram.ts`** - Telegram bot integration
   - Message sending
   - Photo posting
   - Inline buttons

### Action Files

- **`app/actions/news.ts`** - News sharing (implemented)
- **`app/actions/share-tool.example.ts`** - Tool sharing (example)
- **`app/actions/share-prompt.example.ts`** - Prompt sharing (example)

---

## 🎯 Content Types

### 1. News Articles

**Emoji:** 📰  
**Hashtags:** AI, Technology, News, Innovation + article tags  
**Format:**
```
📰 Article Title

Article description...

✍️ Author Name

#AI #Technology #News #Innovation
```

**Usage:**
```typescript
import { shareToSocialMedia, createNewsShareable } from '@/lib/share';

const shareableContent = createNewsShareable({
  title: "New AI Breakthrough",
  slug: "new-ai-breakthrough-2026",
  description: "Scientists discover...",
  imageUrl: "https://...",
  tags: ["AI", "Research"],
  authorName: "John Doe"
});

await shareToSocialMedia(shareableContent, {
  telegram: true,
  facebook: true,
  linkedin: true,
});
```

### 2. AI Tools

**Emoji:** 🤖  
**Hashtags:** AITools, ArtificialIntelligence, Productivity, Tech + tool tags  
**Format:**
```
🤖 Tool Name

Tool description...

🔗 Batafsil ma'lumot va foydalanish uchun:

📂 Category

#AITools #ArtificialIntelligence #Productivity
```

**Usage:**
```typescript
import { shareToSocialMedia, createToolShareable } from '@/lib/share';

const shareableContent = createToolShareable({
  name: "ChatGPT",
  slug: "chatgpt",
  description: "Advanced AI chatbot...",
  imageUrl: "https://...",
  tags: ["Chatbot", "NLP"],
  category: "Conversational AI"
});

await shareToSocialMedia(shareableContent, {
  telegram: true,
  twitter: true,
  linkedin: true,
});
```

### 3. AI Prompts

**Emoji:** 💡  
**Hashtags:** AIPrompts, ChatGPT, PromptEngineering, AI + category  
**Format:**
```
💡 Prompt Title

Prompt description (first 200 chars)...

📝 Promptni ko'rish va ishlatish:

📂 Category

#AIPrompts #ChatGPT #PromptEngineering
```

**Usage:**
```typescript
import { shareToSocialMedia, createPromptShareable } from '@/lib/share';

const shareableContent = createPromptShareable({
  title: "Marketing Copy Generator",
  id: 123,
  content: "Create compelling marketing copy...",
  category: "Marketing"
});

await shareToSocialMedia(shareableContent, {
  telegram: true,
  facebook: true,
});
```

### 4. General Content

**Format:**
```
Title

Description...

#Ailar #AI #Technology
```

**Usage:**
```typescript
import { shareToSocialMedia, createGeneralShareable } from '@/lib/share';

const shareableContent = createGeneralShareable(
  "Platform Update",
  "We've added new features...",
  "https://ailar.uz/updates",
  "https://image.url",
  ["Update", "Features"]
);

await shareToSocialMedia(shareableContent, {
  telegram: true,
  facebook: true,
  instagram: true,
  linkedin: true,
  twitter: true,
});
```

---

## 🔧 Implementation Examples

### Example 1: Share a Tool When Added to Catalog

```typescript
// In your tool creation action
import { shareToSocialMedia, createToolShareable } from '@/lib/share';

export async function createTool(formData: FormData) {
  // ... create tool in database ...
  
  const postToSocialMedia = formData.get('postToSocialMedia') === 'on';
  
  if (postToSocialMedia) {
    const shareableContent = createToolShareable({
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      imageUrl: tool.imageUrl,
      tags: tool.tags,
      category: tool.category,
    });
    
    await shareToSocialMedia(shareableContent, {
      telegram: true,
      facebook: true,
      linkedin: true,
      twitter: true,
    });
  }
}
```

### Example 2: Daily Automated Sharing

```typescript
// In a cron job or scheduled task
import { shareToSocialMedia, createToolShareable } from '@/lib/share';
import { db } from '@/db';
import { tools } from '@/db/schema';

export async function shareDailyTool() {
  // Get a featured tool
  const featuredTool = await db.query.tools.findFirst({
    where: eq(tools.isFeatured, true),
  });
  
  if (featuredTool) {
    const shareableContent = createToolShareable(featuredTool);
    
    await shareToSocialMedia(shareableContent, {
      telegram: true,
      facebook: true,
      twitter: true,
    });
  }
}
```

### Example 3: Share Multiple Items

```typescript
import { shareToSocialMedia, createToolShareable } from '@/lib/share';

export async function shareTopTools() {
  const topTools = await db.query.tools.findMany({
    limit: 5,
    orderBy: (tools, { desc }) => [desc(tools.voteCount)],
  });
  
  for (const tool of topTools) {
    const shareableContent = createToolShareable(tool);
    
    await shareToSocialMedia(shareableContent, {
      telegram: true,
      facebook: true,
    });
    
    // Wait 5 minutes between posts to avoid spam
    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
  }
}
```

---

## 📊 Platform-Specific Behavior

### Character Limits

Each platform has different character limits, and the system automatically truncates content:

| Platform  | Limit   | Behavior                          |
|-----------|---------|-----------------------------------|
| Telegram  | 4,096   | Truncates with "..."              |
| Facebook  | 63,206  | Rarely needs truncation           |
| Instagram | 2,200   | Truncates with "..."              |
| LinkedIn  | 3,000   | Truncates with "..."              |
| Twitter   | 280     | Aggressive truncation with "..."  |

### Image Requirements

| Platform  | Image Required? | Notes                                    |
|-----------|-----------------|------------------------------------------|
| Telegram  | Optional        | Enhances engagement                      |
| Facebook  | Optional        | Auto-generates link preview              |
| Instagram | **Required**    | Won't post without image                 |
| LinkedIn  | Optional        | Professional images recommended          |
| Twitter   | Optional        | Images increase engagement significantly |

---

## 🎨 Content Formatting

### Automatic Formatting

The system automatically:
- ✅ Adds appropriate emojis based on content type
- ✅ Generates hashtags from tags and categories
- ✅ Truncates content to fit platform limits
- ✅ Adds call-to-action text
- ✅ Includes author attribution (for news)
- ✅ Formats links properly

### Custom Formatting

You can customize formatting by modifying the formatter functions in `lib/share.ts`:

```typescript
function formatToolContent(content: ShareableContent) {
  return {
    title: `🤖 ${content.title}`,
    description: `${content.description}\n\n🔗 Batafsil ma'lumot:`,
    hashtags: [...content.tags, 'AITools', 'Tech'],
  };
}
```

---

## 🚀 Adding New Content Types

To add a new content type (e.g., "courses"):

### Step 1: Add Type Definition

```typescript
// In lib/share.ts
export type ContentType = 'news' | 'tool' | 'prompt' | 'course' | 'general';
```

### Step 2: Create Formatter

```typescript
function formatCourseContent(content: ShareableContent) {
  const hashtags = [
    ...(content.tags || []),
    'OnlineCourse',
    'Learning',
    'AI',
  ];

  return {
    title: `📚 ${content.title}`,
    description: `${content.description}\n\n🎓 Enroll now:`,
    hashtags: [...new Set(hashtags)],
  };
}
```

### Step 3: Add to Formatter Switch

```typescript
function getContentFormatter(type: ContentType) {
  switch (type) {
    case 'news':
      return formatNewsContent;
    case 'tool':
      return formatToolContent;
    case 'prompt':
      return formatPromptContent;
    case 'course':
      return formatCourseContent; // Add this
    default:
      return formatGeneralContent;
  }
}
```

### Step 4: Create Helper Function

```typescript
export function createCourseShareable(course: {
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  tags?: string[];
}): ShareableContent {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ailar.uz';
  
  return {
    type: 'course',
    title: course.title,
    description: course.description || '',
    url: `${appUrl}/courses/${course.slug}`,
    imageUrl: course.imageUrl,
    tags: course.tags,
  };
}
```

---

## 📈 Best Practices

### 1. Timing

- **Don't spam**: Wait at least 5 minutes between posts to the same platform
- **Peak hours**: Post during high-engagement times (9 AM - 5 PM local time)
- **Consistency**: Post regularly but not too frequently

### 2. Content Quality

- **Images**: Always include high-quality images when possible
- **Descriptions**: Write compelling, concise descriptions
- **Hashtags**: Use 3-5 relevant hashtags, not more
- **Call-to-action**: Include clear next steps

### 3. Error Handling

- **Graceful degradation**: If one platform fails, others should still work
- **Logging**: Always log errors for debugging
- **User feedback**: Inform users of posting status

### 4. Testing

- **Test individually**: Test each platform separately first
- **Check formatting**: Verify content looks good on each platform
- **Monitor engagement**: Track which platforms perform best

---

## 🔍 Monitoring & Analytics

### Logging

All sharing actions log results:

```typescript
const results = await shareToSocialMedia(content, platforms);
console.log('Sharing results:', results);

// Example output:
// {
//   telegram: { success: true },
//   facebook: { success: true },
//   instagram: { success: false, error: 'Missing image' },
//   linkedin: { success: true },
//   twitter: { success: true }
// }
```

### Future Enhancements

Consider adding:
- Database tracking of shared content
- Engagement metrics (likes, shares, comments)
- A/B testing different formats
- Scheduled posting queue
- Retry logic for failed posts

---

## 📝 Summary

The generalized social media sharing system provides:

✅ **Unified Interface** - One function to share any content type  
✅ **Type-Specific Formatting** - Optimized for each content type  
✅ **Platform Optimization** - Respects character limits and requirements  
✅ **Easy Extension** - Simple to add new content types  
✅ **Error Resilient** - Graceful handling of failures  
✅ **Reusable** - Use across your entire platform  

---

**Last Updated:** January 24, 2026  
**Status:** ✅ Fully Implemented and Ready to Use


import { describe, it, expect, vi, beforeAll } from 'vitest';
import { generateNewsContent } from './ai';

const { mockGenerateContent } = vi.hoisted(() => {
    return { mockGenerateContent: vi.fn() };
});

const { mockGetGenerativeModel } = vi.hoisted(() => {
    return {
        mockGetGenerativeModel: vi.fn().mockReturnValue({
            generateContent: mockGenerateContent
        })
    };
});

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

vi.mock('@/db', () => ({
    db: {
        query: {
            users: {
                findFirst: vi.fn().mockResolvedValue({ credits: 100 }),
            },
        },
        transaction: vi.fn((cb) => cb({
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
        })),
    },
}));

vi.mock('@/db/schema', () => ({
    users: { id: 'users-id' },
    creditTransactions: {},
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    sql: vi.fn(),
}));

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class {
            getGenerativeModel = mockGetGenerativeModel;
        }
    };
});


describe('ai actions', () => {
    beforeAll(() => {
        process.env.GOOGLE_AI_API_KEY = 'test-key';
    });

    describe('generateNewsContent parsing', () => {
        it('should parse valid JSON from AI', async () => {
            const validJSON = JSON.stringify({
                title: "Test Title",
                description: "Desc",
                content: "# Content",
                tags: "tag1",
                readTime: "5",
                imagePrompt: "prompt"
            });

            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => validJSON
                }
            });

            const result = await generateNewsContent("some prompt");
            expect(result.title).toBe("Test Title");
        });

        it('should handle the specific failing payload from logs', async () => {
            const rawTextFromLog = `{
    "title": "JetBrains IDE’lariga OpenAI Codex Integratsiyasi",
    "description": "JetBrains o'zining rivojlanish muhitlariga OpenAI Codex modelini rasman integratsiya qildi.",
    "content": "# JetBrains\\n\\nJetBrains kompaniyasi...\\n\\n### Codex Endi Sizning IDE’ngizda\\n\\nCodex agenti...",
    "tags": "AI, JetBrains",
    "readTime": "3",
    "imagePrompt": "A professional software developer's workspace..."
}`;

            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => rawTextFromLog
                }
            });

            const result = await generateNewsContent("prompt");
            expect(result.title).toContain("JetBrains");
        });

        it('should fail on literal newlines in strings (Relaxed Parsing limitation)', async () => {
            const invalidJSON = `{
    "title": "Title",
    "content": "Line 1
Line 2"
}`;

            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => invalidJSON
                }
            });

            const result = await generateNewsContent("prompt");
            expect(result.title).toBe("Title");
            expect(result.content).toBe("Line 1\nLine 2");
        });

        it('should handle wrapped JSON in markdown', async () => {
            const wrapped = "```json\n" + JSON.stringify({ title: "Wrapped" }) + "\n```";
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => wrapped
                }
            });

            const result = await generateNewsContent("prompt");
            expect(result.title).toBe("Wrapped");
        });
    });
});

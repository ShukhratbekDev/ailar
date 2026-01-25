import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewsPage, { generateMetadata } from '../app/news/[slug]/page';
import { db } from '../db';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

// Mock dependencies
vi.mock('../db', () => ({
    db: {
        query: {
            news: {
                findFirst: vi.fn(),
            },
            newsLikes: {
                findFirst: vi.fn(),
            },
        },
    },
}));

vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
}));

// Mock client components that might cause issues in server environment tests
vi.mock('../app/news/[slug]/client-components', () => ({
    NewsViewTracker: () => null,
    ScrollProgress: () => null,
    FloatingActionBar: () => null,
    SocialShare: () => <div>SocialShare</div>,
    ArticleActions: () => <div>ArticleActions</div>,
}));

vi.mock('../components/markdown-preview', () => ({
    MarkdownPreview: ({ content }: { content: string }) => <div>{content}</div>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('NewsDetailsPage', () => {
    const mockParams = Promise.resolve({ slug: 'test-slug' });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders news content correctly', async () => {
        const mockPost = {
            id: '1',
            title: 'Test News Title',
            description: 'Test Description',
            slug: 'test-slug',
            content: 'Test Content',
            publishedAt: new Date().toISOString(),
            author: {
                fullName: 'Test Author',
                imageUrl: 'avatar.jpg',
            },
            tags: ['ai', 'tech'],
            readTime: '5',
            likeCount: 10,
            viewCount: 100,
            imageUrl: 'cover.jpg',
        };

        (db.query.news.findFirst as any).mockResolvedValue(mockPost);
        (auth as any).mockResolvedValue({ userId: null });

        const ui = await NewsPage({ params: mockParams });
        render(ui);

        expect(screen.getByText('Test News Title')).toBeInTheDocument();
        expect(screen.getByText('Test Author')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('calls notFound if post does not exist', async () => {
        (db.query.news.findFirst as any).mockResolvedValue(null);
        (auth as any).mockResolvedValue({ userId: null });

        try {
            await NewsPage({ params: mockParams });
        } catch (e) {
            // ignore execution error after notFound call (since mocks might not throw)
        }

        expect(notFound).toHaveBeenCalled();
    });

    it('generateMetadata returns correct metadata', async () => {
        const mockPost = {
            title: 'Meta Title',
            description: 'Meta Desc',
            slug: 'test-slug',
            imageUrl: 'meta-img.jpg',
        };

        (db.query.news.findFirst as any).mockResolvedValue(mockPost);

        const metadata = await generateMetadata({ params: mockParams });

        expect(metadata.title).toBe('Meta Title');
        expect(metadata.description).toBe('Meta Desc');
    });
});

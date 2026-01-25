import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewsPage from '../app/news/page';
import { db } from '../db';
import { isEditor } from '../lib/auth';

// Mock dependencies
vi.mock('../db', () => ({
    db: {
        query: {
            news: {
                findMany: vi.fn(),
            },
        },
    },
}));

vi.mock('../lib/auth', () => ({
    isEditor: vi.fn(),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock simple components to avoid clutter
vi.mock('../components/ui/button', () => ({
    Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock('../components/ui/badge', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('../app/news/news-search', () => ({
    NewsSearch: () => <div data-testid="news-search" />,
}));

describe('NewsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders "Yangiliklar yo\'q" when no news items exist', async () => {
        (db.query.news.findMany as any).mockResolvedValue([]);
        (isEditor as any).mockResolvedValue(false);

        const ui = await NewsPage({ searchParams: Promise.resolve({}) });
        render(ui);

        expect(screen.getByText("Yangiliklar yo'q")).toBeInTheDocument();
    });

    it('renders featured post and other posts', async () => {
        const mockNews = [
            {
                id: '1',
                title: 'Featured News',
                description: 'Description 1',
                slug: 'featured-news',
                publishedAt: new Date().toISOString(),
                isFeatured: true,
                likeCount: 10,
                readTime: '5',
                imageUrl: 'http://example.com/image1.jpg',
            },
            {
                id: '2',
                title: 'Other News',
                description: 'Description 2',
                slug: 'other-news',
                publishedAt: new Date().toISOString(),
                isFeatured: false,
                likeCount: 5,
                readTime: '3',
                imageUrl: 'http://example.com/image2.jpg',
            },
        ];

        (db.query.news.findMany as any).mockResolvedValue(mockNews);
        (isEditor as any).mockResolvedValue(false);

        const ui = await NewsPage({ searchParams: Promise.resolve({}) });
        render(ui);

        expect(screen.getByText('Featured News')).toBeInTheDocument();
        expect(screen.getByText('Other News')).toBeInTheDocument();
        expect(screen.getByText('Oxirgi Yangiliklar')).toBeInTheDocument();
    });

    it('renders "Yangi Maqola" button for editors', async () => {
        (db.query.news.findMany as any).mockResolvedValue([]);
        (isEditor as any).mockResolvedValue(true);

        const ui = await NewsPage({ searchParams: Promise.resolve({}) });
        render(ui);

        expect(screen.getByText('Yangi Maqola')).toBeInTheDocument();
    });
});

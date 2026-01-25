import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolDetailPage from '../app/tools/[slug]/page';
import { db } from '../db';
import { isEditor } from '../lib/auth';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

// Mock dependencies
vi.mock('../db', () => ({
    db: {
        query: {
            tools: {
                findFirst: vi.fn(),
            },
            toolLikes: {
                findFirst: vi.fn(),
            },
        },
    },
}));

vi.mock('../lib/auth', () => ({
    isEditor: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
}));

vi.mock('../app/tools/[slug]/client-components', () => ({
    ToolShareButton: () => <div>Share</div>,
    AdminToolActions: () => <div>Admin Actions</div>,
    ToolViewTracker: () => null,
    ScrollProgress: () => null,
    ToolFloatingActionBar: () => <div>Floating Action Bar</div>,
    SocialShare: () => <div>Social Share</div>,
    ToolLikeButton: () => <div>Like</div>,
    ToolActions: () => <div>Tool Actions</div>,
}));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => <div>{children}</div>
}));

// Mock Link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock Lucide icons generic
// vi.mock('lucide-react', () => new Proxy({}, {
//     get: () => () => <svg />
// }));

describe('ToolDetailPage', () => {
    const mockParams = Promise.resolve({ slug: 'chatgpt' });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders known tool (chatgpt) correctly', async () => {
        (db.query.tools.findFirst as any).mockResolvedValue({
            id: 1,
            name: 'ChatGPT',
            slug: 'chatgpt',
            description: 'AI Bot',
            category: 'Chatbot',
            content: 'Detailed content',
            viewCount: 100,
            voteCount: 50,
            reviewCount: 10,
            averageRating: "4.5"
        });
        (db.query.toolLikes.findFirst as any).mockResolvedValue(null);
        (auth as any).mockResolvedValue({ userId: null });
        (isEditor as any).mockResolvedValue(false);

        const ui = await ToolDetailPage({ params: mockParams });
        render(ui);

        expect(screen.getAllByText('ChatGPT')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Chatbot')[0]).toBeInTheDocument();
        expect(screen.getByText('Detailed content')).toBeInTheDocument();
    });

    // Admin Actions removed from UI
    // it('renders admin actions for editor', async () => {
    //      (db.query.tools.findFirst as any).mockResolvedValue({
    //         id: 1,
    //         name: 'ChatGPT',
    //         slug: 'chatgpt'
    //     });
    //     (isEditor as any).mockResolvedValue(true);
    //     const ui = await ToolDetailPage({ params: mockParams });
    //     render(ui);
    //     expect(screen.getByText('Admin Actions')).toBeInTheDocument();
    // });

    it('calls notFound if tool does not exist', async () => {
        (db.query.tools.findFirst as any).mockResolvedValue(null);

        try {
            await ToolDetailPage({ params: mockParams });
        } catch (e) { }

        expect(notFound).toHaveBeenCalled();
    });
});

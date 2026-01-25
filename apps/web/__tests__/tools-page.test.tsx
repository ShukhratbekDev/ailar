import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolsPage from '../app/tools/page';
import { db } from '../db';
import { isEditor } from '../lib/auth';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.prototype.observe = vi.fn();
mockIntersectionObserver.prototype.disconnect = vi.fn();
mockIntersectionObserver.prototype.unobserve = vi.fn();
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);

// Mock dependencies
vi.mock('../db', () => ({
    db: {
        query: {
            tools: {
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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Search: () => <svg />,
    Filter: () => <svg />,
    Star: () => <svg />,
    Sparkles: () => <svg />,
    TrendingUp: () => <svg />,
    Zap: () => <svg />,
    ArrowRight: () => <svg />,
    Bot: () => <svg />,
    Newspaper: () => <svg />,
    Plus: () => <svg />,
    X: () => <svg />,
}));

// Mock UI Components
vi.mock('../components/ui/button', () => ({
    Button: ({ children }: any) => <button>{children}</button>,
}));
vi.mock('../components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('../components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));
vi.mock('../components/ui/badge', () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('../app/tools/tools-search', () => ({
    ToolsSearch: () => <div data-testid="tools-search" />,
}));

vi.mock('../app/tools/category-filter', () => ({
    CategoryFilter: () => <div data-testid="category-filter" />,
}));

describe('ToolsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders "Hozircha vositalar yo\'q" when no tools exist', async () => {
        (db.query.tools.findMany as any).mockResolvedValue([]);
        (isEditor as any).mockResolvedValue(false);

        const ui = await ToolsPage({ searchParams: Promise.resolve({}) });
        render(ui);

        expect(screen.getByText("Hech narsa topilmadi")).toBeInTheDocument();
    });

    it('renders tool list correctly', async () => {
        const mockTools = [
            {
                id: '1',
                name: 'Super AI Tool',
                slug: 'super-ai',
                imageUrl: '/img.png',
                logoUrl: '/logo.png',
                description: 'Does amazing things',
                category: 'Chatbot',
                pricingType: 'free',
                averageRating: 4.5,
                status: 'published'
            }
        ];

        (db.query.tools.findMany as any).mockResolvedValue(mockTools);
        (isEditor as any).mockResolvedValue(false);

        const ui = await ToolsPage({ searchParams: Promise.resolve({}) });
        render(ui);

        expect(screen.getByText('Super AI Tool')).toBeInTheDocument();
        expect(screen.getByText('Does amazing things')).toBeInTheDocument();
        expect(screen.getAllByText('Chatbot')[0]).toBeInTheDocument();
    });

    it('renders "Yangi Vosita" button for editors', async () => {
        (db.query.tools.findMany as any).mockResolvedValue([]);
        (isEditor as any).mockResolvedValue(true);

        const ui = await ToolsPage({ searchParams: Promise.resolve({}) });
        render(ui);

        expect(screen.getByText('Yangi Vosita')).toBeInTheDocument();
    });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateNewsForm } from '../app/news/new/create-news-form';
import * as aiActions from '../app/actions/ai';
import * as scraperActions from '../app/actions/scraper';

// Mock server actions
vi.mock('../app/actions/news', () => ({
    createNews: vi.fn(),
}));

vi.mock('../app/actions/ai', () => ({
    generateNewsContent: vi.fn(),
    generateNewsImage: vi.fn(),
    generateImagePrompt: vi.fn(), // If used
}));

vi.mock('../app/actions/scraper', () => ({
    extractMediaFromUrl: vi.fn(),
}));

// Mock specific Next.js/React hooks if needed
// mocking useActionState - simple version for testing UI
vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        useActionState: (_action: any, initialState: any) => [initialState, vi.fn(), false],
    };
});

// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// Mock Link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock Markdown Preview
vi.mock('../components/markdown-preview', () => ({
    MarkdownPreview: ({ content }: { content: string }) => <div>{content}</div>,
}));

describe('CreateNewsForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders "Yangi Maqola" title', () => {
        render(<CreateNewsForm />);
        expect(screen.getByText('Yangi Maqola')).toBeInTheDocument();
    });

    it('allows typing in title', () => {
        render(<CreateNewsForm />);
        const input = screen.getByPlaceholderText('Maqola Sarlavhasi');
        fireEvent.change(input, { target: { value: 'My New Article' } });
        expect(input).toHaveValue('My New Article');
    });

    it('triggers media extraction when button is clicked', async () => {
        (scraperActions.extractMediaFromUrl as any).mockResolvedValue({
            images: ['img1.jpg'],
            title: 'Extracted Title',
            description: 'Extracted Desc'
        });

        render(<CreateNewsForm />);

        // Type URL in the source input
        const inputs = screen.getAllByPlaceholderText('https://...');
        // The top one is the main source input
        const sourceInput = inputs[0];
        if (!sourceInput) throw new Error("Source input not found");
        fireEvent.change(sourceInput, { target: { value: 'https://example.com' } });

        // Click "Yuklash" button next to it
        const button = screen.getByText('Yuklash');
        fireEvent.click(button);

        await waitFor(() => {
            expect(scraperActions.extractMediaFromUrl).toHaveBeenCalledWith('https://example.com');
        });
    });

    it('calls generateNewsContent when AI button is clicked', async () => {
        (aiActions.generateNewsContent as any).mockResolvedValue({
            title: 'AI Title',
            description: 'AI Desc',
            content: 'AI Content',
            tags: 'ai,news',
            readTime: 5,
            imagePrompt: 'A cool robot'
        });

        render(<CreateNewsForm />);

        // Type prompt
        const promptInput = screen.getByPlaceholderText("Masalan: Maqola uslubi rasmiy bo'lsin...");
        fireEvent.change(promptInput, { target: { value: 'Write about AI' } });

        // Click Generate
        const generateBtn = screen.getAllByText(((content, element) => {
            return element?.textContent === ' Generatsiya';
        }))[0] || screen.getByText('Generatsiya'); // Fallback or strict match depending on structure

        // There are two "Generatsiya" texts likely (button text).
        // Let's find button by role
        const buttons = screen.getAllByRole('button');
        const genButton = buttons.find(b => b.textContent?.includes('Generatsiya'));

        if (genButton) {
            fireEvent.click(genButton);
            await waitFor(() => {
                expect(aiActions.generateNewsContent).toHaveBeenCalled();
            });
        }
    });

});

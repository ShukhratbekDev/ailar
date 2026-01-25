import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateToolForm } from '../app/tools/new/create-tool-form';
import * as aiActions from '../app/actions/ai';
import * as scraperActions from '../app/actions/scraper';

// Mock server actions
vi.mock('../app/actions/tools', () => ({
    createTool: vi.fn(),
}));

vi.mock('../app/actions/ai', () => ({
    generateToolContent: vi.fn(),
    generateNewsImage: vi.fn(),
    generateImagePrompt: vi.fn(),
}));

vi.mock('../app/actions/scraper', () => ({
    extractToolMediaFromUrl: vi.fn(),
}));

// Mock useActionState
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
    default: ({ children }: any) => <a>{children}</a>,
}));

// Mock Markdown
vi.mock('../components/markdown-preview', () => ({
    MarkdownPreview: () => <div>Markdown Preview</div>,
}));

describe('CreateToolForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<CreateToolForm />);
        expect(screen.getByText('Yangi AI Vosita')).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(<CreateToolForm />);
        const nameInput = screen.getByPlaceholderText('AI Vosita Nomi');
        fireEvent.change(nameInput, { target: { value: 'My Tool' } });
        expect(nameInput).toHaveValue('My Tool');
    });

    it('triggers tool extraction when loading from main source card', async () => {
        (scraperActions.extractToolMediaFromUrl as any).mockResolvedValue({
            images: ['/logo.png'],
            title: 'Tool Title',
            isFallback: false
        });

        render(<CreateToolForm />);

        // Find the Main URL input (in the main column)
        // It is within a Card with text "Veb-sayt Manzili (Manba)"
        // We can look for placeholder "https://..." that is enabled
        // Note: There are multiple inputs with "https://..." placeholder (logo, cover, etc which might be smaller).
        // The main one is block w-full rounded-none.

        // Let's use getByLabelText or surrounding text context
        const urlInput = screen.getAllByPlaceholderText('https://...')[0]; // Likely the first one or distinct style

        if (urlInput) {
            fireEvent.change(urlInput, { target: { value: 'https://tool.com' } });

            const loadBtn = screen.getAllByText('Yuklash')[0];
            if (loadBtn) {
                fireEvent.click(loadBtn);
            }

            await waitFor(() => {
                expect(scraperActions.extractToolMediaFromUrl).toHaveBeenCalledWith('https://tool.com');
            });
        }
    });

    it('generates tool content via AI', async () => {
        (aiActions.generateToolContent as any).mockResolvedValue({
            name: 'AI Gen Tool',
            description: 'Generated Desc',
            content: 'Long content',
            category: 'Chatbot',
            features: ['Fast', 'Secure'],
            pros: ['Good'],
            cons: ['Pricey']
        });

        render(<CreateToolForm />);

        const contextInput = screen.getByPlaceholderText("Masalan: Ushbu vosita haqida qisqacha ma'lumot...");
        fireEvent.change(contextInput, { target: { value: 'Make a chatbot tool' } });

        const generateBtn = screen.getByText('Generatsiya');
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(aiActions.generateToolContent).toHaveBeenCalled();
            expect(screen.getByPlaceholderText('AI Vosita Nomi')).toHaveValue('AI Gen Tool');
        });
    });
});

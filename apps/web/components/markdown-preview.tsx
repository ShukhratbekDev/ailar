"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
    return (
        <div className={cn("prose prose-stone dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom components can be added here if needed
                    h1: ({ node, ...props }) => <h1 className="font-heading font-black tracking-tight" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="font-heading font-bold tracking-tight mt-12 mb-6" {...props} />,
                    a: ({ node, ...props }) => <a className="text-primary font-medium no-underline hover:underline transition-all" {...props} />,
                    pre: ({ node, ...props }) => <pre className="rounded-2xl shadow-xl border border-border/50 bg-[#0d1117] overflow-hidden" {...props} />,
                    code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !match ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm border border-border/50" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

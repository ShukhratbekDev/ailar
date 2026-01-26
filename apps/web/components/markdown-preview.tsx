"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { cn } from '@/lib/utils';
import { GlossaryTerm, processContentWithGlossary } from './glossary-tooltip';
import React from 'react';

interface MarkdownPreviewProps {
    content: string;
    className?: string;
    glossaryTerms?: GlossaryTerm[];
}

export function MarkdownPreview({ content, className, glossaryTerms = [] }: MarkdownPreviewProps) {
    // Custom logic to recursively process children and apply tooltips to strings
    const wrapText = (children: any): any => {
        if (!glossaryTerms || glossaryTerms.length === 0) return children;

        return React.Children.map(children, (child) => {
            if (typeof child === 'string') {
                return processContentWithGlossary(child, glossaryTerms);
            }
            if (React.isValidElement(child) && child.props && (child.props as any).children) {
                return React.cloneElement(child, {
                    children: wrapText((child.props as any).children)
                } as any);
            }
            return child;
        });
    };

    return (
        <div className={cn("prose prose-stone dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="font-heading font-black tracking-tight" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="font-heading font-bold tracking-tight mt-12 mb-6" {...props} />,
                    a: ({ node, ...props }) => <a className="text-primary font-medium no-underline hover:underline transition-all" {...props} />,
                    p: ({ node, children, ...props }) => <p {...props}>{wrapText(children)}</p>,
                    li: ({ node, children, ...props }) => <li {...props}>{wrapText(children)}</li>,
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

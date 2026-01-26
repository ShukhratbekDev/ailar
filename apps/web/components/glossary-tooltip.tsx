'use client';

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GlossaryTerm {
    id: number;
    term: string;
    definition: string;
    slug: string;
}

interface GlossaryTooltipProps {
    term: string;
    definition: string;
    children: React.ReactNode;
}

export function GlossaryTooltip({ term, definition, children }: GlossaryTooltipProps) {
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-primary/40 hover:border-primary/80 hover:text-primary transition-all decoration-2 underline-offset-4 font-medium">
                        {children}
                    </span>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="max-w-[300px] p-4 bg-card/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Info className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Atama Ma&apos;nosi</span>
                        </div>
                        <h4 className="font-black text-sm text-foreground">{term}</h4>
                        <p className="text-xs leading-relaxed text-muted-foreground font-light">{definition}</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function processContentWithGlossary(content: string, terms: GlossaryTerm[]): (string | React.ReactNode)[] {
    if (!terms || terms.length === 0) return [content];

    // Build a regex that matches any of the terms (case-insensitive)
    // Sort terms by length descending to match longer phrases first
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    const pattern = sortedTerms.map(t => t.term.replace(/[.*+?^${} ()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Add preceding text
        parts.push(content.slice(lastIndex, match.index));

        const matchedText = match[0];
        const termData = sortedTerms.find(t => t.term.toLowerCase() === matchedText.toLowerCase());

        if (termData) {
            parts.push(
                <GlossaryTooltip key={match.index} term={termData.term} definition={termData.definition}>
                    {matchedText}
                </GlossaryTooltip>
            );
        } else {
            parts.push(matchedText);
        }

        lastIndex = regex.lastIndex;
    }

    parts.push(content.slice(lastIndex));
    return parts;
}

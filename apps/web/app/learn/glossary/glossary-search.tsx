'use client';

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface GlossaryTerm {
    id: number;
    term: string;
    definition: string;
    category?: string | null;
}

export function GlossarySearch({
    terms,
    onFilter
}: {
    terms: GlossaryTerm[],
    onFilter: (filtered: GlossaryTerm[]) => void
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(() => {
        if (!searchTerm) return terms;
        const lowSearch = searchTerm.toLowerCase();
        return terms.filter(t =>
            t.term.toLowerCase().includes(lowSearch) ||
            t.definition.toLowerCase().includes(lowSearch) ||
            t.category?.toLowerCase().includes(lowSearch)
        );
    }, [searchTerm, terms]);

    useEffect(() => {
        onFilter(filtered);
    }, [filtered, onFilter]);

    return (
        <div className="relative group w-full max-w-2xl mx-auto mb-16">
            {/* Background Glow Effect - Always slightly visible for better discoverability */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-30 group-focus-within:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center">
                <div className="absolute left-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                    <Search className="h-5 w-5" />
                </div>

                <Input
                    className="h-14 pl-14 pr-12 rounded-full border-primary/20 bg-background shadow-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-lg placeholder:text-muted-foreground/70"
                    placeholder="Atamalarni qidirish... (Masalan: LLM, Prompt)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 p-2 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200"
                        title="Tozalash"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Decorative bottom line - Always slightly visible */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-100 group-focus-within:via-primary transition-all duration-500" />
        </div>
    );
}

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
        <div className="relative group max-w-lg mx-auto mb-16">
            <div className="absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Atamalarni qidirish... (Masalan: LLM, Prompt)"
                className="h-14 pl-14 pr-12 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-lg placeholder:text-muted-foreground/30"
            />
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from "react";
import { GlossarySearch } from "./glossary-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Layout, Zap, Search } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "../[slug]/delete-button";
import { deleteGlossaryTerm } from "@/app/actions/education-client";
import { cn } from "@/lib/utils";

interface GlossaryTerm {
    id: number;
    term: string;
    definition: string;
    category?: string | null;
}

export function GlossaryList({
    initialTerms,
    editor
}: {
    initialTerms: GlossaryTerm[],
    editor: boolean
}) {
    const [filteredTerms, setFilteredTerms] = useState(initialTerms);

    // Group terms by first letter
    const groupedTerms: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(item => {
        const letter = item.term?.[0]?.toUpperCase() || '#';
        if (!groupedTerms[letter]) groupedTerms[letter] = [];
        groupedTerms[letter].push(item);
    });

    const letters = Object.keys(groupedTerms).sort();
    const [activeLetter, setActiveLetter] = useState<string | null>(letters[0] || null);

    // Scroll highlighting logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const letter = entry.target.id.replace('letter-', '');
                        setActiveLetter(letter);

                        // Scroll the active letter into view in the horizontal nav
                        const navButton = document.querySelector(`[href="#letter-${letter}"]`);
                        if (navButton) {
                            navButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    }
                });
            },
            {
                threshold: [0, 0.1, 0.5],
                rootMargin: '-15% 0% -70% 0%'
            }
        );

        const sections = document.querySelectorAll('section[id^="letter-"]');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [filteredTerms]);

    return (
        <>
            <GlossarySearch terms={initialTerms} onFilter={setFilteredTerms} />

            {/* Quick Filter Navigation */}
            {letters.length > 0 && (
                <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 py-4 mb-16 overflow-x-auto scrollbar-none">
                    <div className="container mx-auto px-4 flex justify-start md:justify-center items-center gap-2">
                        {letters.map(letter => (
                            <a
                                key={letter}
                                href={`#letter-${letter}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={cn(
                                    "h-10 w-10 min-w-[40px] rounded-xl border flex items-center justify-center font-black text-sm transition-all duration-300",
                                    activeLetter === letter
                                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                                        : "border-border/40 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                )}
                            >
                                {letter}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Alphabetical List */}
            <div className="container mx-auto px-4 max-w-5xl">
                {letters.length > 0 ? (
                    <div className="grid gap-20">
                        {letters.map(letter => (
                            <section key={letter} id={`letter-${letter}`} className="scroll-mt-48 transition-all duration-700">
                                <div className="flex items-center gap-6 mb-10 group/section">
                                    <h2 className={cn(
                                        "text-7xl font-black font-heading transition-all duration-500 select-none",
                                        activeLetter === letter
                                            ? "text-primary opacity-100 scale-110 translate-x-2"
                                            : "text-primary/10 dark:text-primary/40 opacity-50"
                                    )}>
                                        {letter}
                                    </h2>
                                    <div className={cn(
                                        "h-px flex-1 transition-all duration-500",
                                        activeLetter === letter
                                            ? "bg-gradient-to-r from-primary via-primary/50 to-transparent"
                                            : "bg-gradient-to-r from-border/80 to-transparent"
                                    )} />
                                </div>

                                <div className="grid gap-6">
                                    {groupedTerms[letter]!.map((item, idx) => (
                                        <div key={idx} className="group p-8 rounded-[2.5rem] bg-card/10 border border-border/40 hover:border-primary/20 hover:bg-primary/[0.01] transition-all duration-300">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                                                <div className="space-y-4 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{item.term}</h3>
                                                        {item.category && (
                                                            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold uppercase rounded-md tracking-wider">
                                                                {item.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground leading-relaxed font-light text-lg">
                                                        {item.definition}
                                                    </p>
                                                </div>

                                                <div className="flex md:flex-col items-center gap-2 shrink-0">
                                                    {editor && item.id !== 0 && (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary hover:text-white transition-all" asChild>
                                                                <Link href={`/learn/glossary/${item.id}/edit`}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <DeleteButton
                                                                id={item.id}
                                                                type="glossary"
                                                                action={deleteGlossaryTerm}
                                                            />
                                                        </>
                                                    )}
                                                    {!editor && (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary hover:text-white transition-all">
                                                                <Layout className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary hover:text-white transition-all">
                                                                <Zap className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-6">
                        <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground/30">
                            <Search className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Atama topilmadi</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">Qidiruv shartlarini o'zgartirib ko'ring yoki lug'atimizga yangi atama qo'shishni taklif qiling.</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

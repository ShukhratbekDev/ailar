'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterOption {
    label: string;
    value: string;
}

const difficulties: FilterOption[] = [
    { label: "Barchasi", value: "" },
    { label: "Boshlang'ich", value: "beginner" },
    { label: "O'rta", value: "intermediate" },
    { label: "Murakkab", value: "advanced" },
];

const languages: FilterOption[] = [
    { label: "Barchasi", value: "" },
    { label: "O'zbek", value: "uz" },
    { label: "Ingliz", value: "en" },
    { label: "Rus", value: "ru" },
];

const categories: FilterOption[] = [
    { label: "Barchasi", value: "" },
    { label: "Asoslar", value: "Asoslar" },
    { label: "Promptlar", value: "Promptlar" },
    { label: "Biznes", value: "Biznes" },
    { label: "Texnik", value: "Texnik" },
];

export function CourseFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedDifficulty = searchParams.get('difficulty') || '';
    const selectedLanguage = searchParams.get('language') || '';
    const selectedCategory = searchParams.get('category') || '';

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/learn?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    return (
        <div className="flex flex-wrap gap-8 items-center py-6 border-b border-border/40">
            <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Qiyinchilik</span>
                <div className="flex flex-wrap gap-2">
                    {difficulties.map((d) => (
                        <button
                            key={d.value}
                            onClick={() => updateFilter('difficulty', d.value)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                selectedDifficulty === d.value
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                    : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
                            )}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-10 w-px bg-border/40 hidden md:block" />

            <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Til</span>
                <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                        <button
                            key={l.value}
                            onClick={() => updateFilter('language', l.value)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                selectedLanguage === l.value
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                    : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
                            )}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-10 w-px bg-border/40 hidden md:block" />

            <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Kategoriya</span>
                <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => updateFilter('category', c.value)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                selectedCategory === c.value
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                    : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
                            )}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

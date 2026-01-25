"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useState, useEffect, useTransition } from "react";

export function PromptsSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setSearchValue(searchParams.get("search") || "");
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const current = searchParams.get("search") || "";
            if (searchValue !== current) {
                startTransition(() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (searchValue.trim()) {
                        params.set("search", searchValue.trim());
                    } else {
                        params.delete("search");
                    }
                    router.push(`/prompts?${params.toString()}`);
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, router, searchParams]);

    return (
        <div className="relative group w-full max-w-2xl">
            {/* Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-primary/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-30 group-focus-within:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center">
                <div className="absolute left-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors duration-300">
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5" />
                    )}
                </div>

                <input
                    type="text"
                    className="flex h-14 w-full rounded-full border border-purple-500/20 bg-background px-14 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/10 focus-visible:border-purple-500/50 transition-all duration-300 shadow-xl"
                    placeholder="Promptlarni izlang..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />

                {searchValue && (
                    <button
                        onClick={() => setSearchValue("")}
                        className="absolute right-4 p-2 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200"
                        title="Tozalash"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Decorative bottom line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-100 group-focus-within:via-purple-500 transition-all duration-500" />
        </div>
    );
}

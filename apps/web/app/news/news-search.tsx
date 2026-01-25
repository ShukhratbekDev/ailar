"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useState, useEffect, useTransition } from "react";

export function NewsSearch() {
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
                    if (searchValue.trim()) {
                        router.push(`/news?search=${encodeURIComponent(searchValue.trim())}`);
                    } else if (current) {
                        router.push("/news");
                    }
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, router, searchParams]);

    return (
        <div className="relative group w-full max-w-2xl">
            {/* Background Glow Effect */}
            {/* Background Glow Effect - Always slightly visible for better discoverability */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-30 group-focus-within:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center">
                <div className="absolute left-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-300">
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5" />
                    )}
                </div>

                <Input
                    className="h-14 pl-14 pr-12 rounded-full border-emerald-500/20 bg-background shadow-xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-lg placeholder:text-muted-foreground/70"
                    placeholder="Eng so'nggi yangiliklarni izlang..."
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
            {/* Decorative bottom line - Always slightly visible */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-100 group-focus-within:via-emerald-500 transition-all duration-500" />
        </div>
    );
}

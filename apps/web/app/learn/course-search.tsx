'use client';

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function CourseSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const debouncedValue = useDebounce(searchTerm, 300);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedValue) {
            params.set('q', debouncedValue);
        } else {
            params.delete('q');
        }
        const newQueryString = params.toString();

        // Prevent infinite loop by checking if params actually changed
        if (newQueryString !== searchParams.toString()) {
            router.push(`/learn?${newQueryString}`, { scroll: false });
        }
    }, [debouncedValue, router, searchParams]);

    return (
        <div className="relative group w-full max-w-2xl">
            {/* Background Glow Effect - Always slightly visible for better discoverability */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-primary/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-30 group-focus-within:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center">
                <div className="absolute left-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-300">
                    <Search className="h-5 w-5" />
                </div>

                <Input
                    className="h-14 pl-14 pr-12 rounded-full border-blue-500/20 bg-background shadow-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-lg placeholder:text-muted-foreground/70"
                    placeholder="Kurslarni qidirish..."
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
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-100 group-focus-within:via-blue-500 transition-all duration-500" />
        </div>
    );
}

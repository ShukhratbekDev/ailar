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
        <div className="relative group flex-1 max-w-md">
            <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Kurslarni qidirish..."
                className="h-12 pl-12 pr-10 bg-muted/30 border-0 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
            />
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

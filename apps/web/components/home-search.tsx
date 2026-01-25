"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeSearch() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/news?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto relative group z-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200"></div>
            <form onSubmit={handleSearch} className="relative flex items-center bg-background/80 backdrop-blur-xl rounded-xl border border-border/40 p-2 shadow-2xl">
                <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                <input
                    className="flex h-12 w-full rounded-md bg-transparent px-4 py-2 text-base placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
                    placeholder="AI yangiliklarni qidirish..."
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" size="lg" className="rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                    Izlash
                </Button>
            </form>
        </div>
    );
}

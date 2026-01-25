"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
    categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "all";

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === "all") {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        router.push(`/tools?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Badge
                variant={currentCategory === "all" ? "default" : "secondary"}
                className={cn(
                    "cursor-pointer px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95",
                    currentCategory === "all"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-muted/50 hover:bg-muted border-0"
                )}
                onClick={() => handleCategoryChange("all")}
            >
                Barchasi
            </Badge>
            {categories.map((category) => (
                <Badge
                    key={category}
                    variant={currentCategory === category ? "default" : "secondary"}
                    className={cn(
                        "cursor-pointer px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95",
                        currentCategory === category
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-muted/50 hover:bg-muted border-0"
                    )}
                    onClick={() => handleCategoryChange(category)}
                >
                    {category}
                </Badge>
            ))}
        </div>
    );
}

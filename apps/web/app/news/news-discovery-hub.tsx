"use client";

import * as React from "react";
import { NewsSearch } from "./news-search";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Topic {
    label: string;
    value: string;
    count: number;
}

interface NewsDiscoveryHubProps {
    topics: Topic[];
    currentTag?: string;
}

export function NewsDiscoveryHub({ topics, currentTag }: NewsDiscoveryHubProps) {
    const [isSticky, setIsSticky] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsSticky(offset > 300); // Threshold to become sticky
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={cn(
            "w-full transition-all duration-500 z-50",
            isSticky
                ? "fixed top-16 left-0 right-0 py-4 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-xl px-4 md:px-6 animate-in slide-in-from-top-4"
                : "relative mt-12 mb-8"
        )}>
            <div className={cn(
                "container mx-auto transition-all duration-500",
                isSticky ? "max-w-7xl" : "max-w-none"
            )}>
                <div className={cn(
                    "flex flex-col gap-6",
                    isSticky ? "flex-row items-center justify-between" : ""
                )}>
                    {/* Search Area */}
                    <div className={cn(
                        "transition-all duration-500",
                        isSticky ? "w-1/2 max-w-lg" : "w-full"
                    )}>
                        <NewsSearch size={isSticky ? "sm" : "default"} />
                    </div>

                    {/* Topics Area */}
                    <div className={cn(
                        "flex flex-col gap-3 transition-all duration-500",
                        isSticky ? "hidden xl:flex w-1/2 items-end" : "w-full"
                    )}>
                        {!isSticky && (
                            <div className="flex items-center gap-2 px-1">
                                <Hash className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mavzular</span>
                            </div>
                        )}
                        <div className={cn(
                            "flex flex-wrap items-center gap-2",
                            isSticky ? "justify-end" : ""
                        )}>
                            {topics.map((topic) => {
                                const isActive = (topic.value === 'all' && !currentTag) || currentTag === topic.value;
                                return (
                                    <Link
                                        key={topic.value}
                                        href={topic.value === 'all' ? '/news' : `/news?tag=${topic.value}`}
                                        scroll={false}
                                    >
                                        <Badge
                                            variant={isActive ? "default" : "outline"}
                                            className={cn(
                                                "rounded-full transition-all duration-300",
                                                isSticky ? "px-3 py-1 text-[10px]" : "px-4 py-1.5 text-[11px] font-bold",
                                                isActive
                                                    ? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/20 scale-105"
                                                    : "bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                                            )}
                                        >
                                            {topic.value === 'all' ? topic.label : `#${topic.label}`}
                                            <span className={cn(
                                                "ml-1.5 opacity-60 font-mono",
                                                isActive ? "text-primary-foreground" : "text-muted-foreground"
                                            )}>
                                                {topic.count}
                                            </span>
                                        </Badge>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

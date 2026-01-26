"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

import { getTools } from "@/app/actions/tools";
import { ToolLikeButton } from "@/components/tool-like-button";

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    logoUrl: string | null;
    category: string | null;
    averageRating: number | null;
    pricingType: string | null;

    tags: string[] | null;
    voteCount?: number | null;
    isLiked?: boolean;
}

interface ToolsGridProps {
    initialTools: any[];
    search?: string;
    category?: string;
    pricingType?: string;
    sortBy?: string;
}

export function ToolsGrid({
    initialTools,
    search = "",
    category = "",
    pricingType = "all",
    sortBy = "newest"
}: ToolsGridProps) {
    const [toolsList, setToolsList] = useState(initialTools);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialTools.length >= 12);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Reset when search, category, pricing, or sort changes
    useEffect(() => {
        setToolsList(initialTools);
        setPage(1);
        setHasMore(initialTools.length >= 12);
    }, [initialTools, category, pricingType, sortBy]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const nextPage = page + 1;
        const newTools = await getTools({
            page: nextPage,
            search,
            category,
            pricingType,
            sortBy
        });

        if (newTools.length === 0) {
            setHasMore(false);
        } else {
            setToolsList((prev) => [...prev, ...newTools]);
            setPage(nextPage);
            if (newTools.length < 12) {
                setHasMore(false);
            }
        }
        setLoading(false);
    }, [hasMore, loading, page, search, category, pricingType, sortBy]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0] && entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, page, search]);

    return (
        <div className="space-y-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {toolsList.map((tool) => (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} className="group block h-full">
                        <article className="flex flex-col h-full rounded-[2rem] border border-border/50 bg-card overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group/card">
                            {/* Image Part */}
                            <div className="relative aspect-video overflow-hidden bg-muted">
                                {tool.imageUrl ? (
                                    <img
                                        src={tool.imageUrl}
                                        alt={tool.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-background flex items-center justify-center p-8">
                                        {tool.logoUrl ? (
                                            <img
                                                src={tool.logoUrl}
                                                alt={tool.name}
                                                className="w-20 h-20 object-contain transition-transform duration-700 group-hover/card:scale-110 drop-shadow-2xl"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <Sparkles className="h-12 w-12 text-blue-500/20" />
                                        )}
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover/card:translate-y-0">
                                    <ToolLikeButton
                                        toolId={tool.id}
                                        initialIsLiked={!!tool.isLiked}
                                        initialCount={tool.voteCount || 0}
                                        className="bg-background/90 backdrop-blur-xl shadow-xl h-10 w-10 rounded-full border-white/20"
                                        size="icon"
                                        showCount={false}
                                    />
                                </div>

                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                                    {tool.pricingType === 'free' ? 'Bepul' :
                                        tool.pricingType === 'freemium' ? 'Freemium' : 'Pullik'}
                                </div>
                            </div>

                            {/* Content Part */}
                            <div className="flex flex-col flex-1 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-widest bg-blue-500/5 text-blue-600 dark:text-blue-400 border-0 px-2.5 py-1">
                                        {tool.category}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    {tool.logoUrl && !tool.imageUrl && (
                                        <div className="hidden shrink-0" />
                                    )}
                                    {tool.logoUrl && tool.imageUrl && (
                                        <div className="w-9 h-9 rounded-xl border border-border/50 bg-background p-1.5 shrink-0 shadow-sm flex items-center justify-center overflow-hidden">
                                            <img src={tool.logoUrl} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <h4 className="text-xl font-black leading-tight group-hover/card:text-blue-500 transition-colors line-clamp-1">
                                        {tool.name}
                                    </h4>
                                </div>

                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-light line-clamp-2">
                                    {tool.description}
                                </p>

                                {/* Tags preview if any */}
                                {tool.tags && tool.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                                        {tool.tags.slice(0, 2).map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-end pt-4 border-t border-border/40 mt-auto">
                                    <div className="flex items-center gap-1 text-blue-500 font-black text-[11px] uppercase tracking-wider group-hover/card:translate-x-1 transition-transform">
                                        Ko'rish
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* Observer target */}
            <div ref={observerTarget} className="flex justify-center py-8">
                {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Yuklanmoqda...
                    </div>
                )}
                {!hasMore && toolsList.length > 0 && (
                    <p className="text-sm text-muted-foreground">Barcha vositalar ko'rsatildi</p>
                )}
            </div>
        </div>
    );
}

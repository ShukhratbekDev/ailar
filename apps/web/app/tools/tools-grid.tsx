"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { getTools } from "@/app/actions/tools";

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
}

interface ToolsGridProps {
    initialTools: any[];
    search?: string;
    category?: string;
}

export function ToolsGrid({ initialTools, search = "", category = "" }: ToolsGridProps) {
    const [toolsList, setToolsList] = useState(initialTools);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialTools.length >= 12);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Reset when search or category changes
    useEffect(() => {
        setToolsList(initialTools);
        setPage(1);
        setHasMore(initialTools.length >= 12);
    }, [initialTools, category]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const nextPage = page + 1;
        const newTools = await getTools({ page: nextPage, search, category });

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
    }, [hasMore, loading, page, search, category]);

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
                        <Card className="flex flex-col h-full border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 overflow-hidden">
                            {/* Image */}
                            <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                {tool.imageUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={tool.imageUrl}
                                        alt={tool.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-primary/5 flex items-center justify-center p-8">
                                        {tool.logoUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={tool.logoUrl}
                                                alt={tool.name}
                                                className="w-24 h-24 object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                                            />
                                        ) : (
                                            <Sparkles className="h-12 w-12 text-blue-500/20" />
                                        )}
                                    </div>
                                )}



                            </div>

                            {/* Content */}
                            <CardHeader className="p-4 pb-3">
                                <div className="flex items-center justify-between mb-3">
                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                                        {tool.category}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    {tool.logoUrl && (
                                        <div className="w-10 h-10 rounded-xl border border-border/50 bg-background p-1.5 shrink-0 shadow-sm flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={tool.logoUrl} alt="" className="w-full h-full object-contain" loading="lazy" />
                                        </div>
                                    )}
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                                        {tool.name}
                                    </CardTitle>
                                </div>
                                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                                    {tool.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 mt-auto">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground capitalize">
                                        {tool.pricingType === 'free' ? 'Bepul' :
                                            tool.pricingType === 'freemium' ? 'Freemium' : 'Pullik'}
                                    </span>
                                    <div className="flex items-center gap-1 text-primary font-medium">
                                        Batafsil
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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

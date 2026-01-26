import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Sparkles, X, Bot, Plus } from "lucide-react";

import { isEditor } from "@/lib/auth";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ToolsSearch } from "./tools-search";
import { ToolsGrid } from "./tools-grid";
import { CategoryFilter } from "./category-filter";

export default async function ToolsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string }>;
}) {
    const userIsEditor = await isEditor();
    const { search, category } = await searchParams;

    // Fetch all published tools for initial list and categories
    const publishedTools = await db.select().from(tools)
        .where(eq(tools.status, 'published'))
        .orderBy(desc(tools.createdAt));

    // Get unique categories for the filter
    const categories = Array.from(new Set(publishedTools.map(t => t.category).filter(Boolean))) as string[];

    let allTools = [...publishedTools];

    // Apply category filtering
    if (category && category !== "all") {
        allTools = allTools.filter(tool =>
            tool.category?.toLowerCase() === category.toLowerCase()
        );
    }

    // Client-side filtering for tags (since tags are JSON array)
    if (search) {
        const searchLower = search.toLowerCase();
        allTools = allTools.filter(tool =>
            tool.name?.toLowerCase().includes(searchLower) ||
            tool.description?.toLowerCase().includes(searchLower) ||
            tool.category?.toLowerCase().includes(searchLower) ||
            tool.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }

    const initialTools = allTools.slice(0, 12);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-[80px] md:blur-[120px] xl:-top-6 animate-pulse-glow will-change-opacity">
                    <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-500/20 via-purple-500/10 to-primary/20 animate-gradient-shift will-change-transform" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>
                <div className="absolute right-1/4 top-1/4 h-64 w-64 md:h-96 md:w-96 rounded-full bg-blue-500/5 blur-3xl animate-float will-change-transform" />
            </div>

            {/* Hero Section */}
            <div className="relative border-b border-border/40 pt-8">
                <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <div className="flex items-center justify-between w-full">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                <Bot className="h-3.5 w-3.5" />
                                AI Vositalar
                            </div>

                            {userIsEditor && (
                                <Link href="/tools/new">
                                    <Button size="sm" className="h-8 px-4 gap-2 rounded-full font-bold text-[11px] uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg border-0">
                                        <Plus className="h-4 w-4" />
                                        Yangi Vosita
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="space-y-6 max-w-3xl">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight px-1">
                                AI Vositalar{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-primary animate-gradient-shift">
                                    To'plami
                                </span>
                            </h1>
                            <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl px-1">
                                Eng yaxshi sun'iy intellekt vositalari — bir joyda. Ishingizni osonlashtiruvchi to'g'ri vositani toping.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-4xl mx-auto">
                            {/* Search Bar */}
                            <div className="flex w-full justify-center">
                                <ToolsSearch />
                            </div>

                            {/* Category Filters */}
                            <div className="flex flex-col items-center gap-4 w-full">
                                <CategoryFilter categories={categories} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="space-y-8">
                    {initialTools.length > 0 ? (
                        <ToolsGrid initialTools={initialTools} search={search} category={category} />
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-border/40 bg-card/10 backdrop-blur-sm">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold">Hech narsa topilmadi</p>
                                <p className="text-muted-foreground max-w-md mx-auto">Siz qidirayotgan vosita hozircha mavjud emas. Qidiruv so'zini o'zgartirib ko'ring.</p>
                            </div>
                            {userIsEditor && (
                                <Link href="/tools/new">
                                    <Button variant="outline" className="mt-4 rounded-full px-8 py-6 border-blue-500/20 hover:bg-blue-500/10">
                                        Birinchi vositani qo'shish
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

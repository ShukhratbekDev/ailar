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
import { getTools } from "@/app/actions/tools";
import { cn } from "@/lib/utils";

export default async function ToolsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; pricing?: string; sort?: string }>;
}) {
    const userIsEditor = await isEditor();
    const { search, category, pricing, sort } = await searchParams;

    // Fetch all tools to calculate counts
    const publishedTools = await db.select().from(tools)
        .where(eq(tools.status, 'published'));

    // Category counts logic
    const categoryCounts = publishedTools.reduce((acc, item) => {
        if (item.category) {
            acc[item.category] = (acc[item.category] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // Fetch current tools based on filters
    const initialToolsData = await getTools({
        search: search || "",
        category: category || "all",
        pricingType: pricing || "all",
        sortBy: sort || "newest",
        limit: 12
    });

    const gridTools = initialToolsData;

    const categories = Array.from(new Set(publishedTools.map(t => t.category).filter(Boolean))) as string[];
    const categoryPairs = categories.map(c => ({ name: c, count: categoryCounts[c] || 0 }));

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
            <div className="relative border-b border-border/40 pt-24 pb-12 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col gap-8 animate-fade-in-up">
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

                        <div className="space-y-6">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight px-1 text-left">
                                AI Vositalar{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-primary animate-gradient-shift">
                                    To'plami
                                </span>
                            </h1>
                            <p className="text-base md:text-xl text-muted-foreground leading-relaxed px-1">
                                Eng yaxshi sun'iy intellekt vositalari — bir joyda. Ishingizni osonlashtiruvchi to'g'ri vositani toping.
                            </p>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Topic Hub (Categories with Counts) */}
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center gap-2 px-1">
                                    <Sparkles className="h-3 w-3 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Kategoriyalar</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link href="/tools" scroll={false}>
                                        <Badge
                                            variant={(!category || category === 'all') ? "default" : "outline"}
                                            className={cn(
                                                "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium cursor-pointer transition-all",
                                                (!category || category === 'all')
                                                    ? "bg-foreground text-background shadow-md transform scale-105 hover:bg-foreground/90"
                                                    : "bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                                            )}
                                        >
                                            Hammasi ({publishedTools.length})
                                        </Badge>
                                    </Link>
                                    {categoryPairs.map((cat) => {
                                        const isActive = category === cat.name;
                                        return (
                                            <Link
                                                key={cat.name}
                                                href={`/tools?category=${encodeURIComponent(cat.name)}`}
                                                scroll={false}
                                            >
                                                <Badge
                                                    variant={isActive ? "default" : "outline"}
                                                    className={cn(
                                                        "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium cursor-pointer transition-all",
                                                        isActive
                                                            ? "bg-blue-600 text-white shadow-md transform scale-105 hover:bg-blue-700"
                                                            : "bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                                                    )}
                                                >
                                                    {cat.name} ({cat.count})
                                                </Badge>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 w-full">
                                <div className="flex flex-wrap items-center gap-x-12 gap-y-7">
                                    {/* Pricing Filter Group */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">To'lov turi</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/30 rounded-2xl border border-border/40 w-fit">
                                            {[
                                                { id: 'all', label: 'Barchasi' },
                                                { id: 'free', label: 'Bepul' },
                                                { id: 'freemium', label: 'Freemium' },
                                                { id: 'paid', label: 'Pullik' }
                                            ].map(p => (
                                                <Link
                                                    key={p.id}
                                                    href={`/tools?${new URLSearchParams({
                                                        ...(search && { search }),
                                                        ...(category && { category }),
                                                        pricing: p.id,
                                                        ...(sort && { sort })
                                                    }).toString()}`}
                                                    className={cn(
                                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                                                        (pricing === p.id || (!pricing && p.id === 'all'))
                                                            ? "bg-background text-foreground shadow-sm"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                    )}
                                                >
                                                    {p.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort Filter Group */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Saralash</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/30 rounded-2xl border border-border/40 w-fit">
                                            {[
                                                { id: 'newest', label: 'Yangilar' },
                                                { id: 'popular', label: 'Mashhur' },
                                                { id: 'views', label: 'Ko\'rib' }
                                            ].map(s => (
                                                <Link
                                                    key={s.id}
                                                    href={`/tools?${new URLSearchParams({
                                                        ...(search && { search }),
                                                        ...(category && { category }),
                                                        ...(pricing && { pricing }),
                                                        sort: s.id
                                                    }).toString()}`}
                                                    className={cn(
                                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                                        (sort === s.id || (!sort && s.id === 'newest'))
                                                            ? "bg-background text-foreground shadow-sm"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                    )}
                                                >
                                                    {s.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <ToolsSearch />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">


                <div className="space-y-12">
                    {/* Header for grid when filtered */}
                    {(search || (category && category !== 'all')) && (
                        <div className="flex items-center justify-between pb-4 border-b border-border/40">
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                {search ? `Qidiruv: "${search}"` : `#${category}`}
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{gridTools.length} ta natija</span>
                            </h3>
                            <Link href="/tools" className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                Tozalash <X className="h-4 w-4" />
                            </Link>
                        </div>
                    )}

                    {gridTools.length > 0 ? (
                        <ToolsGrid
                            initialTools={gridTools}
                            search={search}
                            category={category}
                            pricingType={pricing}
                            sortBy={sort}
                        />
                    ) : (
                        <div className="col-span-full py-32 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-border/40 bg-card/5 backdrop-blur-sm">
                            <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Search className="h-10 w-10 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-3xl font-black">Natija yo'q</p>
                                <p className="text-muted-foreground max-w-md mx-auto font-light">Siz qidirayotgan vosita hozircha mavjud emas yoki filterlarga mos kelmadi.</p>
                            </div>
                            <Link href="/tools">
                                <Button variant="outline" className="mt-8 rounded-full px-10 h-14 font-black border-blue-500/20 hover:bg-blue-500/10">
                                    Qidiruvni tozalash
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, Sparkles, Code, Palette, GraduationCap, Briefcase, TrendingUp, Plus } from "lucide-react";

import { isEditor } from "@/lib/auth";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PromptsSearch } from "./prompts-search";
import { PromptCard } from "./prompt-card";

export default async function PromptsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string }>;
}) {
    const userIsEditor = await isEditor();
    const { search, category } = await searchParams;

    // Fetch alerts/prompts from DB
    const allPrompts = await db.select().from(prompts)
        .orderBy(desc(prompts.createdAt));

    // Filtering logic
    let filteredPrompts = [...allPrompts];

    if (category && category !== "Barchasi") {
        filteredPrompts = filteredPrompts.filter(p => p.category === category);
    }

    if (search) {
        const searchLower = search.toLowerCase();
        filteredPrompts = filteredPrompts.filter(p =>
            p.title?.toLowerCase().includes(searchLower) ||
            p.prompt?.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.category?.toLowerCase().includes(searchLower)
        );
    }

    const categories = [
        { name: "Barchasi", icon: Sparkles },
        { name: "Dasturlash", icon: Code },
        { name: "Marketing", icon: TrendingUp },
        { name: "Dizayn", icon: Palette },
        { name: "Ta'lim", icon: GraduationCap },
        { name: "Biznes", icon: Briefcase },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-[80px] md:blur-[120px] xl:-top-6 animate-pulse-glow will-change-opacity">
                    <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-purple-500/20 via-primary/10 to-blue-600/20 animate-gradient-shift will-change-transform" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative border-b border-border/40 pt-8">
                <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <div className="flex items-center justify-between w-full">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold text-nowrap">
                                <Terminal className="h-3.5 w-3.5" />
                                AI Promptlar
                            </div>

                            {userIsEditor && (
                                <Link href="/prompts/new">
                                    <Button size="sm" className="h-8 px-4 gap-2 rounded-full font-bold text-[11px] uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md hover:shadow-lg border-0 shrink-0">
                                        <Plus className="h-4 w-4" />
                                        Yangi Prompt
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="space-y-6 max-w-3xl">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight px-1">
                                Prompt{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-primary to-blue-600 animate-gradient-shift">
                                    Kutubxonasi
                                </span>
                            </h1>
                            <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl px-1">
                                Turli AI modellari uchun professional darajadagi tayyor promptlar. Vaqtingizni tejang va samaradorlikni oshiring.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-4xl mx-auto">
                            {/* Search Bar */}
                            <div className="flex w-full justify-center">
                                <PromptsSearch />
                            </div>

                            {/* Categories */}
                            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = (category || "Barchasi") === cat.name;
                                    return (
                                        <Link
                                            key={cat.name}
                                            href={`/prompts?category=${cat.name}${search ? `&search=${search}` : ""}`}
                                        >
                                            <Button
                                                variant={isActive ? "default" : "outline"}
                                                size="sm"
                                                className={`rounded-full gap-2 transition-all ${isActive ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/5'}`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">{cat.name}</span>
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPrompts.length > 0 ? (
                        filteredPrompts.map((prompt) => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-border/40 bg-card/10 backdrop-blur-sm">
                            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Terminal className="h-10 w-10 text-purple-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold">Hech narsa topilmadi</p>
                                <p className="text-muted-foreground max-w-md mx-auto">Siz qidirayotgan prompt hozircha mavjud emas. Qidiruv so'zini o'zgartirib ko'ring.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Bot, Newspaper, Terminal, Send, ArrowRight, Zap, Sparkles, TrendingUp, Calendar, ChevronRight, Heart } from "lucide-react";
import { HomeSearch } from "@/components/home-search";
import { AilarLogo } from "@/components/logo";
import { db } from "@/db";
import { news } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function Home() {
    // Fetch latest news
    const latestNews = await db.select().from(news)
        .where(eq(news.status, 'published'))
        .orderBy(desc(news.publishedAt))
        .limit(3);

    return (
        <main className="flex min-h-screen flex-col overflow-hidden relative">
            {/* Animated Ambient Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Animated gradient blobs - Optimized for performance */}
                <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-[80px] md:blur-[120px] xl:-top-6 animate-pulse-glow will-change-opacity" aria-hidden="true">
                    <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary/20 via-purple-500/10 to-blue-600/20 animate-gradient-shift will-change-transform" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>

                {/* Floating orbs - Simplified for performance */}
                <div className="absolute right-1/4 top-1/4 h-64 w-64 md:h-96 md:w-96 rounded-full bg-blue-500/5 blur-3xl animate-float will-change-transform" />
                <div className="absolute left-1/4 bottom-1/4 h-48 w-48 md:h-80 md:w-80 rounded-full bg-purple-500/5 blur-3xl animate-float-slow will-change-transform" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto animate-fade-in-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/30 px-4 py-1.5 text-sm font-medium backdrop-blur-sm hover:bg-muted/50 transition-colors">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-muted-foreground">O'zbek tilidagi #1 AI Portal</span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-6">
                        <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-balance px-2">
                            AI Dunyosi{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600 animate-gradient-shift">
                                O'zbek Tilida
                            </span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-base md:text-xl text-muted-foreground leading-relaxed px-4">
                            Eng yaxshi AI vositalar, so'nggi yangiliklar va professional promptlar — barchasi bir platformada.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="w-full max-w-2xl pt-4">
                        <HomeSearch />
                        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
                            <span className="text-muted-foreground/60">Mashhur:</span>
                            {['ChatGPT', 'Midjourney', 'Claude', 'Gemini'].map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-muted/50 hover:bg-muted border-0 cursor-pointer transition-colors">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 md:gap-16 pt-8 w-full max-w-3xl">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-foreground">500+</div>
                            <div className="text-sm text-muted-foreground mt-1">AI Vositalar</div>
                        </div>
                        <div className="text-center border-x border-border/40">
                            <div className="text-3xl md:text-4xl font-bold text-foreground">1000+</div>
                            <div className="text-sm text-muted-foreground mt-1">Promptlar</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-foreground">100+</div>
                            <div className="text-sm text-muted-foreground mt-1">Yangiliklar</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container px-4 md:px-6 py-16 md:py-24 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* AI Tools Card */}
                    <Link href="/tools" className="group block lg:col-span-2">
                        <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/5 via-background to-background border border-border/50 p-10 flex flex-col justify-between hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />
                            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity group-hover:animate-float">
                                <Bot className="h-80 w-80" />
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    <Bot className="h-3.5 w-3.5" />
                                    Vositalar
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">AI Vositalar</h3>
                                    <p className="text-muted-foreground text-sm sm:text-lg max-w-md">
                                        Ishingizni osonlashtiruvchi 500+ sun'iy intellekt vositalarini kashf eting.
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                                Ko'rish <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>

                    {/* Prompts Card */}
                    <Link href="/prompts" className="group block">
                        <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/5 via-background to-background border border-border/50 p-10 flex flex-col justify-between hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_60%)]" />
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity group-hover:animate-float-slow">
                                <Terminal className="h-64 w-64 -rotate-12" />
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    <Terminal className="h-3.5 w-3.5" />
                                    Promptlar
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Promptlar</h3>
                                    <p className="text-muted-foreground text-sm sm:text-base">
                                        Professional darajadagi tayyor buyruqlar to'plami.
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                                Ko'rish <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>

                    {/* News Card */}
                    <Link href="/news" className="group block lg:col-span-3">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/5 via-background to-background border border-border/50 p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 min-h-[200px]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center_left,rgba(16,185,129,0.08),transparent_60%)]" />
                            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity group-hover:animate-float">
                                <Newspaper className="h-80 w-80" />
                            </div>

                            <div className="relative z-10 space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <Newspaper className="h-3.5 w-3.5" />
                                    Yangiliklar
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">So'nggi Yangiliklar</h3>
                                    <p className="text-muted-foreground text-sm sm:text-lg">
                                        AI dunyosidagi eng muhim voqealar va yangiliklar.
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                                Barchasini ko'rish <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Latest News Section */}
            {latestNews.length > 0 && (
                <section className="container px-4 md:px-6 py-16 md:py-24 mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Oxirgi Yangiliklar</h2>
                        <Button variant="ghost" asChild className="group">
                            <Link href="/news">
                                Barchasi <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {latestNews.map((item) => (
                            <Link key={item.id} href={`/news/${item.slug}`} className="group block h-full">
                                <article className="flex flex-col h-full rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-border transition-all duration-300 hover:shadow-lg">
                                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                                        <img
                                            src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/500`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {item.publishedAt ? format(new Date(item.publishedAt), 'd MMM yyyy', { locale: uz }) : ''}
                                                <span>•</span>
                                                <span>{item.readTime || 3} daqiqa</span>
                                            </div>
                                            {Number(item.likeCount) > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                                                    <Heart className="h-3 w-3 fill-current" />
                                                    {item.likeCount}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                            {item.description}
                                        </p>
                                        <div className="mt-auto flex items-center text-sm font-medium text-primary">
                                            O'qish <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="container px-4 md:px-6 py-16 md:py-24 mx-auto">
                <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-12 md:p-20 text-center">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-8">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-background/10 backdrop-blur-sm border border-white/10">
                            <Send className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                            Telegram Kanalimizga Qo'shiling
                        </h2>
                        <p className="text-lg text-background/70">
                            Eng so'nggi yangiliklar va eksklyuziv kontentlar uchun kanalimizga a'zo bo'ling.
                        </p>
                        <Button
                            size="lg"
                            className="h-12 px-8 rounded-full bg-background text-foreground hover:bg-background/90 font-semibold"
                            asChild
                        >
                            <Link href="https://t.me/ailar_uz" target="_blank">
                                A'zo Bo'lish
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}

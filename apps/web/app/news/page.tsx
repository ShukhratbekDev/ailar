import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Heart, Sparkles, TrendingUp, Zap, Plus, ChevronRight, Newspaper, Search } from "lucide-react";
import { db } from "@/db";
import { news } from "@/db/schema";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { isEditor } from "@/lib/auth";
import { NewsSearch } from "./news-search";
import { X } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const { search } = await searchParams;

    const allNewsItems = await db.query.news.findMany({
        orderBy: [desc(news.publishedAt)],
        where: (news, { eq }) => eq(news.status, 'published')
    });

    let filteredNews = [...allNewsItems];

    if (search) {
        const searchLower = search.toLowerCase();
        filteredNews = allNewsItems.filter(item =>
            item.title?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.content?.toLowerCase().includes(searchLower) ||
            item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }

    const isUserEditor = await isEditor();
    const featuredPost = filteredNews.find((p) => p.isFeatured) || (search ? null : filteredNews[0]);
    const otherPosts = filteredNews.filter((p) => p.id !== featuredPost?.id);

    return (
        <div className="min-h-screen bg-background">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6 animate-pulse-glow">
                    <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-emerald-500 via-blue-500 to-purple-600 opacity-[0.12] animate-gradient-shift" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>
                <div className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-float" />
            </div>

            {/* Hero Header */}
            <div className="relative border-b border-border/40">
                <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                    <Newspaper className="h-3.5 w-3.5" />
                                    AI Yangiliklar
                                </div>

                                {isUserEditor && (
                                    <Link href="/news/new">
                                        <Button size="sm" className="h-8 px-4 gap-2 rounded-full font-bold text-[11px] uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg border-0">
                                            <Plus className="h-4 w-4" />
                                            Yangi Maqola
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="space-y-6 max-w-3xl">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                                    So'nggi{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 animate-gradient-shift">
                                        Yangiliklar
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                    Sun'iy intellekt dunyosidagi eng muhim voqealar, tahlillar va ekspertlar fikrlari.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-4xl mx-auto">
                        {/* Search Bar */}
                        <NewsSearch />

                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
                {/* Featured Post */}
                {featuredPost && (
                    <section className="animate-fade-in">
                        <Link href={`/news/${featuredPost.slug}`} className="group block">
                            <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl">
                                <div className="grid lg:grid-cols-2 gap-0">
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden bg-muted">
                                        <img
                                            src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/1200/800`}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 px-3 py-1.5 text-sm font-semibold shadow-lg">
                                                Asosiy
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 md:p-10 flex flex-col justify-center">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {featuredPost.publishedAt ? format(new Date(featuredPost.publishedAt), 'd MMMM yyyy', { locale: uz }) : ''}
                                                <span>•</span>
                                                <Clock className="h-4 w-4" />
                                                {featuredPost.readTime || 3} daqiqa
                                                {Number(featuredPost.likeCount) > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                                                            <Heart className="h-4 w-4 fill-current" />
                                                            {featuredPost.likeCount}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight group-hover:text-emerald-500 transition-colors">
                                                {featuredPost.title}
                                            </h2>

                                            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3">
                                                {featuredPost.description}
                                            </p>

                                            <div className="flex items-center gap-2 text-primary font-semibold pt-4">
                                                Batafsil o'qish
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Latest News Grid */}
                {otherPosts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {search ? "Qidiruv natijalari" : "Oxirgi Yangiliklar"}
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherPosts.map((post) => (
                                <Link key={post.id} href={`/news/${post.slug}`} className="group block h-full">
                                    <article className="flex flex-col h-full rounded-3xl border border-border/50 bg-card overflow-hidden hover:border-border hover:shadow-xl transition-all duration-300">
                                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                                            <img
                                                src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/500`}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-lg border border-border/50">
                                                {post.readTime || 3} min
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-1 p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {post.publishedAt ? format(new Date(post.publishedAt), 'd MMM yyyy', { locale: uz }) : ''}
                                                </div>
                                                {Number(post.likeCount) > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">
                                                        <Heart className="h-3 w-3 fill-current" />
                                                        {post.likeCount}
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="text-xl font-semibold mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>

                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                                                {post.description}
                                            </p>

                                            <div className="mt-auto flex items-center text-sm font-medium text-primary">
                                                O'qish
                                                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!featuredPost && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
                            <Search className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {search ? "Hech narsa topilmadi" : "Yangiliklar yo'q"}
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                            {search
                                ? `"${search}" bo'yicha hech qanday yangilik topilmadi. Qidiruv so'zini o'zgartirib ko'ring.`
                                : "Hozircha hech qanday yangilik chop etilmagan. Tez orada qiziqarli maqolalar paydo bo'ladi."
                            }
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Heart, Plus, ChevronRight, Newspaper, Search, ChevronLeft, Hash } from "lucide-react";
import { db } from "@/db";
import { news } from "@/db/schema";
import { desc, eq, sql, and, arrayContains } from "drizzle-orm";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { isEditor } from "@/lib/auth";
import { NewsSearch } from "./news-search";
import { POPULAR_TOPICS } from "./news-topics";
import { NewsLikeButton } from "@/components/news-like-button";
import { newsLikes } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export default async function NewsPage(props: {
    searchParams: Promise<{ search?: string; page?: string; tag?: string }>;
}) {
    const searchParams = await props.searchParams;
    const search = searchParams.search;
    const page = Number(searchParams.page) || 1;
    const tag = searchParams.tag;
    const limit = 9;
    const offset = (page - 1) * limit;

    // Fetch all published news items to perform flexible filtering and pagination in-memory
    const allPublishedNews = await db.select().from(news)
        .where(eq(news.status, 'published'))
        .orderBy(desc(news.publishedAt));

    const { userId } = await auth();
    let userLikes: number[] = [];
    if (userId) {
        const likes = await db.select({ newsId: newsLikes.newsId })
            .from(newsLikes)
            .where(eq(newsLikes.userId, userId));
        userLikes = likes.map(l => l.newsId);
    }

    const newsWithLikes = allPublishedNews.map(item => ({
        ...item,
        isLiked: userLikes.includes(item.id)
    }));

    // Calculate tag counts for the sidebar/hub
    const tagCounts = allPublishedNews.reduce((acc, item) => {
        item.tags?.forEach(t => {
            const lower = t.toLowerCase();
            acc[lower] = (acc[lower] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const topicsWithCounts = POPULAR_TOPICS.map(topic => ({
        ...topic,
        count: topic.value === 'all' ? newsWithLikes.length : (tagCounts[topic.value] || 0)
    }));

    let filteredItems = newsWithLikes;

    // Tag filter (case-insensitive)
    if (tag && tag !== 'all') {
        const tagLower = tag.toLowerCase();
        filteredItems = filteredItems.filter(item =>
            item.tags?.some((t: string) => t.toLowerCase() === tagLower)
        );
    }

    if (search) {
        const searchLower = search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
            item.title?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.tags?.some((t: string) => t.toLowerCase().includes(searchLower))
        );
    }

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / limit);

    const paginatedItems = filteredItems.slice(offset, offset + limit);

    const isUserEditor = await isEditor();

    // Featured logic: First item of page 1 if no search/filter, or use isFeatured flag
    const featuredPost = (page === 1 && !search && !tag)
        ? (paginatedItems.find(p => p.isFeatured) || paginatedItems[0])
        : null;

    // If we have a featured post, filter it out from the grid list so it doesn't duplicate
    // But ONLY if we are showing it as a Hero.
    const gridItems = featuredPost
        ? paginatedItems.filter(p => p.id !== featuredPost.id)
        : paginatedItems;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-[80px] md:blur-[120px] xl:-top-6 animate-pulse-glow">
                    <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-emerald-500/10 via-blue-500/5 to-purple-600/10 animate-gradient-shift" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
                </div>
            </div>

            {/* Hero Header */}
            <div className="relative border-b border-border/40 pt-24 pb-12 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col gap-6 animate-fade-in-up">
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

                        <div className="flex flex-col gap-10 mt-4">
                            <div className="space-y-4 max-w-4xl">
                                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight px-1 text-left">
                                    So'nggi{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 animate-gradient-shift">
                                        Yangiliklar
                                    </span>
                                </h1>
                                <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl px-1">
                                    Sun'iy intellekt dunyosidagi eng muhim voqealar, tahlillar va ekspertlar fikrlari.
                                </p>
                            </div>

                            {/* Topic Filters - Under Heading */}
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center gap-2 px-1">
                                    <Hash className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mavzular</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {topicsWithCounts.map((topic) => {
                                        const isActive = (topic.value === 'all' && !tag) || tag === topic.value;
                                        return (
                                            <Link
                                                key={topic.value}
                                                href={topic.value === 'all' ? '/news' : `/news?tag=${topic.value}`}
                                                scroll={false}
                                            >
                                                <Badge
                                                    variant={isActive ? "default" : "outline"}
                                                    className={`
                                                        whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium cursor-pointer transition-all
                                                        ${isActive
                                                            ? "bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-md transform scale-105"
                                                            : "bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50 hover:border-border"}
                                                    `}
                                                >
                                                    {topic.value === 'all' ? topic.label : `#${topic.label}`}
                                                </Badge>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="w-full">
                                <NewsSearch />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-6 py-12 space-y-16">
                {/* Featured Post */}
                {featuredPost && (
                    <section className="animate-fade-in">
                        <Link href={`/news/${featuredPost.slug}`} className="group block">
                            <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl group/featured">
                                <div className="grid lg:grid-cols-2 gap-0">
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden bg-muted">
                                        <img
                                            src={featuredPost.imageUrl || `https://picsum.photos/seed/${featuredPost.id}/1200/800`}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 px-3 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-md">
                                                Asosiy
                                            </Badge>
                                        </div>
                                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/featured:opacity-100 transition-opacity">
                                            <NewsLikeButton
                                                newsId={featuredPost.id}
                                                initialIsLiked={!!featuredPost.isLiked}
                                                initialCount={featuredPost.likeCount || 0}
                                                className="bg-background/90 backdrop-blur-sm shadow-sm h-10 w-10 border-0"
                                                size="icon"
                                                showCount={false}
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 sm:p-10 flex flex-col justify-center">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {featuredPost.publishedAt ? format(new Date(featuredPost.publishedAt), 'd MMM yyyy', { locale: uz }) : ''}
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {featuredPost.readTime || 3} daqiqa
                                                </div>
                                            </div>

                                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] group-hover:text-emerald-500 transition-colors">
                                                {featuredPost.title}
                                            </h2>

                                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-3">
                                                {featuredPost.description}
                                            </p>

                                            {featuredPost.tags && featuredPost.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {featuredPost.tags.slice(0, 3).map(t => (
                                                        <span key={t} className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-primary font-bold pt-4">
                                                Batafsil o'qish
                                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Latest News Grid */}
                {gridItems.length > 0 ? (
                    <section>
                        {!featuredPost && (
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    {search ? `Qidiruv: "${search}"` : (tag ? `#${tag}` : "Barcha Yangiliklar")}
                                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{totalItems}</span>
                                </h3>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gridItems.map((post) => (
                                <Link key={post.id} href={`/news/${post.slug}`} className="group block h-full">
                                    <article className="flex flex-col h-full rounded-3xl border border-border/50 bg-card overflow-hidden hover:border-border hover:shadow-xl transition-all duration-300 group/card">
                                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                                            <img
                                                src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/500`}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                <NewsLikeButton
                                                    newsId={post.id}
                                                    initialIsLiked={!!post.isLiked}
                                                    initialCount={post.likeCount || 0}
                                                    className="bg-background/90 backdrop-blur-sm shadow-sm h-8 w-8 border-0"
                                                    size="icon"
                                                    showCount={false}
                                                />
                                            </div>
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
                                                {post.readTime || 3} daq
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-1 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                    <Calendar className="h-3 w-3" />
                                                    {post.publishedAt ? format(new Date(post.publishedAt), 'd MMM', { locale: uz }) : ''}
                                                </div>
                                            </div>

                                            <h4 className="text-xl font-bold mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>

                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed font-light">
                                                {post.description}
                                            </p>

                                            {/* Tags preview */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                                                    {post.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-0.5 rounded-md transition-colors">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center gap-2">
                                <Link
                                    href={page > 1 ? `/news?page=${page - 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}` : '#'}
                                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                >
                                    <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-border/50">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </Link>

                                <div className="text-sm font-medium text-muted-foreground">
                                    Sahifa {page} / {totalPages}
                                </div>

                                <Link
                                    href={page < totalPages ? `/news?page=${page + 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}` : '#'}
                                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                                >
                                    <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-border/50">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </section>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Search className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {(search || tag) ? "Hech narsa topilmadi" : "Yangiliklar yo'q"}
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            {(search || tag)
                                ? `Sizning so'rovingiz bo'yicha hech qanday maqola topilmadi. Qidiruv so'zlarini o'zgartirib ko'ring.`
                                : "Hozircha hech qanday yangilik chop etilmagan. Tez orada yangi maqolalar qo'shiladi."
                            }
                        </p>
                        {(search || tag) && (
                            <Link href="/news" className="mt-6">
                                <Button variant="secondary" className="rounded-full px-6 font-bold">
                                    Filtrlarni tozalash
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

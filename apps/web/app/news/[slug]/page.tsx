import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Calendar, ChevronRight, Share2, Sparkles, User, Tag, ArrowUpRight, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FloatingActionBar, ScrollProgress, SocialShare, ArticleActions, NewsViewTracker } from './client-components';
import { MarkdownPreview } from '@/components/markdown-preview';
import { db } from '@/db';
import { news } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { auth } from '@clerk/nextjs/server';
import { newsLikes } from '@/db/schema';
import { and } from 'drizzle-orm';

interface NewsPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(props: NewsPageProps): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;
    const post = await db.query.news.findFirst({
        where: eq(news.slug, slug),
    });

    if (!post) {
        return {
            title: "Yangilik topilmadi",
            description: "Qidirilayotgan yangilik topilmadi.",
        };
    }

    return {
        title: post.title,
        description: post.description || post.title,
        openGraph: {
            title: post.title,
            description: post.description || post.title,
            images: post.imageUrl ? [post.imageUrl] : [],
        },
    };
}

export default async function NewsPage(props: NewsPageProps) {
    const params = await props.params;
    const { slug } = params;

    const dbPost = await db.query.news.findFirst({
        where: eq(news.slug, slug),
        with: {
            author: true
        }
    });

    const { userId } = await auth();
    let hasLiked = false;

    if (userId && dbPost) {
        const like = await db.query.newsLikes.findFirst({
            where: and(
                eq(newsLikes.newsId, dbPost.id),
                eq(newsLikes.userId, userId)
            )
        });
        hasLiked = !!like;
    }

    if (!dbPost) {
        notFound();
    }

    const post = {
        ...dbPost,
        author: {
            name: dbPost.author?.fullName || dbPost.author?.email || 'Tahririyat',
            avatar: dbPost.author?.imageUrl || '',
            role: 'AI Tahlilchi'
        },
        tags: dbPost.tags || [],
        readTime: dbPost.readTime || '3',
        likes: dbPost.likeCount || 0,
        viewCount: dbPost.viewCount || 0,
        imageUrl: dbPost.imageUrl || '',
        sourceUrl: dbPost.sourceUrl || '#',
        content: dbPost.content || '',
        publishedAt: dbPost.publishedAt
    };

    const formattedDate = post.publishedAt
        ? format(new Date(post.publishedAt), "d MMM, yyyy", { locale: uz })
        : "Sana belgilanmagan";

    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ailar.uz"}/news/${post.slug}`;

    return (
        <main className="min-h-screen bg-background text-foreground pb-32 relative selection:bg-primary/20">
            <NewsViewTracker newsId={post.id} />
            <ScrollProgress />
            <FloatingActionBar url={fullUrl} title={post.title} newsId={post.id} initialLikes={post.likes} hasLiked={hasLiked} />

            {/* Navbar Placeholder (Back Button) */}
            <div className="fixed top-24 left-0 w-full z-40 px-6 md:px-8 flex justify-between items-start pointer-events-none">
                <Link href="/news" className="pointer-events-auto group inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-foreground transition-all bg-background/90 backdrop-blur-xl border border-border/50 rounded-full hover:shadow-lg shadow-sm">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Content Container */}
            <div className="container max-w-7xl mx-auto px-4 pt-4 md:pt-8">

                {/* Header Section */}
                <header className="max-w-5xl md:max-w-6xl mb-10">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8 animate-fade-in-up [animation-delay:100ms]">
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border-0">
                                Yangiliklar
                            </Badge>
                            <span className="text-muted-foreground/40 text-xs">|</span>
                            <span className="text-sm font-medium text-muted-foreground">{formattedDate}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{Math.round(Number(post.readTime))} daqiqa o'qish</span>
                            </div>
                            <span className="text-border">|</span>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <span>{post.viewCount}</span>
                            </div>
                            {post.likes > 0 && (
                                <>
                                    <span className="text-border">|</span>
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                                        <span>{post.likes}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black font-heading tracking-tight leading-[1.05] text-balance mb-10 max-w-5xl">
                        {post.title}
                    </h1>


                </header>
            </div>

            {/* Hero Image - Full Width Window */}
            <div className="w-full relative aspect-video md:aspect-[21/9] animate-fade-in-up [animation-delay:200ms] mb-12 md:mb-16">
                {post.imageUrl ? (
                    <>
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            quality={90}
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </>
                ) : (
                    <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-muted-foreground/20 animate-pulse" />
                    </div>
                )}
            </div>

            <div className="container max-w-7xl mx-auto px-4">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left Sidebar (Desktop - Digest/TOC type) */}
                    <div className="hidden lg:block lg:col-span-3 space-y-8">
                        <div className="sticky top-32 space-y-8">
                            {/* Author Block */}
                            <div className="space-y-4 pb-8 border-b border-border/50">

                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-1 ring-border">
                                        <AvatarImage src={post.author.avatar} />
                                        <AvatarFallback className="bg-muted font-bold">{post.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold leading-tight">{post.author.name}</span>
                                        <span className="text-xs text-muted-foreground">{post.author.role}</span>
                                    </div>
                                </div>
                            </div>


                            <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Ulashish</h4>
                                <SocialShare url={fullUrl} title={post.title} className="justify-start gap-1" />
                            </div>

                            {post.tags.length > 0 && (
                                <div className="space-y-4 pt-8 border-t border-border/50">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Mavzular</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(tag => (
                                            <Link key={tag} href={`/news?search=${tag}`}>
                                                <Badge variant="secondary" className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors cursor-pointer border border-border/50 text-muted-foreground hover:text-foreground">
                                                    #{tag}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {post.sourceUrl && post.sourceUrl !== '#' && (
                                <div className="pt-8 border-t border-border/50">
                                    <a
                                        href={post.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
                                    >
                                        Manbani ko'rish <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 lg:col-start-4">
                        <div className="prose prose-lg dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-headings:font-heading prose-headings:tracking-tight 
                            prose-h1:text-4xl prose-h1:mb-8
                            prose-h2:text-3xl prose-h2:mt-0 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/30
                            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                            prose-p:leading-8 prose-p:text-muted-foreground prose-p:mb-8 prose-p:font-sans
                            prose-a:text-primary prose-a:no-underline prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-primary/80 transition-colors
                            prose-li:text-muted-foreground prose-li:my-2
                            prose-strong:font-bold prose-strong:text-foreground
                            prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-border/50
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/20 prose-blockquote:px-8 prose-blockquote:py-8 prose-blockquote:rounded-r-2xl prose-blockquote:my-10 prose-blockquote:font-medium prose-blockquote:text-foreground/80 prose-blockquote:not-italic
                            prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        ">
                            <MarkdownPreview content={post.content} />
                        </div>

                        {/* Mobile Bottom Meta */}
                        <div className="lg:hidden mt-12 pt-8 border-t border-border/50 space-y-6">
                            <ArticleActions newsId={post.id} initialLikes={post.likes} hasLiked={hasLiked} />
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <Link key={tag} href={`/news?search=${tag}`}>
                                        <Badge variant="secondary">#{tag}</Badge>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Actions (Floating/Sticky) */}
                    <div className="hidden xl:block xl:col-span-1">
                        <div className="sticky top-32 flex flex-col items-center gap-4">
                            <ArticleActions vertical newsId={post.id} initialLikes={post.likes} hasLiked={hasLiked} />
                        </div>
                    </div>

                </div>
            </div>


        </main>
    );
}

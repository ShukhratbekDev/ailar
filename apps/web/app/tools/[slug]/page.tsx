import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ExternalLink,
    Eye,
    CheckCircle2,
    Zap,
    Sparkles,
    Heart,
    XCircle,
    Calendar,
    ArrowUpRight,
} from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { isEditor, isAdmin } from "@/lib/auth";
import { ToolViewTracker, ScrollProgress, ToolFloatingActionBar, SocialShare, ToolLikeButton, ToolActions, ToolAdminActions } from "./client-components";
import { db } from "@/db";
import { tools, toolLikes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { MarkdownPreview } from '@/components/markdown-preview';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@clerk/nextjs/server";

export default async function ToolDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const tool = await db.query.tools.findFirst({
        where: eq(tools.slug, slug)
    });

    if (!tool) {
        notFound();
    }

    const { userId } = await auth();
    const admin = await isAdmin();
    let hasLiked = false;

    if (userId) {
        const like = await db.query.toolLikes.findFirst({
            where: and(
                eq(toolLikes.toolId, tool.id),
                eq(toolLikes.userId, userId)
            )
        });
        hasLiked = !!like;
    }

    const formattedDate = tool.publishedAt
        ? format(new Date(tool.publishedAt), "d MMM, yyyy", { locale: uz })
        : format(new Date(tool.createdAt || new Date()), "d MMM, yyyy", { locale: uz });

    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ailar.uz"}/tools/${tool.slug}`;

    return (
        <main className="min-h-screen bg-background text-foreground pb-32 relative selection:bg-primary/20">
            <ToolViewTracker toolId={tool.id} />
            <ScrollProgress />
            <ToolFloatingActionBar url={fullUrl} title={tool.name} toolId={tool.id} initialVotes={tool.voteCount || 0} hasLiked={hasLiked} />

            {/* Desktop Back Button (Fixed) */}
            <div className="hidden md:flex fixed top-24 left-0 w-full z-40 px-8 justify-between items-start pointer-events-none">
                <Link href="/tools" className="pointer-events-auto group inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-foreground transition-all bg-background/90 backdrop-blur-xl border border-border/50 rounded-full hover:shadow-lg shadow-sm">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Content Container */}
            <div className="container max-w-7xl mx-auto px-4 pt-20 md:pt-28">

                {/* Mobile Navigation (In-flow) */}
                <div className="md:hidden mb-8 animate-fade-in-up">
                    <Link href="/tools" className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Barcha vositalar</span>
                    </Link>
                </div>

                {/* Header Section */}
                <header className="max-w-5xl md:max-w-6xl mb-10">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8 animate-fade-in-up [animation-delay:100ms]">
                        <div className="flex items-center gap-3">
                            {tool.category && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border-0">
                                    {tool.category}
                                </Badge>
                            )}
                            <span className="text-muted-foreground/40 text-xs">|</span>
                            <span className="text-[11px] md:text-sm font-medium text-muted-foreground">{formattedDate}</span>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 text-[11px] md:text-sm font-medium text-muted-foreground bg-muted/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border/50 w-fit">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                                <span>{(tool.viewCount || 0).toLocaleString()}</span>
                            </div>
                            {(tool.voteCount || 0) > 0 && (
                                <>
                                    <span className="text-border">|</span>
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 fill-current" />
                                        <span>{(tool.voteCount || 0).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-4 md:gap-6 mb-6">
                        {/* Tool Logo */}
                        <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-card border border-border/50 shadow-lg flex items-center justify-center p-2.5 sm:p-3 md:p-4">
                            {tool.logoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={tool.logoUrl}
                                    alt={`${tool.name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <Zap className="w-full h-full text-primary" />
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-heading tracking-tight leading-[1.05] text-balance px-1">
                                {tool.name}
                            </h1>
                        </div>
                    </div>
                    {/* Description - Separate Row for better mobile flow */}
                    <div className="max-w-4xl">
                        <p className="text-lg md:text-2xl text-muted-foreground font-light leading-relaxed px-1">
                            {tool.description}
                        </p>
                    </div>
                </header>
            </div>

            {/* Hero Image - Full Width Window */}
            <div className="w-full relative aspect-video md:aspect-[21/9] animate-fade-in-up [animation-delay:200ms] mb-12 md:mb-16 bg-muted/20">
                {tool.imageUrl ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={tool.imageUrl}
                            alt={tool.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none md:hidden" />
                    </>
                ) : (
                    <div className="w-full h-full bg-secondary/30 flex items-center justify-center border-y border-border/50">
                        <Sparkles className="h-16 w-16 text-muted-foreground/20 animate-pulse" />
                    </div>
                )}
            </div>

            <div className="container max-w-7xl mx-auto px-4">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left Sidebar (Desktop - Tool Info) */}
                    <div className="hidden lg:block lg:col-span-3 space-y-8">
                        <div className="sticky top-32 space-y-8">
                            {/* Identity Block */}
                            <div className="space-y-6 pb-8 border-b border-border/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center justify-center p-2">
                                        {tool.logoUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={tool.logoUrl}
                                                alt={tool.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <Zap className="w-8 h-8 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-none mb-1">{tool.name}</h3>
                                        <Badge variant="outline" className="text-[10px] bg-background/50">
                                            {tool.pricingType === "free" ? "Bepul" :
                                                tool.pricingType === "freemium" ? "Freemium" : "Pullik"}
                                        </Badge>
                                    </div>
                                </div>

                                {tool.url && (
                                    <Button className="w-full rounded-full font-bold shadow-lg shadow-primary/20" asChild>
                                        <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                            Websaytga o'tish <ExternalLink className="ml-2 w-4 h-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Ulashish</h4>
                                <SocialShare url={fullUrl} title={tool.name} className="justify-start gap-1" />
                            </div>

                            {admin && (
                                <div className="space-y-4 pt-8 border-t border-border/50">
                                    <ToolAdminActions toolId={tool.id} />
                                </div>
                            )}

                            {tool.tags && tool.tags.length > 0 && (
                                <div className="space-y-4 pt-8 border-t border-border/50">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Teglar</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tool.tags.map(tag => (
                                            <Link key={tag} href={`/tools?search=${encodeURIComponent(tag)}`}>
                                                <Badge variant="secondary" className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 transition-colors cursor-pointer border border-border/50 text-muted-foreground hover:text-foreground">
                                                    #{tag}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing Text info if exists */}
                            {tool.pricingText && tool.pricingType !== 'free' && (
                                <div className="pt-8 border-t border-border/50 space-y-2">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Narx</h4>
                                    <p className="font-medium text-foreground">{tool.pricingText}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 lg:col-start-4 space-y-12">
                        {/* Features List */}
                        {tool.features && tool.features.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {tool.features.map((feature, i) => (
                                    <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium opacity-90">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="prose prose-lg dark:prose-invert max-w-none
                            prose-headings:font-bold prose-headings:font-heading prose-headings:tracking-tight
                            prose-h1:text-4xl prose-h1:mb-8
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/30
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:leading-8 prose-p:text-muted-foreground prose-p:mb-6 prose-p:font-sans
                            prose-a:text-primary prose-a:no-underline prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-primary/80 transition-colors
                            prose-li:text-muted-foreground prose-li:my-2
                            prose-strong:font-bold prose-strong:text-foreground
                            prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-border/50
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/20 prose-blockquote:px-8 prose-blockquote:py-8 prose-blockquote:rounded-r-2xl prose-blockquote:my-10 prose-blockquote:font-medium prose-blockquote:text-foreground/80 prose-blockquote:not-italic
                            prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        ">
                            {tool.content ? (
                                <MarkdownPreview content={tool.content} />
                            ) : (
                                <p className="italic opacity-70">Batafsil ma'lumot kiritilmagan.</p>
                            )}
                        </div>

                        {/* Pros & Cons */}
                        {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
                            <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
                                {tool.pros && tool.pros.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-lg">Afzalliklari</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {tool.pros.map((pro, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-foreground/80 group">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                                                    <span>{pro}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {tool.cons && tool.cons.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                                <XCircle className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-lg">Kamchiliklari</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {tool.cons.map((con, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-foreground/80 group">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                                                    <span>{con}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Screenshots Gallery - Now separate styling */}
                        {/* Note: Schema doesn't have screenshots array yet in Drizzle schema but mock did. Assuming not available on DB yet or handled via content images.
                            If schema has screenshots, we would map them here. Currently schema has `imageUrl`.
                        */}

                        {/* Mobile Bottom Meta */}
                        <div className="lg:hidden mt-12 pt-8 border-t border-border/50 space-y-6">
                            <ToolActions toolId={tool.id} initialVotes={tool.voteCount || 0} hasVoted={hasLiked} />
                            {tool.tags && tool.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tool.tags.map(tag => (
                                        <Link key={tag} href={`/tools?search=${encodeURIComponent(tag)}`}>
                                            <Badge variant="secondary">#{tag}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {tool.url && (
                                <Button className="w-full rounded-full font-bold shadow-lg" asChild>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                        Websaytga o'tish <ExternalLink className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Actions (Floating/Sticky) */}
                    <div className="hidden xl:block xl:col-span-1">
                        <div className="sticky top-32 flex flex-col items-center gap-4">
                            <ToolActions vertical toolId={tool.id} initialVotes={tool.voteCount || 0} hasVoted={hasLiked} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

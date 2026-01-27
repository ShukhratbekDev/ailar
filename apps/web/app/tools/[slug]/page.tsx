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
    Play,
    Layout
} from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { isEditor, isAdmin } from "@/lib/auth";
import { ToolViewTracker, ScrollProgress, ToolFloatingActionBar, SocialShare, ToolLikeButton, ToolActions, ToolAdminActions, ToolGallery } from "./client-components";
import { db } from "@/db";
import { tools, toolLikes, discussions } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { MarkdownPreview } from '@/components/markdown-preview';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@clerk/nextjs/server";
import { DiscussionSection } from "@/components/discussions/discussion-section";

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

    const { userId: currentUserId } = await auth();
    const admin = await isAdmin();
    const editor = await isEditor();
    let hasLiked = false;

    if (currentUserId) {
        const like = await db.query.toolLikes.findFirst({
            where: and(
                eq(toolLikes.toolId, tool.id),
                eq(toolLikes.userId, currentUserId)
            )
        });
        hasLiked = !!like;
    }

    const formattedDate = tool.publishedAt
        ? format(new Date(tool.publishedAt), "d MMM, yyyy", { locale: uz })
        : format(new Date(tool.createdAt || new Date()), "d MMM, yyyy", { locale: uz });

    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ailar.uz"}/tools/${tool.slug}`;

    // Fetch Similar Tools
    const similarTools = await db.query.tools.findMany({
        where: and(
            eq(tools.category, tool.category || ""),
            eq(tools.status, 'published'),
            ne(tools.id, tool.id)
        ),
        limit: 4,
        orderBy: [desc(tools.viewCount)]
    });

    // Fetch Discussions
    const toolDiscussions = await db.query.discussions.findMany({
        where: eq(discussions.toolId, tool.id),
        orderBy: [desc(discussions.createdAt)]
    });

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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

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
                                    <Button className="w-full rounded-full font-bold shadow-lg shadow-primary/20 h-12" asChild>
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
                    <div className="lg:col-span-8 lg:col-start-4 space-y-20">
                        {/* Features List */}
                        {tool.features && tool.features.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {tool.features.map((feature, i) => (
                                    <div key={i} className="flex gap-3 items-start p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/40 transition-colors group">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <span className="text-base font-medium opacity-90">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Screenshots Gallery */}
                        {tool.screenshots && tool.screenshots.length > 0 && (
                            <ToolGallery screenshots={tool.screenshots} toolName={tool.name} />
                        )}

                        {/* Video Demo */}
                        {tool.videoUrl && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Play className="h-5 w-5 text-primary" />
                                    <h3 className="text-2xl font-black font-heading tracking-tight">Video Taqdimot</h3>
                                </div>
                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl">
                                    {/* Handle common video hosts or direct MP4 */}
                                    {tool.videoUrl.includes('youtube.com') || tool.videoUrl.includes('youtu.be') ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${tool.videoUrl.split('v=')[1] || tool.videoUrl.split('/').pop()}`}
                                            className="absolute inset-0 w-full h-full"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={tool.videoUrl}
                                            controls
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="prose prose-lg dark:prose-invert max-w-none
                            prose-headings:font-bold prose-headings:font-heading prose-headings:tracking-tight
                            prose-h1:text-4xl prose-h1:mb-8
                            prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border/30
                            prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-6
                            prose-p:leading-9 prose-p:text-muted-foreground prose-p:mb-8 prose-p:font-sans prose-p:text-xl prose-p:font-light
                            prose-a:text-primary prose-a:no-underline prose-a:font-semibold hover:prose-a:underline hover:prose-a:text-primary/80 transition-colors
                            prose-li:text-muted-foreground prose-li:my-3 prose-li:text-lg
                            prose-strong:font-bold prose-strong:text-foreground
                            prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-12 prose-img:border prose-img:border-border/50
                            prose-blockquote:border-l-8 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/20 prose-blockquote:px-10 prose-blockquote:py-10 prose-blockquote:rounded-r-[2.5rem] prose-blockquote:my-12 prose-blockquote:font-medium prose-blockquote:text-foreground/90 prose-blockquote:not-italic prose-blockquote:text-2xl
                            prose-code:bg-muted prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
                        ">
                            {tool.content ? (
                                <MarkdownPreview content={tool.content} />
                            ) : (
                                <p className="italic opacity-70">Batafsil ma'lumot kiritilmagan.</p>
                            )}
                        </div>

                        {/* Pros & Cons */}
                        {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
                            <div className="grid md:grid-cols-2 gap-8 pt-12 border-t border-border/50">
                                {tool.pros && tool.pros.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-black text-xl font-heading tracking-tight">Afzalliklari</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {tool.pros.map((pro, i) => (
                                                <li key={i} className="flex gap-4 text-base text-foreground/80 group bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
                                                    <span>{pro}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {tool.cons && tool.cons.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                                <XCircle className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-black text-xl font-heading tracking-tight">Kamchiliklari</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {tool.cons.map((con, i) => (
                                                <li key={i} className="flex gap-4 text-base text-foreground/80 group bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                                                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
                                                    <span>{con}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Similar Tools Section */}
                        {similarTools.length > 0 && (
                            <div className="pt-20 border-t border-border/50 space-y-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-black font-heading tracking-tight">O'xshash Vositalar</h3>
                                    <Link href={`/tools?category=${tool.category}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                        Hamasini ko'rish <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {similarTools.map((t) => (
                                        <Link key={t.id} href={`/tools/${t.slug}`} className="group relative bg-card/50 border border-border/50 rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all p-4">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-background border border-border/50 p-2 shrink-0">
                                                    <img src={t.logoUrl || ""} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-lg group-hover:text-primary transition-colors truncate">{t.name}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-1 font-light">{t.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discussion Section */}
                        <DiscussionSection
                            targetId={tool.id}
                            targetType="tool"
                            initialComments={toolDiscussions.map(d => ({
                                ...d,
                                upvotes: d.upvotes || 0
                            }))}
                            currentUserId={currentUserId}
                            isEditor={editor}
                            title="Foydalanuvchilar fikri"
                        />

                        {/* Mobile Bottom Meta */}
                        <div className="lg:hidden mt-20 pt-12 border-t border-border/50 space-y-8">
                            <ToolActions toolId={tool.id} initialVotes={tool.voteCount || 0} hasVoted={hasLiked} />
                            {tool.tags && tool.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tool.tags.map(tag => (
                                        <Link key={tag} href={`/tools?search=${encodeURIComponent(tag)}`}>
                                            <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-muted text-muted-foreground border-border/50">#{tag}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {tool.url && (
                                <Button className="w-full rounded-full font-black shadow-lg h-14 text-lg" asChild>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                        Websaytga o'tish <ExternalLink className="ml-2 w-5 h-5" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Actions (Floating/Sticky) */}
                    <div className="hidden xl:block xl:col-span-1">
                        <div className="sticky top-32 flex flex-col items-center gap-6">
                            <ToolActions vertical toolId={tool.id} initialVotes={tool.voteCount || 0} hasVoted={hasLiked} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Send, Loader2, CheckCircle, Heart, Globe, ThumbsUp, Sparkles, Layout, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SocialShare as UnifiedSocialShare } from "@/components/social-share";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { shareToolToSocialMedia, incrementToolView, toggleToolLike } from "@/app/actions/tools";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SocialShare({ url, title, vertical = false, className = "" }: { url: string, title: string, vertical?: boolean, className?: string }) {
    return <UnifiedSocialShare url={url} title={title} vertical={vertical} className={className} />;
}

export function ToolViewTracker({ toolId }: { toolId: number }) {
    useEffect(() => {
        incrementToolView(toolId);
    }, [toolId]);
    return null;
}

export function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setProgress(Number(scroll));
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-0.5 z-[60] bg-transparent">
            <div
                className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-100 ease-out"
                style={{ width: `${progress * 100}%` }}
            />
        </div>
    );
}

export function ToolShareButton({ url, title }: { url: string; title: string }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 glass-card" align="end">
                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Ulashish</p>
                    <UnifiedSocialShare url={url} title={title} />
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Mimics LikeButton but for Tools (Voting/Liking)
import { useAuth } from "@clerk/nextjs";

interface ToolLikeButtonProps {
    toolId: number;
    initialVotes: number;
    hasVoted?: boolean; // Placeholder for now
}

export function ToolLikeButton({ toolId, initialVotes, hasVoted = false }: ToolLikeButtonProps) {
    const { userId } = useAuth();
    const [votes, setVotes] = useState(initialVotes);
    const [voted, setVoted] = useState(hasVoted);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleVote = async () => {
        if (!userId) {
            toast.error("Iltimos, avval tizimga kiring");
            router.push('/sign-in');
            return;
        }

        if (loading) return;

        setLoading(true);
        // Optimistic UI
        const newVoted = !voted;
        setVoted(newVoted);
        setVotes(prev => newVoted ? prev + 1 : Math.max(0, prev - 1));

        try {
            await toggleToolLike(toolId);
            toast.success(newVoted ? "Yoqdi" : "Yoqmadi");
        } catch (error) {
            // Revert on error
            setVoted(!newVoted);
            setVotes(prev => !newVoted ? prev + 1 : Math.max(0, prev - 1));
            toast.error("Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVote}
                        className={cn(
                            "gap-2 transition-all duration-300",
                            voted ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:border-red-900/50" : "hover:bg-red-50 hover:text-red-600"
                        )}
                        disabled={loading}
                    >
                        <Heart className={cn("h-4 w-4", voted && "fill-current")} />
                        <span>{votes}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p className="text-xs font-medium">{voted ? "Bekor qilish" : "Yoqdi"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function ToolActions({
    toolId,
    initialVotes = 0,
    hasVoted = false,
    vertical = false,
    className = ""
}: {
    toolId: number,
    initialVotes?: number,
    hasVoted?: boolean,
    vertical?: boolean,
    className?: string
}) {
    return (
        <div className={`flex ${vertical ? 'flex-col' : 'items-center'} gap-2 ${className}`}>
            <ToolLikeButton toolId={toolId} initialVotes={initialVotes} hasVoted={hasVoted} />
        </div>
    );
}

export function ToolFloatingActionBar({
    url,
    title,
    toolId,
    initialVotes,
    hasLiked = false,
}: {
    url: string,
    title: string,
    toolId: number,
    initialVotes: number,
    hasLiked?: boolean,
}) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 md:hidden">
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                <ToolLikeButton toolId={toolId} initialVotes={initialVotes} hasVoted={hasLiked} />
                <div className="w-px h-4 bg-border/50 mx-1" />
                <SocialShare url={url} title={title} />
            </div>
        </div>
    );
}
export function ToolAdminActions({ toolId }: { toolId: number }) {
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await shareToolToSocialMedia(toolId, { telegram: true });
            toast.success("Telegramga yuborildi!");
        } catch (error: any) {
            toast.error("Xatolik: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Admin Paneli
            </h4>
            <Button
                onClick={handleShare}
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Telegramga yuborish</span>
            </Button>
        </div>
    );
}

export function ToolGallery({ screenshots, toolName }: { screenshots: string[], toolName: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    };

    const openImage = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Layout className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-black font-heading tracking-tight">Vizuallar</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {screenshots.map((shot, i) => (
                    <div
                        key={i}
                        onClick={() => openImage(i)}
                        className={cn(
                            "relative rounded-3xl overflow-hidden border border-border/50 bg-muted/20 aspect-video group cursor-zoom-in",
                            i === 0 && screenshots.length % 2 !== 0 && "md:col-span-2"
                        )}
                    >
                        <img
                            src={shot}
                            alt={`${toolName} screenshot ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-all duration-300">
                                <Sparkles className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[100vw] max-h-[100vh] p-0 border-0 bg-black/95 shadow-none flex items-center justify-center z-[150]">
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 z-[160] h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-xl transition-all"
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Navigation Buttons */}
                        {screenshots.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePrev}
                                    className="absolute left-4 md:left-8 z-[160] h-14 w-14 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 backdrop-blur-lg transition-all"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNext}
                                    className="absolute right-4 md:right-8 z-[160] h-14 w-14 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 backdrop-blur-lg transition-all"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}

                        {/* Main Image Container */}
                        <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-6">
                            <img
                                src={screenshots[currentIndex]}
                                alt={`${toolName} screenshot ${currentIndex + 1}`}
                                className="max-w-full max-h-[80vh] object-contain rounded-xl md:rounded-2xl shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300"
                            />

                            {/* Caption/Counter */}
                            <div className="px-6 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl text-white/90 text-sm font-medium flex items-center gap-4">
                                <span className="opacity-60">{currentIndex + 1} / {screenshots.length}</span>
                                <div className="w-px h-3 bg-white/20" />
                                <span>{toolName} vizuali</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Send, Loader2, CheckCircle, Heart, Globe, ThumbsUp } from "lucide-react";
import { SocialShare as UnifiedSocialShare } from "@/components/social-share";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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

    const handleVote = async () => {
        if (!userId) {
            alert("Yoqtirish uchun tizimga kiring.");
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
            toast.success(newVoted ? "Yoqdi!" : "Yoqtirish bekor qilindi");
        } catch (error) {
            // Revert on error
            setVoted(!newVoted);
            setVotes(prev => !newVoted ? prev + 1 : Math.max(0, prev - 1));
            console.error("Like action failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
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
        <TooltipProvider>
            <div className={`flex ${vertical ? 'flex-col' : 'items-center'} gap-2 ${className}`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <ToolLikeButton toolId={toolId} initialVotes={initialVotes} hasVoted={hasVoted} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{hasVoted ? "Yoqdi" : "Yoqtirish"}</p></TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
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

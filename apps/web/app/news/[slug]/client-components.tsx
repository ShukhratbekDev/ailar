"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, ThumbsUp, ThumbsDown, Share2, Copy, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available, or use alert/console

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { SocialShare as UnifiedSocialShare } from "@/components/social-share";

export function SocialShare({ url, title, vertical = false, className = "" }: { url: string, title: string, vertical?: boolean, className?: string }) {
    return <UnifiedSocialShare url={url} title={title} vertical={vertical} className={className} />;
}


import { LikeButton } from "@/components/like-button";

export function ArticleActions({
    newsId,
    initialLikes = 0,
    hasLiked = false,
    vertical = false,
    className = ""
}: {
    newsId: number,
    initialLikes?: number,
    hasLiked?: boolean,
    vertical?: boolean,
    className?: string
}) {
    return (
        <TooltipProvider>
            <div className={`flex ${vertical ? 'flex-col' : 'items-center'} gap-2 ${className}`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <LikeButton newsId={newsId} initialLikes={initialLikes} hasLiked={hasLiked} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{hasLiked ? "Yoqdi" : "Yoqtirish"}</p></TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

export function FloatingActionBar({
    url,
    title,
    newsId,
    initialLikes,
    hasLiked
}: {
    url: string,
    title: string,
    newsId: number,
    initialLikes: number,
    hasLiked: boolean
}) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 md:hidden">
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                <ArticleActions vertical={false} newsId={newsId} initialLikes={initialLikes} hasLiked={hasLiked} />
                <div className="w-px h-4 bg-border/50 mx-1" />
                <SocialShare url={url} title={title} />
            </div>
        </div>
    );
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

import { incrementViewCount } from "@/app/actions/news";

export function NewsViewTracker({ newsId }: { newsId: number }) {
    useEffect(() => {
        incrementViewCount(newsId);
    }, [newsId]);

    return null;
}

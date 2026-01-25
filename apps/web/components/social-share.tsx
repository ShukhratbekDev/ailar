"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Facebook,
    Linkedin,
    Share2,
    Copy,
    Check,
    Send,
    Instagram,
    Twitter
} from "lucide-react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SocialShareProps {
    url: string;
    title: string;
    description?: string;
    variant?: "ghost" | "outline" | "inline";
    vertical?: boolean;
    className?: string;
}

export function SocialShare({
    url,
    title,
    description,
    variant = "ghost",
    vertical = false,
    className = ""
}: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = (platform: string) => {
        let shareUrl = "";
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedDesc = encodeURIComponent(description || "");

        switch (platform) {
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        } else if (platform === 'instagram') {
            copyToClipboard();
            toast.info("Instagram uchun havola nusxalandi. Uni bioingizga yoki storyingizga qo'shishingiz mumkin.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Havola nusxalandi!");
        setTimeout(() => setCopied(false), 2000);
    };

    const platforms = [
        {
            id: 'telegram',
            name: 'Telegram',
            icon: Send,
            color: 'hover:bg-sky-500/10 hover:text-sky-500',
            iconColor: 'text-sky-500'
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: Instagram,
            color: 'hover:bg-pink-600/10 hover:text-pink-600',
            iconColor: 'text-pink-600'
        },
        {
            id: 'twitter',
            name: 'X',
            icon: (props: any) => (
                <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            color: 'hover:bg-foreground/10 hover:text-foreground',
            iconColor: 'text-foreground'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'hover:bg-blue-700/10 hover:text-blue-700',
            iconColor: 'text-blue-700'
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: Facebook,
            color: 'hover:bg-blue-600/10 hover:text-blue-600',
            iconColor: 'text-blue-600'
        },
    ];

    return (
        <TooltipProvider>
            <div className={cn(
                "flex items-center gap-1.5",
                vertical ? "flex-col" : "flex-row",
                className
            )}>
                {platforms.map((p) => (
                    <Tooltip key={p.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant === "inline" ? "ghost" : variant}
                                size="icon"
                                className={cn(
                                    "rounded-full h-9 w-9 transition-all duration-300",
                                    p.color
                                )}
                                onClick={() => handleShare(p.id)}
                            >
                                <p.icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side={vertical ? "right" : "top"}>
                            <p className="text-xs">{p.name}-da ulashish</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={variant === "inline" ? "ghost" : variant}
                            size="icon"
                            className="rounded-full h-9 w-9 hover:bg-muted transition-all duration-300"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side={vertical ? "right" : "top"}>
                        <p className="text-xs">Havolani nusxalash</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/app/actions/news";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewsLikeButtonProps {
    newsId: number;
    initialIsLiked: boolean;
    initialCount: number;
    size?: "sm" | "icon" | "default";
    className?: string;
    showCount?: boolean;
}

export function NewsLikeButton({
    newsId,
    initialIsLiked,
    initialCount,
    size = "icon",
    className,
    showCount = true
}: NewsLikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [count, setCount] = useState(initialCount);
    const [isPending, startTransition] = useTransition();
    const { userId } = useAuth();
    const router = useRouter();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            toast.error("Iltimos, avval tizimga kiring");
            router.push('/sign-in');
            return;
        }

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        if (newIsLiked) {
            toast.success("Yoqdi");
        } else {
            toast.success("Yoqmadi");
        }

        startTransition(async () => {
            try {
                await toggleLike(newsId);
            } catch (error) {
                // Revert on error
                setIsLiked(!newIsLiked);
                setCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
                toast.error("Xatolik yuz berdi");
            }
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size={size === "icon" ? "icon" : size}
                        className={cn(
                            "group hover:bg-rose-500/10 hover:text-rose-500 transition-all",
                            isLiked && "text-rose-500",
                            className
                        )}
                        onClick={handleToggle}
                        disabled={isPending}
                    >
                        <Heart
                            className={cn(
                                "w-5 h-5 transition-transform group-active:scale-75",
                                isLiked && "fill-current"
                            )}
                        />
                        {showCount && (
                            <span className={cn(
                                "ml-2 text-xs font-bold",
                                size === "icon" && "sr-only md:not-sr-only md:inline-block"
                            )}>
                                {count}
                            </span>
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p className="text-xs font-medium">{isLiked ? "Bekor qilish" : "Yoqdi"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

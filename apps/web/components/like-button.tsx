'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleLike } from '@/app/actions/news';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface LikeButtonProps {
    newsId: number;
    initialLikes: number;
    hasLiked: boolean;
}

export function LikeButton({ newsId, initialLikes, hasLiked }: LikeButtonProps) {
    const { userId } = useAuth();
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(hasLiked);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLike = async () => {
        if (!userId) {
            toast.error("Iltimos, avval tizimga kiring");
            router.push('/sign-in');
            return;
        }

        if (loading) return;

        setLoading(true);
        // Optimistic UI
        const newLiked = !liked;
        setLiked(newLiked);
        setLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            await toggleLike(newsId);
            toast.success(newLiked ? "Yoqdi" : "Yoqmadi");
        } catch (error) {
            // Revert on error
            setLiked(!newLiked);
            setLikes(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
            console.error("Like action failed:", error);
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
                        onClick={handleLike}
                        className={cn(
                            "gap-2 transition-all duration-300",
                            liked ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:border-red-900/50" : "hover:bg-red-50 hover:text-red-600"
                        )}
                        disabled={loading}
                    >
                        <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                        <span>{likes}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p className="text-xs font-medium">{liked ? "Bekor qilish" : "Yoqdi"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

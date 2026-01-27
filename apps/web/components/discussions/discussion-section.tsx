'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2, Reply, Loader2, Heart } from 'lucide-react';
import { addDetailedDiscussion, deleteDetailedDiscussion, toggleDetailedDiscussionLike, DiscussionTargetType } from '@/app/actions/discussions';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface Comment {
    id: number;
    userId: string;
    userName: string;
    userImage: string | null;
    content: string;
    parentId: number | null;
    upvotes: number;
    createdAt: Date;
    replies?: Comment[];
}

function CommentLikeButton({ commentId, initialUpvotes }: { commentId: number, initialUpvotes: number }) {
    const { userId } = useAuth();
    const router = useRouter();
    const [liked, setLiked] = useState(false); // Since we don't have initial state from server yet
    const [count, setCount] = useState(initialUpvotes);
    const [isPending, setIsPending] = useState(false);

    const handleLike = async () => {
        if (!userId) {
            toast.error("Iltimos, avval tizimga kiring");
            router.push('/sign-in');
            return;
        }

        if (isPending) return;

        const newLiked = !liked;
        setLiked(newLiked);
        setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
        setIsPending(true);

        try {
            const result = await toggleDetailedDiscussionLike(commentId);
            setLiked(result.liked);
            toast.success(result.liked ? "Yoqdi" : "Yoqmadi");
        } catch {
            // Revert on error
            setLiked(!newLiked);
            setCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
            toast.error("Xatolik");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full transition-colors",
                                liked ? "text-rose-500 hover:bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                            )}
                            onClick={handleLike}
                            disabled={isPending}
                        >
                            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="text-xs font-medium">{liked ? "Bekor qilish" : "Yoqdi"}</p>
                    </TooltipContent>
                </Tooltip>
                <span className="text-xs font-bold text-muted-foreground mr-2">{count}</span>
            </div>
        </TooltipProvider>
    );
}

interface DiscussionSectionProps {
    targetId: number;
    targetType: DiscussionTargetType;
    initialComments: Comment[];
    currentUserId?: string | null;
    isEditor?: boolean;
    title?: string;
}

export function DiscussionSection({ targetId, targetType, initialComments, currentUserId, isEditor, title = "Muhokama" }: DiscussionSectionProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const { userId } = useAuth();
    const router = useRouter();

    const handleSubmit = async (parentId?: number) => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await addDetailedDiscussion({
                targetId,
                targetType,
                content,
                parentId
            });
            setContent("");
            setReplyTo(null);
            toast.success("Izoh muvaffaqiyatli qo'shildi");
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
        try {
            await deleteDetailedDiscussion(id);
            toast.success("Izoh o'chirildi");
        } catch (error) {
            toast.error("O'chirishda xatolik");
        }
    };

    // Helper to render a comment and its replies
    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mt-8'} group animate-in fade-in slide-in-from-left-4 duration-500`}>
            <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage src={comment.userImage || ""} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                    {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{comment.userName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: uz })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <CommentLikeButton commentId={comment.id} initialUpvotes={comment.upvotes} />
                        {!isReply && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            >
                                <Reply className="h-4 w-4" />
                            </Button>
                        )}
                        {(comment.userId === currentUserId || isEditor) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500"
                                onClick={() => handleDelete(comment.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="bg-muted/30 rounded-2xl p-4 text-sm leading-relaxed font-light text-foreground/80 border border-border/20">
                    {comment.content}
                </div>

                {/* Reply Form */}
                {replyTo === comment.id && !isReply && (
                    <div className="pt-4 space-y-3 animate-in fade-in zoom-in duration-200">
                        <Textarea
                            placeholder="Javobingizni yozing..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[80px] rounded-2xl bg-muted/20 border-border/40 focus:ring-primary/20"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleSubmit(comment.id)}
                                disabled={isSubmitting || !content.trim()}
                                size="sm"
                                className="rounded-full px-6 font-bold"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-3.5 w-3.5 mr-2" />}
                                Javob berish
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setReplyTo(null); setContent(""); }}
                                className="rounded-full px-4 font-bold"
                            >
                                Bekor qilish
                            </Button>
                        </div>
                    </div>
                )}

                {/* Render Replies */}
                {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
            </div>
        </div>
    );

    // Group comments into threads
    const threads = initialComments
        .filter(c => !c.parentId)
        .map(c => ({
            ...c,
            replies: initialComments.filter(r => r.parentId === c.id)
        }));

    return (
        <div className="pt-12 md:pt-24 border-t border-border/40 space-y-12 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-foreground">{title}</h2>
                        <p className="text-muted-foreground font-light text-sm">Fikr va mulohazalaringiz.</p>
                    </div>
                </div>
                <div className="px-4 py-2 rounded-full bg-muted/50 border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {initialComments.length} ta fikr
                </div>
            </div>

            {/* Main Comment Form */}
            {!replyTo && (
                <div className="space-y-4 bg-muted/10 p-6 md:p-8 rounded-[2.5rem] border border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">AI</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sizning fikringiz</span>
                    </div>
                    <Textarea
                        placeholder="Fikr qoldiring..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px] rounded-3xl bg-background border-border/40 focus:ring-primary/20 text-base md:text-lg p-6 shadow-sm"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={async () => { await handleSubmit(); }}
                            disabled={isSubmitting || !content.trim()}
                            className="rounded-full px-10 h-12 font-black shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Yuborish
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {threads.length > 0 ? (
                    threads.map(thread => renderComment(thread))
                ) : (
                    <div className="py-20 text-center space-y-4 bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/40">
                        <p className="text-muted-foreground font-light italic">Hali muhokamalar yo'q. Birinchi bo'lib fikr bildiring!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

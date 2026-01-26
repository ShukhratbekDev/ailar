'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, Loader2, MessageSquare, Trophy, Info } from 'lucide-react'; // Icons
import { getNotifications, markNotificationAsRead } from '@/app/actions/education';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

interface Notification {
    id: number;
    userId: string;
    type: "achievement" | "reply" | "system" | "level_up";
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data as any);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Poll every 60 seconds, but only if the tab is visible
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchNotifications();
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        try {
            await markNotificationAsRead(id);
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        // In a real app we'd have a bulk action, but here we loop (simple solution) or just refresh
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'achievement': return <Trophy className="h-4 w-4 text-amber-500" />;
            case 'reply': return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case 'level_up': return <SparklesIcon className="h-4 w-4 text-purple-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl border-border/40 shadow-xl bg-card/95 backdrop-blur-xl">
                <div className="flex items-center justify-between p-4 border-b border-border/40">
                    <h4 className="font-bold text-sm">Bildirishnomalar</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-auto px-2 py-1 text-[10px] uppercase font-black tracking-widest text-primary hover:text-primary/80"
                        >
                            <Check className="h-3 w-3 mr-1" /> Barchasini o'qish
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border/20">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-colors hover:bg-muted/30 flex gap-4 relative group",
                                        !notification.isRead ? "bg-primary/[0.03]" : ""
                                    )}
                                // wrapper click logic is tricky with links, so we'll just handle mark as read on interaction
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border border-border/40 bg-background",
                                        !notification.isRead && "border-primary/20 shadow-lg shadow-primary/5"
                                    )}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn("text-sm font-semibold leading-none", !notification.isRead && "text-primary")}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: uz })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline decoration-2 underline-offset-4"
                                                onClick={() => {
                                                    handleMarkAsRead(notification.id);
                                                    setOpen(false);
                                                }}
                                            >
                                                Ko'rish
                                            </Link>
                                        )}
                                        {!notification.link && !notification.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                O'qildi deb belgilash
                                            </button>
                                        )}
                                    </div>
                                    {!notification.isRead && (
                                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-4 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/50">
                                <Bell className="h-6 w-6" />
                            </div>
                            <p className="text-sm text-muted-foreground font-light">Sizda hozircha bildirishnomalar yo'q</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}

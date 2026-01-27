"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, ChevronRight, Newspaper, Bot, Terminal, Send, GraduationCap, Layout, Book } from "lucide-react";

import { AilarLogo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { NotificationsPopover } from "@/components/notifications-popover";

const isProd = process.env.NODE_ENV === 'production';

const navigation = [
    { name: "Yangiliklar", href: "/news", icon: Newspaper, description: "AI dunyosidagi eng so'nggi xabarlar" },
    { name: "Vositalar", href: "/tools", icon: Bot, description: "Eng foydali AI instrumentlar katalogi" },
    ...(isProd ? [] : [
        { name: "Ta'lim", href: "/learn", icon: GraduationCap, description: "AI bo'yicha amaliy kurslar va darslar" },
        { name: "Lug'at", href: "/learn/glossary", icon: Book, description: "AI atamalari izohli lug'ati" },
    ]),
    { name: "Promptlar", href: "/prompts", icon: Terminal, description: "Professional tayyor buyruqlar" },
];

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    // Lock body scroll when mobile menu is open
    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [mobileMenuOpen]);

    return (
        <>
            <header className={cn(
                "fixed top-0 left-0 right-0 z-[100] w-full border-b border-border/40 transition-all duration-300",
                mobileMenuOpen
                    ? "bg-background border-transparent"
                    : "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
            )}>
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity z-[110]"
                        >
                            <div className="bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground p-1.5 rounded-lg shadow-lg shadow-primary/20">
                                <AilarLogo className="h-6 w-6" />
                            </div>
                            <span className="font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 hidden sm:inline-block">
                                Ailar
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {!isProd && (
                                <SignedIn>
                                    <Link
                                        href="/learn/dashboard"
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                            pathname === "/learn/dashboard"
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        Dashboard
                                    </Link>
                                </SignedIn>
                            )}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-3 z-[110]">
                            <ModeToggle />

                            <div className="hidden sm:flex items-center gap-2">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                            Kirish
                                        </Button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                            <Sparkles className="mr-2 h-3.5 w-3.5" /> Ro'yxatdan o'tish
                                        </Button>
                                    </SignUpButton>
                                </SignedOut>

                                <SignedIn>
                                    <NotificationsPopover />
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: "h-9 w-9 ring-2 ring-primary/10"
                                            }
                                        }}
                                    />
                                </SignedIn>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className={cn(
                                    "md:hidden p-2.5 rounded-xl border transition-all active:scale-90",
                                    mobileMenuOpen
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                        : "bg-muted/50 border-border/40 text-muted-foreground"
                                )}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Premium Mobile Menu Overlay - Full Screen Portal Style */}
            <div className={cn(
                "fixed inset-0 z-[90] bg-background md:hidden flex flex-col pt-16 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
            )}>
                <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-none">
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-2 mb-2">Asosiy Menu</p>
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.96] group",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                            : "bg-muted/40 text-foreground hover:bg-muted/60"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-active:scale-90",
                                        isActive ? "bg-white/20" : "bg-background shadow-sm"
                                    )}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold leading-none mb-1">{item.name}</span>
                                        <span className={cn("text-xs opacity-60", isActive ? "text-white/80" : "text-muted-foreground")}>
                                            {item.description}
                                        </span>
                                    </div>
                                    <ChevronRight className={cn("ml-auto h-5 w-5 transition-transform group-hover:translate-x-1", isActive ? "opacity-60" : "opacity-20")} />
                                </Link>
                            )
                        })}

                        {!isProd && (
                            <SignedIn>
                                <Link
                                    href="/learn/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.96] group",
                                        pathname === "/learn/dashboard"
                                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                            : "bg-muted/40 text-foreground hover:bg-muted/60"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-active:scale-90",
                                        pathname === "/learn/dashboard" ? "bg-white/20" : "bg-background shadow-sm"
                                    )}>
                                        <Layout className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold leading-none mb-1">Mening Ta&apos;limim</span>
                                        <span className={cn("text-xs opacity-60", pathname === "/learn/dashboard" ? "text-white/80" : "text-muted-foreground")}>
                                            O&apos;quv jarayoni va natijalaringiz
                                        </span>
                                    </div>
                                    <ChevronRight className={cn("ml-auto h-5 w-5 transition-transform group-hover:translate-x-1", pathname === "/learn/dashboard" ? "opacity-60" : "opacity-20")} />
                                </Link>
                            </SignedIn>
                        )}
                    </div>

                    {/* Social Presence */}
                    <div className="mt-12 px-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-5">Hamjamiyat</p>
                        <Link
                            href="https://t.me/ailar_uz"
                            target="_blank"
                            className="flex items-center gap-4 p-5 rounded-3xl bg-[#0088cc]/5 border border-[#0088cc]/10 text-[#0088cc] transition-all active:scale-95"
                        >
                            <Send className="h-6 w-6 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Telegram</span>
                                <span className="text-[10px] opacity-60">Yangiliklarni birinchilardan bo'lib oling</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
                        </Link>
                    </div>
                </div>

                {/* Bottom Sticky Actions */}
                <div className="p-6 border-t border-border/40 bg-muted/30 backdrop-blur-2xl">
                    <SignedOut>
                        <div className="flex flex-col gap-3">
                            <SignUpButton mode="modal">
                                <Button className="h-14 rounded-2xl w-full bg-primary text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
                                    <Sparkles className="mr-2 h-4 w-4" /> Ro'yxatdan o'tish
                                </Button>
                            </SignUpButton>
                            <SignInButton mode="modal">
                                <Button variant="outline" className="h-14 rounded-2xl w-full text-sm font-bold uppercase tracking-widest border-border/60 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
                                    Kirish
                                </Button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <div className="bg-background/80 border border-border/40 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <UserButton appearance={{ elements: { avatarBox: "h-11 w-11" } }} />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">Shaxsiy Kabinet</span>
                                    <span className="text-[11px] text-muted-foreground">Profilni boshqarish</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                    </SignedIn>
                </div>
            </div>
        </>
    );
}

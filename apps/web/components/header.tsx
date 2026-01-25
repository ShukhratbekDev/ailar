"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, ChevronRight } from "lucide-react";
import { AilarLogo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Yangiliklar", href: "/news" },
    { name: "Vositalar", href: "/tools" },
    { name: "Promptlar", href: "/prompts" },
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
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity z-50">
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
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3 z-50">
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
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl md:hidden pt-24 px-6 animate-in fade-in slide-in-from-top-10 duration-200">
                    <nav className="flex flex-col gap-4">
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl text-lg font-medium transition-all border border-transparent",
                                        isActive
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "hover:bg-muted/50 text-foreground"
                                    )}
                                >
                                    {item.name}
                                    <ChevronRight className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                </Link>
                            )
                        })}

                        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col gap-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="outline" size="lg" className="w-full justify-center text-base" onClick={() => setMobileMenuOpen(false)}>
                                        Kirish
                                    </Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button size="lg" className="w-full justify-center text-base bg-primary shadow-lg shadow-primary/20" onClick={() => setMobileMenuOpen(false)}>
                                        <Sparkles className="mr-2 h-4 w-4" /> Ro'yxatdan o'tish
                                    </Button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center justify-center py-4">
                                    <UserButton showName />
                                </div>
                            </SignedIn>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

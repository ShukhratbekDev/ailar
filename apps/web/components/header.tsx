import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center gap-4 px-4 md:px-6 mx-auto">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                        <Bot className="h-6 w-6" />
                    </div>
                    <span>Ailar</span>
                </Link>
                <nav className="flex-1 hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/catalog" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Katalog
                    </Link>
                    <Link href="/news" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Yangiliklar
                    </Link>
                    <Link href="/prompts" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Promptlar
                    </Link>
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Kirish</Button>
                    <Button size="sm">Ro'yxatdan o'tish</Button>
                </div>
            </div>
        </header>
    );
}

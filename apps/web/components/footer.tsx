import Link from "next/link";
import { Send, ArrowUpRight } from "lucide-react";
import { AilarLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 py-8 md:px-6">
                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-12 lg:gap-16 mb-4">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <div className="bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground p-1.5 rounded-xl shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                                <AilarLogo className="h-6 w-6" />
                            </div>
                            <span className="font-heading text-2xl font-black tracking-tight">Ailar</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            AI vositalari, so'nggi yangiliklar va foydali bilimlar — barchasi o'zbek tilida.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="https://t.me/ailar_uz"
                                target="_blank"
                                className="group relative p-2.5 rounded-lg bg-muted/50 hover:bg-blue-500 transition-all duration-300"
                            >
                                <Send className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                                <span className="sr-only">Telegram</span>
                            </Link>
                            <Link
                                href="#"
                                target="_blank"
                                className="group relative p-2.5 rounded-lg bg-muted/50 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                            >
                                <svg className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link
                                href="#"
                                target="_blank"
                                className="group relative p-2.5 rounded-lg bg-muted/50 hover:bg-blue-700 transition-all duration-300"
                            >
                                <svg className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                            <Link
                                href="#"
                                target="_blank"
                                className="group relative p-2.5 rounded-lg bg-muted/50 hover:bg-black dark:hover:bg-white transition-all duration-300"
                            >
                                <svg className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="sr-only">X (Twitter)</span>
                            </Link>
                            <Link
                                href="#"
                                target="_blank"
                                className="group relative p-2.5 rounded-lg bg-muted/50 hover:bg-blue-600 transition-all duration-300"
                            >
                                <svg className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="sr-only">Facebook</span>
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Vositalar
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/prompts" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Promptlar
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Yangiliklar
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Haqimizda
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Aloqa
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Maxfiylik
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                                        Shartlar
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-center items-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Ailar • Shukhratbek Mamadaliev
                    </p>
                </div>
            </div>
        </footer>
    );
}

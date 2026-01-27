import { db } from "@/db";
import { glossary } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Search, Sparkles, BookOpen, Brain, Zap, Layout, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isEditor } from "@/lib/auth";
import { DeleteButton } from "../[slug]/delete-button";
import { deleteGlossaryTerm } from "@/app/actions/education-client";
import { GlossaryList } from "./glossary-list";

export default async function GlossaryPage() {
    const editor = await isEditor();
    const allTerms = await db.select().from(glossary).orderBy(asc(glossary.term));

    // Data for display
    const displayTerms = allTerms.length > 0 ? allTerms : [
        { id: 0, term: "Artificial Intelligence", slug: "ai", definition: "Sun'iy intellekt - inson aqliy jarayonlarini kompyuter tizimlari tomonidan simulyatsiya qilinishi. Bunga o'rganish, mulohaza yuritish va o'zini o'zi tuzatish kiradi.", category: "Asoslar" },
        { id: 0, term: "Large Language Model", slug: "llm", definition: "Katta til modeli (LLM) - chuqur o'rganish algoritmi bo'lib, juda katta hajmdagi ma'lumotlar asosida matnni tushunish, umumlashtirish, yaratish va bashorat qilishga qodir.", category: "Modellar" },
        { id: 0, term: "Fine-tuning", slug: "fine-tuning", definition: "Tayyor modelni ma'lum bir soha yoki vazifaga yaxshiroq moslashtirish uchun qo'shimcha kichikroq ma'lumotlar to'plami bilan qayta o'qitish jarayoni.", category: "Trening" },
        { id: 0, term: "Machine Learning", slug: "ml", definition: "Mashinali o'rganish - sun'iy intellektning bir qismi bo'lib, tizimlarga aniq dasturlanmagan holda tajriba orqali topshiriqlarni bajarishni o'rgatish texnologiyasi.", category: "AI turlari" },
        { id: 0, term: "Prompt Engineering", slug: "prompt-engineering", definition: "AI modellaridan maksimal darajada foydalanish va aniqroq javoblar olish uchun kirish buyruqlarini (promptlarni) loyihalash va optimallashtirish jarayoni.", category: "Promptlar" },
        { id: 0, term: "RAG", slug: "rag", definition: "Retrieval-Augmented Generation - LLM'ning bilimini tashqi ishonchli manbalar bilan boyitish, javoblarning aniqligi va dolzarbligini oshirish usuli.", category: "Tizimlar" }
    ];

    // Group terms by first letter
    type TermItem = typeof displayTerms[0];
    const groupedTerms: Record<string, TermItem[]> = {};
    displayTerms.forEach(item => {
        const letter = item.term?.[0]?.toUpperCase() || '#';
        if (!groupedTerms[letter]) groupedTerms[letter] = [];
        groupedTerms[letter].push(item);
    });

    const letters = Object.keys(groupedTerms).sort();

    return (
        <main className="min-h-screen bg-background pb-32">
            {/* Header section with grid background */}
            <header className="relative pt-32 pb-24 overflow-hidden border-b border-border/40">
                <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-30" />

                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="flex items-center justify-end">
                            {editor && (
                                <Button size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white border-primary/20 transition-all font-bold gap-2" asChild>
                                    <Link href="/learn/glossary/new">
                                        <Plus className="h-4 w-4" />
                                        Atama Qo&apos;shish
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                                AI Atamalar <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                                    Lug&apos;ati
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                                Sun&apos;iy intellekt sohasidagi eng muhim terminlar va tushunchalarning professional o&apos;zbek tilidagi tushuntirishlari.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <GlossaryList initialTerms={displayTerms as any} editor={editor} />

            {/* CTA Section */}
            <section className="container mx-auto px-4 pt-40">
                <div className="bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center text-primary-foreground">
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.1] -z-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto shadow-2xl">
                            <Brain className="h-10 w-10" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">AI Bilimingizni <br /> Keyingi Bosqichga Oling</h2>
                        <p className="text-primary-foreground/80 text-lg leading-relaxed font-light">
                            Faqat lug&apos;at bilan cheklanib qolmang. To&apos;liq formatli kurslarimizda barcha atamalarning amaliy qo&apos;llanilishini o&apos;rganing.
                        </p>
                        <Button size="lg" className="h-14 px-10 rounded-2xl bg-white text-primary hover:bg-white/90 font-black shadow-xl" asChild>
                            <Link href="/learn">Barcha Kurslarni Ko&apos;rish</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    GraduationCap,
    Play,
    Clock,
    ChevronRight,
    Sparkles,
    BookOpen,
    Layout,
    Search,
    Brain,
    Rocket,
    BarChart,
    Globe
} from "lucide-react";
import { db } from "@/db";
import { courses, lessons, userProgress } from "@/db/schema";
import { desc, eq, and, ilike, or } from "drizzle-orm";
import { isEditor } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { Progress } from "@/components/ui/progress";
import { Plus, Settings, CheckCircle2 } from "lucide-react";
import { CourseSearch } from "./course-search";
import { CourseFilters } from "./course-filters";

export const dynamic = 'force-dynamic';

interface LearnPageProps {
    searchParams: Promise<{
        q?: string;
        difficulty?: string;
        language?: string;
        category?: string;
    }>;
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
    const params = await searchParams;
    const editorPermission = await isEditor();
    const { userId } = await auth();

    // Build query conditions
    const conditions = [eq(courses.status, 'published')];

    if (params.q) {
        conditions.push(or(
            ilike(courses.title, `%${params.q}%`),
            ilike(courses.description, `%${params.q}%`)
        )!);
    }

    if (params.difficulty) {
        conditions.push(eq(courses.difficulty, params.difficulty as any));
    }

    if (params.language) {
        conditions.push(eq(courses.language, params.language));
    }

    if (params.category) {
        conditions.push(eq(courses.category, params.category));
    }

    const allCourses = await db.select().from(courses)
        .where(and(...conditions))
        .orderBy(desc(courses.createdAt));

    // Fetch user progress for these courses if logged in
    const userProgressMap: Record<number, { completed: number, total: number }> = {};
    if (userId && allCourses.length > 0) {
        for (const course of allCourses) {
            const courseLessons = await db.query.lessons.findMany({
                where: eq(lessons.courseId, course.id)
            });
            const progress = await db
                .select()
                .from(userProgress)
                .where(
                    and(
                        eq(userProgress.userId, userId),
                        eq(userProgress.courseId, course.id)
                    )
                );
            userProgressMap[course.id] = {
                completed: progress.length,
                total: courseLessons.length
            };
        }
    }

    // Fallback courses if DB is empty for initial demo
    const isFiltered = params.q || params.difficulty || params.language || params.category;
    const displayCourses = allCourses.length > 0 ? allCourses : (isFiltered ? [] : [
        {
            id: 1,
            title: "Sun'iy Intellekt Asoslari",
            description: "AI dunyosiga birinchi qadam. LLMlar qanday ishlaydi va ulardan kundalik hayotda foydalanish.",
            difficulty: "beginner",
            category: "Asoslar",
            duration: "2 soat",
            imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
            slug: "ai-asoslari",
            language: "uz"
        },
        {
            id: 2,
            title: "Professional Prompt Engineering",
            description: "ChatGPT, Claude va Midjourney uchun mukammal promptlar yozish san'atini o'rganing.",
            difficulty: "intermediate",
            category: "Promptlar",
            duration: "4 soat",
            imageUrl: "https://images.unsplash.com/photo-1676299081847-824916de030a?q=80&w=1000&auto=format&fit=crop",
            slug: "prompt-engineering",
            language: "uz"
        },
        {
            id: 3,
            title: "AI bilan Biznesni Avtomatlashtirish",
            description: "AI agentlar yordamida biznes jarayonlarni avtomatlashtirish va samaradorlikni oshirish.",
            difficulty: "advanced",
            category: "Biznes",
            duration: "6 soat",
            imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4628c6bb3?q=80&w=1000&auto=format&fit=crop",
            slug: "ai-biznes",
            language: "uz"
        }
    ]);

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Hero Header */}
            <div className="relative border-b border-border/40 pt-20 md:pt-24 pb-16 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl">
                        <Badge variant="outline" className="mb-6 py-1 px-4 rounded-full bg-primary/5 text-primary border-primary/20 animate-fade-in">
                            <Sparkles className="h-3 w-3 mr-2" />
                            Ailar Ta'lim Hub
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 animate-fade-in-up">
                            AI Kelajagini <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-600">
                                Bugun O'rganing
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 animate-fade-in-up [animation-delay:100ms]">
                            Sizning sun'iy intellekt dunyosidagi yo'lboshchingiz. Eng so'nggi texnologiyalarni o'zbek tilida professional darajada o'rganing.
                        </p>

                        <div className="flex flex-wrap gap-4 animate-fade-in-up [animation-delay:200ms]">
                            <Button size="lg" className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
                                Boshlash <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-bold bg-background/50 backdrop-blur-sm">
                                Katalog <Layout className="ml-2 h-4 w-4" />
                            </Button>

                            {editorPermission && (
                                <div className="flex gap-2">
                                    <Button size="lg" variant="secondary" className="rounded-full px-6 h-12 font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" asChild>
                                        <Link href="/learn/new">
                                            <Plus className="mr-2 h-4 w-4" /> Kurs
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="secondary" className="rounded-full px-6 h-12 font-bold bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20" asChild>
                                        <Link href="/learn/lessons/new">
                                            <Plus className="mr-2 h-4 w-4" /> Dars
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Bar */}
            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Brain, label: "O'zbek tilida", desc: "Soddalashtirilgan metodika" },
                        { icon: Play, label: "Video Darslar", desc: "Amaliy mashg'ulotlar" },
                        { icon: BookOpen, label: "Lug'at", desc: " 전문 AI Atamalar" },
                        { icon: Rocket, label: "Sertifikat", desc: "Kurs yakunida" }
                    ].map((feat, i) => (
                        <div key={i} className="bg-card/50 backdrop-blur-xl border border-border/40 p-5 rounded-3xl hover:border-primary/20 transition-all hover:shadow-xl group">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                                <feat.icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm mb-1">{feat.label}</h3>
                            <p className="text-[11px] text-muted-foreground">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <section className="container mx-auto px-4 py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
                            <span className="w-8 h-[2px] bg-primary" />
                            Akademiya
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black font-heading">Siz uchun tanlangan kurslar</h2>
                    </div>

                    <Suspense fallback={<div className="h-12 w-full max-w-md bg-muted/30 rounded-2xl animate-pulse" />}>
                        <CourseSearch />
                    </Suspense>
                </div>

                <CourseFilters />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {displayCourses.length > 0 ? (
                        displayCourses.map((course: any) => {
                            const isExternal = !!course.externalUrl;
                            const href = isExternal ? course.externalUrl : `/learn/${course.slug}`;

                            return (
                                <Link
                                    key={course.id}
                                    href={href}
                                    target={isExternal ? "_blank" : "_self"}
                                    className="group block h-full"
                                >
                                    <Card className="flex flex-col h-full rounded-[2.5rem] border border-border/40 bg-card overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 relative">
                                        <div className="relative aspect-[16/10] overflow-hidden">
                                            {course.imageUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={course.imageUrl}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5 flex items-center justify-center">
                                                    <Sparkles className="h-12 w-12 text-primary/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <Badge className={`
                                                    ${course.difficulty === 'beginner' ? 'bg-emerald-500/90' :
                                                        course.difficulty === 'intermediate' ? 'bg-amber-500/90' : 'bg-rose-500/90'} 
                                                    text-white border-0 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest
                                                `}>
                                                    {course.difficulty === 'beginner' ? 'Boshlang\'ich' :
                                                        course.difficulty === 'intermediate' ? 'O\'rta' : 'Murakkab'}
                                                </Badge>

                                                {course.language && course.language !== 'uz' && (
                                                    <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest w-fit">
                                                        {course.language === 'en' ? 'English' : course.language === 'ru' ? 'Russian' : course.language}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Progress Indicator on Card */}
                                            {userId && userProgressMap[course.id] && (
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    {userProgressMap[course.id]!.completed === userProgressMap[course.id]!.total && userProgressMap[course.id]!.total > 0 ? (
                                                        <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                    ) : userProgressMap[course.id]!.completed > 0 ? (
                                                        <div className="h-8 w-8 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary text-[10px] font-black">
                                                            {Math.round((userProgressMap[course.id]!.completed / userProgressMap[course.id]!.total) * 100)}%
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}

                                            {isExternal && !userProgressMap[course.id]?.completed && (
                                                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                            )}

                                            <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform">
                                                {isExternal ? <Rocket className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white fill-white" />}
                                            </div>
                                        </div>

                                        <CardContent className="p-8 flex flex-col flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold uppercase rounded-md tracking-wider">
                                                    {course.category}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {course.duration}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {course.title}
                                            </h3>

                                            <p className="text-muted-foreground text-sm line-clamp-3 mb-8 leading-relaxed font-light">
                                                {course.description}
                                            </p>

                                            {userId && userProgressMap[course.id] && userProgressMap[course.id]!.completed > 0 && (
                                                <div className="mb-6 space-y-2">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                        <span>Progress</span>
                                                        <span>{Math.round((userProgressMap[course.id]!.completed / userProgressMap[course.id]!.total) * 100)}%</span>
                                                    </div>
                                                    <Progress value={(userProgressMap[course.id]!.completed / userProgressMap[course.id]!.total) * 100} className="h-1" />
                                                </div>
                                            )}

                                            <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between">
                                                <span className="text-primary font-bold text-sm tracking-tight flex items-center gap-2 group-hover:gap-3 transition-all">
                                                    {isExternal ? 'Manbaga o\'tish' : (userProgressMap[course.id]?.completed ? 'Davom ettirish' : 'O\'rganishni boshlash')} <ChevronRight className="h-4 w-4" />
                                                </span>
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                                                            <img src={`https://i.pravatar.cc/100?u=${course.id + i}`} alt="Student" />
                                                        </div>
                                                    ))}
                                                    <div className="h-6 w-6 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                                        +12
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground/40">
                                <Search className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">Hech narsa topilmadi</h3>
                                <p className="text-muted-foreground text-sm">Qidiruv shartlarini o'zgartirib ko'ring yoki barcha filtrlarni bekor qiling.</p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-full px-8"
                                asChild
                            >
                                <Link href="/learn">Filtrlarni tozalash</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Glossary Preview */}
            <section className="container mx-auto px-4 pb-32">
                <div className="relative rounded-[3rem] overflow-hidden bg-foreground text-background p-12 md:p-20">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <Badge variant="outline" className="text-background border-background/20 bg-background/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
                                <Sparkles className="h-3 w-3 mr-2" />
                                <span className="text-white">Foydali Manbalar</span>
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight"> Sun'iy Intellekt <br /> Atamalar Lug'ati </h2>
                            <p className="text-lg text-background/60 leading-relaxed font-light max-w-xl">
                                Murakkab AI terminologiyasini tushunarli o'zbek tilida o'rganing. 100 dan ortiq professional atamalar va ularning izohlari.
                            </p>
                            <Button size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90 font-bold px-10 h-14" asChild>
                                <Link href="/learn/glossary">Lug'atni Ko'rish</Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { term: "LLM", def: "Large Language Model - Katta til modeli" },
                                { term: "RAG", def: "Retrieval-Augmented Generation" },
                                { term: "NLP", def: "Natural Language Processing" },
                                { term: "Tokens", def: "Matnni qayta ishlash birligi" }
                            ].map((item, i) => (
                                <div key={i} className="bg-background/10 backdrop-blur-md border border-background/10 p-6 rounded-3xl hover:bg-background/20 transition-all cursor-default group">
                                    <h4 className="text-primary font-black text-xl mb-2 group-hover:scale-110 transition-transform origin-left">{item.term}</h4>
                                    <p className="text-background/50 text-xs leading-relaxed">{item.def}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

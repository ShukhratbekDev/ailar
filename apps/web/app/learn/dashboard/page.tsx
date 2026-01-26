import { db } from "@/db";
import { courses, lessons, userProgress, quizResults } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Layout,
    BookOpen,
    Trophy,
    Clock,
    ChevronRight,
    PlayCircle,
    ArrowLeft,
    GraduationCap,
    TrendingUp,
    CheckCircle2,
    HelpCircle
} from "lucide-react";
import { SkillsRadar } from "./skills-radar";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // Fetch all user progress
    const allProgress = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    const completedLessonIds = new Set(allProgress.map(p => p.lessonId));

    // Get unique course IDs the user has progress in
    const uniqueCourseIds = Array.from(new Set(allProgress.map(p => p.courseId)));

    // Fetch details for these courses
    const userCourses = uniqueCourseIds.length > 0
        ? await db.query.courses.findMany({
            where: (courses, { inArray }) => inArray(courses.id, uniqueCourseIds)
        })
        : [];

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(userCourses.map(async (course) => {
        const courseLessons = await db.query.lessons.findMany({
            where: eq(lessons.courseId, course.id),
            orderBy: [desc(lessons.sequence)]
        });

        const completedCount = allProgress.filter(p => p.courseId === course.id).length;
        const totalCount = courseLessons.length;
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Find the last completed lesson
        const lastCompleted = allProgress
            .filter(p => p.courseId === course.id)
            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0];

        return {
            ...course,
            completedCount,
            totalCount,
            percentage,
            lastCompletedAt: lastCompleted?.completedAt
        };
    }));

    // Sort by most recent activity
    const sortedCourses = coursesWithProgress.sort((a, b) =>
        (b.lastCompletedAt?.getTime() || 0) - (a.lastCompletedAt?.getTime() || 0)
    );

    const activeCourses = sortedCourses.filter(c => c.percentage < 100);
    const completedCourses = sortedCourses.filter(c => c.percentage === 100);

    // Fetch quiz results
    const allQuizResults = await db.select().from(quizResults).where(eq(quizResults.userId, userId));
    const passedQuizzes = allQuizResults.filter(r => r.passed);

    // Gamification Logic
    const XP_PER_LESSON = 10;
    const BONUS_PER_COURSE = 50;
    const XP_PER_QUIZ = 30;
    const totalXP = (completedLessonIds.size * XP_PER_LESSON) +
        (completedCourses.length * BONUS_PER_COURSE) +
        (passedQuizzes.length * XP_PER_QUIZ);

    const getLevelInfo = (xp: number) => {
        if (xp < 100) return { level: 1, name: "Novda", nextXP: 100, prevXP: 0 };
        if (xp < 300) return { level: 2, name: "Nihol", nextXP: 300, prevXP: 100 };
        if (xp < 700) return { level: 3, name: "Zukko", nextXP: 700, prevXP: 300 };
        if (xp < 1500) return { level: 4, name: "Bilimdon", nextXP: 1500, prevXP: 700 };
        return { level: 5, name: "Donishmand", nextXP: 5000, prevXP: 1500 };
    };

    const levelInfo = getLevelInfo(totalXP);
    const levelProgress = ((totalXP - levelInfo.prevXP) / (levelInfo.nextXP - levelInfo.prevXP)) * 100;

    // Skills Radar Data
    const allCourses = await db.query.courses.findMany();
    const categories = Array.from(new Set(allCourses.map(c => c.category)));
    const radarData = await Promise.all(categories.map(async (cat) => {
        const catCourses = allCourses.filter(c => c.category === cat);
        const catCourseIds = catCourses.map(c => c.id);
        const catLessonsCount = (await db.query.lessons.findMany({
            where: (lessons, { inArray }) => inArray(lessons.courseId, catCourseIds)
        })).length;
        const catCompletedCount = allProgress.filter(p => catCourseIds.includes(p.courseId)).length;
        const catPercentage = catLessonsCount > 0 ? Math.round((catCompletedCount / catLessonsCount) * 100) : 0;
        return { subject: cat || "General", A: catPercentage, fullMark: 100 };
    }));

    return (
        <main className="min-h-screen bg-background pt-32 pb-24 selection:bg-primary/20">
            {/* Background Decor */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-16">

                    {/* Header: Title & Stats */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <Link href="/learn" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors gap-2">
                                <ArrowLeft className="h-3 w-3" /> Katalogga qaytish
                            </Link>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">Mening Ta&apos;limim</h1>
                            <p className="text-muted-foreground text-lg font-light max-w-lg">Sizning o&apos;quv jarayoningiz, malakangiz va erishilgan yutuqlaringiz markazi.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { label: "Tugallangan", val: `${completedCourses.length} ta`, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                { label: "Darslar", val: `${completedLessonIds.size} ta`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
                                { label: "Testlar", val: `${passedQuizzes.length} ta`, icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-500/10" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-card/40 backdrop-blur-xl border border-border/40 p-5 rounded-[2rem] flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">{stat.label}</span>
                                        <span className="text-xl font-black">{stat.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Layout Grid */}
                    <div className="grid lg:grid-cols-12 gap-8 items-start">

                        {/* Main Column (8) */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Active Courses */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                        <PlayCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">Davom ettirilayotgan kurslar</h2>
                                </div>

                                {activeCourses.length > 0 ? (
                                    <div className="grid gap-6">
                                        {activeCourses.map(course => (
                                            <Link key={course.id} href={`/learn/${course.slug}`}>
                                                <Card className="group rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl hover:border-primary/30 transition-all hover:shadow-2xl overflow-hidden">
                                                    <CardContent className="p-0">
                                                        <div className="flex flex-col sm:flex-row sm:h-52">
                                                            <div className="w-full sm:w-1/3 relative overflow-hidden h-40 sm:h-full shrink-0">
                                                                <img
                                                                    src={course.imageUrl || ""}
                                                                    alt={course.title}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                />
                                                                <div className="absolute inset-0 bg-black/20" />
                                                            </div>
                                                            <div className="flex-1 p-8 flex flex-col justify-between">
                                                                <div>
                                                                    <Badge variant="secondary" className="mb-2 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                                                        {course.category}
                                                                    </Badge>
                                                                    <h3 className="text-2xl font-black line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                                        <span className="text-muted-foreground">O&apos;zlashtirish darajasi</span>
                                                                        <span className="text-primary font-black">{course.percentage}%</span>
                                                                    </div>
                                                                    <Progress value={course.percentage} className="h-2" />
                                                                    <div className="flex items-center justify-between mt-4">
                                                                        <span className="text-[11px] text-muted-foreground font-medium">{course.completedCount} / {course.totalCount} dars yakunlandi</span>
                                                                        <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/10">
                                                                            O&apos;qishni davom etish <ChevronRight className="ml-2 h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="rounded-[3rem] border-dashed border-2 border-border/40 bg-muted/5 p-16 flex flex-col items-center text-center space-y-6">
                                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-50">
                                            <BookOpen className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Hech qanday kurs faol emas</h3>
                                            <p className="text-muted-foreground font-light max-w-xs mx-auto mt-2">Katalogimizdagi kurslar bilan tanishing va o&apos;rganishni boshlang.</p>
                                        </div>
                                        <Button className="rounded-full px-8 h-12 font-black" asChild>
                                            <Link href="/learn">Boshlash</Link>
                                        </Button>
                                    </Card>
                                )}
                            </section>

                            {/* Completed Courses Section (Horizontal Scroll or Grid) */}
                            {completedCourses.length > 0 && (
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-2xl font-black tracking-tight">Tamomlangan kurslar</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {completedCourses.map(course => (
                                            <Link key={course.id} href={`/learn/${course.slug}/certificate`}>
                                                <Card className="group rounded-[2.5rem] bg-card/40 border-border/40 hover:border-emerald-500/30 transition-all overflow-hidden">
                                                    <div className="aspect-[2/1] relative overflow-hidden">
                                                        <img src={course.imageUrl || ""} alt={course.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                        <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
                                                        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-6">
                                                        <h4 className="font-black text-lg line-clamp-1 group-hover:text-emerald-500 transition-colors">{course.title}</h4>
                                                        <Button variant="ghost" className="w-full mt-4 rounded-xl font-bold text-emerald-500 hover:bg-emerald-500/10">
                                                            Sertifikat <GraduationCap className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar Column (4) */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Skills Radar */}
                            <SkillsRadar data={radarData} />

                            {/* Ranking Card */}
                            <Card className="rounded-[3rem] border-border/40 bg-foreground text-background overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                <CardContent className="p-10 space-y-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[1.75rem] bg-primary flex flex-col items-center justify-center shadow-2xl shadow-primary/30 shrink-0">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">LEVEL</span>
                                            <span className="text-3xl font-black">{levelInfo.level}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black tracking-tight text-primary leading-none mb-2">{levelInfo.name}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-background/40">Student Ranking</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-background/30">
                                            <span>Progress to Level {levelInfo.level + 1}</span>
                                            <span className="text-primary">{Math.round(levelProgress)}%</span>
                                        </div>
                                        <Progress value={levelProgress} className="h-2.5 bg-white/5 [&>div]:bg-primary" />
                                        <p className="text-[10px] text-background/50 font-medium italic text-center">
                                            Sizda jami {totalXP} XP bor. Yana {levelInfo.nextXP - totalXP} XP to&apos;plab keyingi darajaga o&apos;ting.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Activity Stats */}
                            <Card className="rounded-[3rem] border-border/40 bg-card/40 backdrop-blur-xl p-8 space-y-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Layout className="h-4 w-4" /> Oylik Statistika
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Yangi atamalar", val: "12 ta", icon: BookOpen },
                                        { label: "O'qish vaqti", val: "4.5 soat", icon: Clock },
                                        { label: "AI Testlar", val: `${passedQuizzes.length} ta`, icon: Trophy }
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-muted/20 border border-border/20">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-background flex items-center justify-center">
                                                    <s.icon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-bold text-muted-foreground">{s.label}</span>
                                            </div>
                                            <span className="font-black text-primary">{s.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

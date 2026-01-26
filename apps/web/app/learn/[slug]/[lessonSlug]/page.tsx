import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Menu,
    Play,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Search,
    BookOpen,
    Layout,
    Edit,
    Trash
} from "lucide-react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isEditor } from "@/lib/auth";
import { deleteLesson, toggleLessonProgress } from "@/app/actions/education";
import { DeleteButton } from "../delete-button";
import { auth } from "@clerk/nextjs/server";
import { userProgress, glossary, discussions } from "@/db/schema";
import { MarkCompleteButton } from "./mark-complete-button";
import { DiscussionSection } from "@/components/discussions/discussion-section";

export default async function LessonPage({
    params
}: {
    params: { slug: string, lessonSlug: string }
}) {
    const p = await params;
    const { userId } = await auth();

    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) notFound();

    const currentLesson = await db.query.lessons.findFirst({
        where: and(
            eq(lessons.courseId, course.id),
            eq(lessons.slug, p.lessonSlug)
        )
    });

    if (!currentLesson) notFound();

    const [allGlossaryTerms, lessonDiscussions, allLessons] = await Promise.all([
        db.select().from(glossary),
        db.query.discussions.findMany({
            where: eq(discussions.lessonId, currentLesson.id),
            orderBy: [asc(discussions.createdAt)]
        }),
        db.query.lessons.findMany({
            where: eq(lessons.courseId, course.id),
            orderBy: [asc(lessons.sequence)]
        })
    ]);

    // Fetch user progress for all lessons in this course
    const completedLessonIds = new Set<number>();
    if (userId) {
        const progress = await db
            .select({ lessonId: userProgress.lessonId })
            .from(userProgress)
            .where(
                and(
                    eq(userProgress.userId, userId),
                    eq(userProgress.courseId, course.id)
                )
            );
        progress.forEach(p => completedLessonIds.add(p.lessonId));
    }

    const hasPermission = await isEditor();

    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = allLessons[currentIndex + 1];
    const prevLesson = allLessons[currentIndex - 1];

    const currentIsCompleted = completedLessonIds.has(currentLesson.id);
    const courseCompletionPercentage = allLessons.length > 0
        ? Math.round((completedLessonIds.size / allLessons.length) * 100)
        : 0;

    return (
        <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/20">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:flex flex-col w-80 border-r border-border/40 bg-card overflow-hidden">
                <div className="p-6 border-b border-border/40 space-y-4">
                    <Link href={`/learn/${course.slug}`} className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                        {course.title}
                    </Link>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black font-heading tracking-tight">Kurs Mundarijasi</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {allLessons.map((lesson, idx) => {
                        const isActive = lesson.slug === currentLesson.slug;
                        const isCompleted = completedLessonIds.has(lesson.id);
                        return (
                            <Link
                                key={lesson.id}
                                href={`/learn/${course.slug}/${lesson.slug}`}
                                className={`
                                    flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group
                                    ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"}
                                `}
                            >
                                <div className={`
                                    h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border text-[10px] font-black
                                    ${isActive ? "bg-white/20 border-white/20" : "bg-background border-border group-hover:border-primary/50"}
                                `}>
                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : String(idx + 1).padStart(2, '0')}
                                </div>
                                <span className={`text-sm font-bold leading-tight line-clamp-2 ${isCompleted && !isActive ? "opacity-50" : ""}`}>{lesson.title}</span>
                                {isActive && <Play className="ml-auto h-3 w-3 fill-current" />}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-6 border-t border-border/40 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Kurs progressi</span>
                        <span className="text-[10px] font-black tracking-widest text-primary uppercase">{courseCompletionPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${courseCompletionPercentage}%` }}
                        />
                    </div>
                </div>
            </aside>

            {/* Main Lesson Content */}
            <main className="flex-1 overflow-y-auto flex flex-col bg-background/30 backdrop-blur-3xl pt-16">
                <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-12">

                    {/* Lesson Header */}
                    <header className="space-y-8 animate-fade-in-up">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                    {course.category}
                                </Badge>
                                <span className="text-muted-foreground/30">•</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                    <Clock className="h-3.5 w-3.5" />
                                    {currentLesson.duration || 10} daqiqa o&apos;qish
                                </div>
                            </div>

                            {hasPermission && (
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-full h-9 px-4 font-bold border-border/40 hover:bg-muted" asChild>
                                        <Link href={`/learn/${course.slug}/${currentLesson.slug}/edit`}>
                                            <Edit className="h-3.5 w-3.5 mr-2" /> Tahrirlash
                                        </Link>
                                    </Button>
                                    <DeleteButton
                                        id={currentLesson.id}
                                        type="lesson"
                                        courseSlug={course.slug}
                                        action={async (id, slug) => {
                                            'use server';
                                            return await deleteLesson(id, slug || "");
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            {currentLesson.title}
                        </h1>

                        {/* Video Background Effect */}
                        {currentLesson.videoUrl && (
                            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border border-border group">
                                <iframe
                                    src={currentLesson.videoUrl.replace("watch?v=", "embed/")}
                                    className="absolute inset-0 w-full h-full"
                                    allowFullScreen
                                    title={currentLesson.title}
                                />
                                <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge className="bg-rose-600 text-white font-black border-0">ONLINE</Badge>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Lesson Body (Markdown) */}
                    <article className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:font-black prose-headings:font-heading prose-headings:tracking-tight 
                        prose-p:leading-8 prose-p:text-muted-foreground prose-p:font-light 
                        prose-strong:font-black prose-strong:text-foreground
                        prose-img:rounded-[2rem] prose-img:border prose-img:border-border/50
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/[0.03] prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
                        animate-fade-in-up [animation-delay:200ms]
                    ">
                        <MarkdownPreview content={currentLesson.content} glossaryTerms={allGlossaryTerms} />
                    </article>

                    {/* Completion Action */}
                    {userId && (
                        <div className="pt-12 flex justify-center animate-fade-in-up [animation-delay:300ms]">
                            <MarkCompleteButton
                                lessonId={currentLesson.id}
                                courseId={course.id}
                                courseSlug={course.slug}
                                nextLessonSlug={nextLesson?.slug}
                                initialIsCompleted={currentIsCompleted}
                            />
                        </div>
                    )}

                    {/* Lesson Navigation (Prev/Next) */}
                    <div className="pt-20 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up [animation-delay:400ms]">
                        {prevLesson ? (
                            <Link href={`/learn/${course.slug}/${prevLesson.slug}`} className="group">
                                <div className="p-6 rounded-3xl border border-border hover:border-primary/30 bg-card/10 transition-all flex items-center gap-4 text-left">
                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                        <ChevronLeft className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Oldingi dars</span>
                                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{prevLesson.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        ) : <div />}

                        {nextLesson ? (
                            <Link href={`/learn/${course.slug}/${nextLesson.slug}`} className="group">
                                <div className="p-6 rounded-3xl border border-border hover:border-primary/30 bg-card/10 transition-all flex items-center gap-4 text-right justify-end ml-auto">
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Keyingi dars</span>
                                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{nextLesson.title}</h4>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <ChevronRight className="h-6 w-6" />
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="p-6 rounded-3xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.02] flex items-center justify-center text-center">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-emerald-500">KURS YAKUNLANDI</span>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Barcha darslar o&apos;zlashtirildi</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Community Discussions */}
                    <DiscussionSection
                        targetId={currentLesson.id}
                        targetType="lesson"
                        initialComments={lessonDiscussions as any}
                        currentUserId={userId}
                        isEditor={hasPermission}
                        title="Dars Muhokamasi"
                    />
                </div>

                {/* Sticky Footer Progress (Mobile Only) */}
                <div className="lg:hidden sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-between">
                    <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12" asChild>
                        <Link href={`/learn/${course.slug}`}><Menu className="h-6 w-6" /></Link>
                    </Button>
                    <div className="flex-1 px-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Dars {currentIndex + 1} / {allLessons.length}</span>
                    </div>
                    {nextLesson ? (
                        <Button className="rounded-xl h-12 px-6 font-bold" asChild>
                            <Link href={`/learn/${course.slug}/${nextLesson.slug}`}>Keyingisi <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    ) : (
                        <Button className="rounded-xl h-12 px-6 font-bold bg-emerald-600 hover:bg-emerald-700" asChild>
                            <Link href="/learn"><CheckCircle2 className="mr-2 h-4 w-4" /> Yakunlash</Link>
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}

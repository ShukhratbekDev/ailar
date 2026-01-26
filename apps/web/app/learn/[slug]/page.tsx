import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Clock,
    BookOpen,
    ArrowLeft,
    CheckCircle,
    Layers,
    Globe,
    ChevronRight,
    PlayCircle,
    Edit,
    Trash,
    ShieldCheck,
    HelpCircle
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { isEditor } from "@/lib/auth";
import { deleteCourse, deleteLesson } from "@/app/actions/education";
import { DeleteButton } from "./delete-button";
import { auth } from "@clerk/nextjs/server";
import { userProgress, quizzes, questions, quizResults } from "@/db/schema";
import { and } from "drizzle-orm";
import { ProgressToggle } from "./progress-toggle";
import { Progress } from "@/components/ui/progress";
import { QuizView } from "./quiz";

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const p = await params;
    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) return { title: "Kurs topilmadi" };

    return {
        title: `${course.title} | Ailar Ta'lim`,
        description: course.description
    };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
    const p = await params;
    const { userId } = await auth();

    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) notFound();

    if (course.externalUrl) {
        redirect(course.externalUrl);
    }

    const courseLessons = await db.query.lessons.findMany({
        where: eq(lessons.courseId, course.id),
        orderBy: [asc(lessons.sequence)]
    });

    // Fetch quiz for this course
    const courseQuiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.courseId, course.id),
        with: {
            questions: true
        }
    });

    // Fetch user progress if logged in
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

    const completionPercentage = courseLessons.length > 0
        ? Math.round((completedLessonIds.size / courseLessons.length) * 100)
        : 0;

    const hasPermission = await isEditor();

    const languageLabel = course.language === 'en' ? 'Ingliz tili' :
        course.language === 'ru' ? 'Rus tili' : 'O\'zbek tili';

    return (
        <main className="min-h-screen bg-background pb-24">
            {/* Dark Header Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-foreground text-background">
                <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />

                <div className="container mx-auto px-4 relative z-10">
                    <Link href="/learn" className="inline-flex items-center text-background/60 hover:text-white transition-colors gap-2 mb-10 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Ta&apos;lim Katalogiga qaytish
                    </Link>

                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className={`
                                    ${course.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                                        course.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'} 
                                    rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest
                                `}>
                                    {course.difficulty === 'beginner' ? 'Boshlang\'ich' :
                                        course.difficulty === 'intermediate' ? 'O\'rta' : 'Murakkab'}
                                </Badge>
                                <Badge variant="outline" className="text-background/60 border-background/20 rounded-full">{course.category}</Badge>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                                    {course.title}
                                </h1>
                                {hasPermission && (
                                    <div className="flex items-center gap-3 mt-2">
                                        <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 text-white" asChild>
                                            <Link href={`/learn/${course.slug}/edit`}>
                                                <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 text-white" asChild>
                                            <Link href={`/learn/${course.slug}/quiz/manage`}>
                                                <HelpCircle className="h-4 w-4 mr-2" /> Testlarni boshqarish
                                            </Link>
                                        </Button>
                                        <DeleteButton
                                            id={course.id}
                                            type="course"
                                            action={async (id) => {
                                                'use server';
                                                return await deleteCourse(id);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="text-xl text-background/60 max-w-3xl leading-relaxed font-light">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-8 py-4 px-6 rounded-3xl bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-background/40 font-bold uppercase tracking-widest leading-none mb-1">Davomiyligi</span>
                                        <span className="text-sm font-bold">{course.duration || "Noma'lum"}</span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-background/40 font-bold uppercase tracking-widest leading-none mb-1">Darslar soni</span>
                                        <span className="text-sm font-bold">{courseLessons.length} ta dars</span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-background/40 font-bold uppercase tracking-widest leading-none mb-1">Til</span>
                                        <span className="text-sm font-bold">{languageLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Card */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 group">
                            <div className="bg-card text-foreground rounded-[2.5rem] border border-border overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                                <div className="relative aspect-video">
                                    <img
                                        src={course.imageUrl || ""}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group/play">
                                        <div className="h-16 w-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center transition-transform duration-300 group-hover/play:scale-110 shadow-xl">
                                            <Play className="h-8 w-8 fill-current" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 space-y-6">
                                    <div className="space-y-4">
                                        {userId && courseLessons.length > 0 && (
                                            <div className="space-y-2 mb-6 p-4 rounded-2xl bg-muted/50 border border-border/50">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    <span>Sizning natijangiz</span>
                                                    <span>{completionPercentage}%</span>
                                                </div>
                                                <Progress value={completionPercentage} className="h-1.5 bg-background" />
                                            </div>
                                        )}
                                        <Button size="lg" className="w-full rounded-2xl h-14 font-black text-lg shadow-lg shadow-primary/20" asChild>
                                            <Link href={courseLessons.length > 0 ? `/learn/${course.slug}/${courseLessons[0]?.slug}` : "#"}>
                                                O&apos;rganishni Boshlash
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="lg" className="w-full rounded-2xl h-14 font-bold">
                                            Kursni Saqlash
                                        </Button>
                                    </div>
                                    <p className="text-center text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                                        To&apos;liq formatda darsliklar toplami
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Syllabus Section */}
            <section className="container mx-auto px-4 py-24">
                <div className="grid lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-4xl font-black font-heading tracking-tight">Kurs Mundarijasi</h2>
                                    {userId && (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 font-black border-0 px-4 py-1.5 rounded-full">
                                            {completedLessonIds.size} / {courseLessons.length} BAJARILDI
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-lg font-light">
                                    Ushbu kurs davomida siz o&apos;rganadigan mavzular ketma-ketligi. Har bir dars amaliy mashg&apos;ulot va nazariy bilimlar jamlanmasidan iborat.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {courseLessons.map((lesson, idx) => (
                                    <div key={lesson.id} className="group relative">
                                        <Link href={`/learn/${course.slug}/${lesson.slug}`} className="block">
                                            <div className="flex items-center gap-6 p-6 rounded-3xl border border-border/50 hover:border-primary/40 hover:bg-primary/[0.02] transition-all bg-card/10">
                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-lg font-black shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{lesson.title}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                                        <PlayCircle className="h-3 w-3" />
                                                        <span>Video Darslik</span>
                                                        <span>•</span>
                                                        <span>{lesson.duration || 10} daqiqa</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {hasPermission && (
                                                        <div className="flex items-center gap-2 mr-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20 hover:text-primary" asChild>
                                                                <Link href={`/learn/${course.slug}/${lesson.slug}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <DeleteButton
                                                                id={lesson.id}
                                                                type="lesson"
                                                                courseSlug={course.slug}
                                                                action={async (id, slug) => {
                                                                    'use server';
                                                                    return await deleteLesson(id, slug || "");
                                                                }}
                                                                label=""
                                                            />
                                                        </div>
                                                    )}

                                                    {userId && (
                                                        <div className="relative z-20">
                                                            <ProgressToggle
                                                                lessonId={lesson.id}
                                                                courseId={course.id}
                                                                courseSlug={course.slug}
                                                                initialIsCompleted={completedLessonIds.has(lesson.id)}
                                                            />
                                                        </div>
                                                    )}

                                                    <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Quiz Section */}
                            {courseQuiz && courseQuiz.questions.length > 0 && (
                                <div className="pt-24 space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-4xl font-black font-heading tracking-tight">Bilimingizni Sinab ko&apos;ring</h2>
                                            <Badge variant="outline" className="rounded-full px-4 py-1.5 font-black uppercase tracking-widest text-[10px] bg-primary/5 text-primary border-primary/20">
                                                Assessment
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed text-lg font-light">
                                            Kursni to&apos;liq o&apos;zlashtirganingizni tasdiqlash va sertifikat olish uchun ushbu testdan o&apos;tishingiz shart.
                                        </p>
                                    </div>

                                    {completionPercentage === 100 ? (
                                        <QuizView
                                            quiz={courseQuiz as any}
                                            courseSlug={course.slug}
                                        />
                                    ) : (
                                        <div className="p-12 rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/10 text-center space-y-6">
                                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                                <ShieldCheck className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold">Test hali yopiq</h3>
                                                <p className="text-sm text-muted-foreground max-w-sm mx-auto font-light">
                                                    Test topshirish uchun avval barcha darslarni {completedLessonIds.size}/{courseLessons.length} yakunlashingiz kerak.
                                                </p>
                                            </div>
                                            <Button disabled variant="outline" className="rounded-full px-8">
                                                Darslarni yakunlang
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Teacher Info */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold uppercase tracking-widest text-muted-foreground/50 text-[10px]">Taqdimotchi</h3>
                            <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-xl mb-6">
                                    <img src="https://i.pravatar.cc/200" alt="Mentor" className="w-full h-full object-cover" />
                                </div>
                                <h4 className="text-xl font-black mb-1">Shukhratbek M.</h4>
                                <span className="text-sm text-primary font-bold uppercase tracking-widest mb-4">AI Research Engineer</span>
                                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                    Ailar platformasining asoschisi va sun&apos;iy intellekt bo&apos;yicha tadqiqotchi. O&apos;zbekistonda AI sohasini rivojlantirish bilan shug&apos;ullanadi.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Yo&apos;nalishlar</h3>
                            <div className="flex flex-wrap gap-2">
                                {["OpenAI", "LLMs", "Uzbek AI", "Deep Learning", "Automation"].map(tag => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1.5 rounded-xl font-medium text-xs bg-muted/50 border-0">#{tag}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] border border-primary/20 bg-primary/[0.03] space-y-4">
                            <h4 className="font-bold text-lg">Savollaringiz bormi?</h4>
                            <p className="text-sm text-muted-foreground font-light">Darsliklar bo&apos;yicha qo&apos;shimcha savollar bo&apos;lsa, hamjamiyatimizga qo&apos;shiling.</p>
                            <Button variant="link" className="p-0 text-primary font-bold h-auto">Hamjamiyatga qo&apos;shilish <ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

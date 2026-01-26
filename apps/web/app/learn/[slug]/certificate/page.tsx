import { db } from "@/db";
import { courses, lessons, userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Award, CheckCircle2, ShieldCheck, Calendar, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { CertificateActions } from "./certificate-actions";

export default async function CertificatePage({ params }: { params: { slug: string } }) {
    const p = await params;
    const user = await currentUser();
    const { userId } = await auth();
    if (!userId || !user) redirect("/sign-in");

    const userName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` || "Taqdirlovchi";

    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) notFound();

    // Verify completion
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

    if (progress.length < courseLessons.length || courseLessons.length === 0) {
        // Not completed yet
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                        <Award className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black">Kurs hali yakunlanmagan</h1>
                        <p className="text-muted-foreground font-light">Sertifikat olish uchun barcha darslarni muvaffaqiyatli o&apos;zlashtirishingiz kerak.</p>
                    </div>
                    <Button className="rounded-full px-8" asChild>
                        <Link href={`/learn/${course.slug}`}>Kursga qaytish</Link>
                    </Button>
                </div>
            </main>
        );
    }

    const completionDate = progress.sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt || new Date();

    return (
        <main className="min-h-screen bg-[#0a0a0b] text-white pt-32 pb-24 overflow-hidden selection:bg-primary/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Header Actions */}
                    <div className="flex items-center justify-between">
                        <Link href="/learn/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Dashboardga qaytish
                        </Link>
                        <CertificateActions
                            certificateId={userId.substring(0, 12).toUpperCase()}
                            courseTitle={course.title}
                            userName={userName}
                        />
                    </div>

                    {/* The Certificate Card */}
                    <div id="certificate-to-capture" className="relative aspect-[1.414/1] bg-white text-black p-1 md:p-1.5 rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in group">
                        {/* Certificate Border Design */}
                        <div className="absolute inset-0 border-[20px] border-black/5 pointer-events-none" />
                        <div className="absolute inset-4 border border-black/10 pointer-events-none" />

                        <div className="h-full w-full bg-[#fcfcfc] border border-black/5 p-12 md:p-24 flex flex-col items-center text-center justify-between relative">
                            {/* Watermark Logo */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                                <GraduationCap className="w-[400px] h-[400px]" />
                            </div>

                            {/* Top Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-center gap-3 mb-8">
                                    <div className="h-12 w-12 bg-black rounded-xl flex items-center justify-center text-white">
                                        <Award className="h-7 w-7" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter uppercase">Ailar Academy</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-[0.4em] text-black/40">Muvaffaqiyat Sertifikati</h1>
                            </div>

                            {/* Middle Section */}
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <p className="text-lg italic font-serif text-black/60">Ushbu sertifikat bilan tasdiqlanadiki,</p>
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tight underline decoration-primary/30 decoration-8 underline-offset-8">
                                        {userName}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-lg italic font-serif text-black/60">nomli kursni muvaffaqiyatli tamomladi:</p>
                                    <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">
                                        {course.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="w-full grid grid-cols-3 items-end pt-12">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2 text-black/40 mb-1">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sana</span>
                                    </div>
                                    <span className="font-bold text-sm">
                                        {format(completionDate, "d-MMMM, yyyy", { locale: uz })}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="h-24 w-24 relative">
                                        <ShieldCheck className="h-full w-full text-black opacity-5" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-16 w-16 rounded-full border-4 border-double border-primary/20 flex items-center justify-center">
                                                <Award className="h-8 w-8 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-black/30 mt-2">ID: {userId.substring(0, 12).toUpperCase()}</span>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2 text-black/40 mb-1">
                                        <User className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Akademiya direktori</span>
                                    </div>
                                    <span className="font-bold text-sm">Shukhratbek Mamadaliev</span>
                                    <div className="w-32 h-px bg-black/20 mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Interactive Elements */}
                        <div className="absolute top-8 right-8 pointer-events-none">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 opacity-20" />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center space-y-4">
                        <p className="text-sm text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
                            Ushbu sertifikat Ailar Academy tomonidan taqdim etilgan bo&apos;lib, foydalanuvchining sun&apos;iy intellekt sohasidagi malakasini tasdiqlaydi. Sertifikatning haqiqiyligini yuqoridagi ID orqali tekshirish mumkin.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}

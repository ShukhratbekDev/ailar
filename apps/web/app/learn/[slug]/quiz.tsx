'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    Trophy,
    HelpCircle,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitQuiz } from '@/app/actions/education';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Question {
    id: number;
    text: string;
    options: any; // string[]
    correctAnswer: number;
    explanation?: string | null;
}

interface QuizProps {
    quiz: {
        id: number;
        title: string;
        description: string | null;
        passingScore: number | null;
        questions: Question[];
    };
    courseSlug: string;
}

export function QuizView({ quiz, courseSlug }: QuizProps) {
    const [currentStep, setCurrentStep] = useState<'intro' | 'active' | 'results'>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        passed: boolean;
        correctCount: number;
        totalQuestions: number;
    } | null>(null);

    const currentQuestion = quiz.questions[currentIndex];
    const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

    const handleAnswerSelect = (optionIndex: number) => {
        if (!currentQuestion) return;
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Check if all questions are answered
        if (Object.keys(answers).length < quiz.questions.length) {
            toast.error("Iltimos, barcha savollarga javob bering");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitQuiz(quiz.id, answers);
            setResult(res);
            setCurrentStep('results');

            if (res.passed) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#a855f7', '#ec4899']
                });
                toast.success("Tabriklaymiz! Siz testdan o'tdingiz!");
            } else {
                toast.error("Afsuski, siz yetarli ball to'play olmadingiz.");
            }
        } catch (error: any) {
            toast.error(error.message || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setAnswers({});
        setCurrentIndex(0);
        setCurrentStep('intro');
        setResult(null);
    };

    if (currentStep === 'intro') {
        return (
            <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <CardContent className="p-12 text-center space-y-8">
                    <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto text-primary">
                        <HelpCircle className="h-10 w-10" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black tracking-tight">{quiz.title}</h2>
                        <p className="text-muted-foreground font-light max-w-md mx-auto">{quiz.description || "Ushbu test orqali o'z bilimlaringizni sinab ko'ring."}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Info className="h-4 w-4 opacity-50" /> {quiz.questions.length} ta savol
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Trophy className="h-4 w-4 opacity-50" /> O'tish bali: {quiz.passingScore}%
                        </div>
                    </div>

                    <Button onClick={() => setCurrentStep('active')} size="lg" className="rounded-full px-12 h-14 font-black text-lg shadow-xl shadow-primary/20">
                        Testni Boshlash <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (currentStep === 'results' && result) {
        return (
            <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                <CardContent className="p-12 text-center space-y-10">
                    <div className={cn(
                        "h-24 w-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl",
                        result.passed ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
                    )}>
                        {result.passed ? <Trophy className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tight">
                            {result.passed ? "Muvaffaqiyatli tamomlandingiz!" : "Natija qoniqarsiz"}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Siz {result.totalQuestions} tadan {result.correctCount} ta savolga to&apos;g&apos;ri javob berdingiz.
                        </p>
                    </div>

                    <div className="max-w-xs mx-auto space-y-3">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-1">
                            <span>Sizning natijangiz</span>
                            <span className={result.passed ? "text-emerald-500" : "text-rose-500"}>{result.score}%</span>
                        </div>
                        <Progress value={result.score} className={cn("h-3 bg-muted", result.passed ? "[&>div]:bg-emerald-500" : "[&>div]:bg-rose-500")} />
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 pt-6">
                        <Button variant="outline" onClick={resetQuiz} className="rounded-full px-8 h-12 font-bold">
                            <RotateCcw className="mr-2 h-4 w-4" /> Qayta urinish
                        </Button>
                        {result.passed ? (
                            <Button className="rounded-full px-8 h-12 font-bold" asChild>
                                <a href={`/learn/${courseSlug}/certificate`}>
                                    Sertifikatni olish <ChevronRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        ) : (
                            <Button variant="secondary" className="rounded-full px-8 h-12 font-bold" onClick={() => setCurrentStep('active')}>
                                Javoblarni ko&apos;rish
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!currentQuestion) return null;

    return (
        <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-border/40">
                <div className="flex items-center justify-between mb-6">
                    <Badge variant="outline" className="rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px]">
                        Savol {currentIndex + 1} / {quiz.questions.length}
                    </Badge>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {Math.round(progress)}% bajarildi
                    </div>
                </div>
                <Progress value={progress} className="h-1.5" />
            </CardHeader>

            <CardContent className="p-8 md:p-12 space-y-10">
                <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">
                    {currentQuestion.text}
                </h3>

                <div className="grid gap-4">
                    {(currentQuestion.options as string[]).map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswerSelect(idx)}
                            className={cn(
                                "flex items-center gap-4 p-6 rounded-3xl border-2 text-left transition-all duration-300 group",
                                answers[currentQuestion.id] === idx
                                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                    : "bg-muted/30 border-transparent hover:border-border/60 hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm border-2 transition-colors",
                                answers[currentQuestion.id] === idx
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border-border/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"
                            )}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className={cn(
                                "text-lg font-bold leading-tight transition-colors",
                                answers[currentQuestion.id] === idx ? "text-primary" : "text-foreground"
                            )}>
                                {option}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border/40">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="rounded-full px-6 font-bold"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Oldingisi
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={answers[currentQuestion.id] === undefined || isSubmitting}
                        className="rounded-full px-10 h-12 font-black shadow-xl shadow-primary/10"
                    >
                        {isSubmitting ? (
                            "Yuborilmoqda..."
                        ) : currentIndex === quiz.questions.length - 1 ? (
                            "Tugatish"
                        ) : (
                            <>Keyingisi <ChevronRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

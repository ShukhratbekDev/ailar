'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Trash2,
    Save,
    Info,
    HelpCircle,
    CheckCircle2,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { addQuestion, createQuiz } from '@/app/actions/education';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Question {
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export function QuizEditor({ courseId, courseSlug, existingQuiz }: { courseId: number, courseSlug: string, existingQuiz?: any }) {
    const [title, setTitle] = useState(existingQuiz?.title || "Kurs yakuniy testi");
    const [description, setDescription] = useState(existingQuiz?.description || "Ushbu test orqali o'rganganlaringizni mustahkamlang.");
    const [passingScore, setPassingScore] = useState(existingQuiz?.passingScore || 70);
    const [questions, setQuestions] = useState<Question[]>(existingQuiz?.questions || [
        { text: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex]) {
            newQuestions[qIndex].options[oIndex] = value;
            setQuestions(newQuestions);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Test sarlavhasini kiriting");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create/Update Quiz
            const formData = new FormData();
            formData.append('courseId', courseId.toString());
            formData.append('title', title);
            formData.append('description', description);
            formData.append('passingScore', passingScore.toString());

            const res = await createQuiz({}, formData);
            if (res.success && res.quizId) {
                // 2. Add Questions
                for (const q of questions) {
                    if (q.text.trim()) {
                        await addQuestion(res.quizId, q);
                    }
                }
                toast.success("Test muvaffaqiyatli saqlandi");
            } else {
                toast.error(res.message || "Xatolik yuz berdi");
            }
        } catch (error: any) {
            toast.error(error.message || "Saqlashda xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-12">
                <div className="space-y-4">
                    <Link href={`/learn/${courseSlug}`} className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors gap-2">
                        <ArrowLeft className="h-3 w-3" /> Kursga qaytish
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Test Tahrirlovchi</h1>
                    <p className="text-muted-foreground text-lg font-light">Kurs uchun yakuniy assessment yaratish va tahrirlash.</p>
                </div>
                <Button onClick={handleSave} disabled={isSubmitting} size="lg" className="rounded-full px-8 h-12 font-black shadow-lg shadow-primary/20">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Testni Saqlash
                </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Internal Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" /> Umumiy Sozlamalar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Test Sarlavhasi</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tavsif</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-[100px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">O&apos;tish bali (%)</Label>
                                <Input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} className="rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10 space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-sm">
                            <HelpCircle className="h-4 w-4 text-indigo-500" /> Maslahat
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Har bir savol uchun kamida bitta to&apos;g&apos;ri javobni belgilashni va tushuntirish berishni unutmang. Bu talabalarga o&apos;z xatolarini tushunishga yordam beradi.
                        </p>
                    </div>
                </div>

                {/* Questions List */}
                <div className="lg:col-span-8 space-y-8">
                    {questions.map((q, qIdx) => (
                        <Card key={qIdx} className="rounded-[2.5rem] border-border/40 bg-card group relative">
                            <div className="absolute -left-4 top-8 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-lg">
                                {qIdx + 1}
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between p-8">
                                <CardTitle className="text-lg font-bold">Savol mazmuni</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(qIdx)} className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-8">
                                <Textarea
                                    placeholder="Savolni bu yerga yozing..."
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                                    className="text-xl font-bold bg-muted/20 border-0 rounded-2xl p-6 min-h-[100px]"
                                />

                                <div className="grid gap-4">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground block ml-1">Variantlar</Label>
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                                className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs transition-all border-2",
                                                    q.correctAnswer === oIdx
                                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                        : "bg-background border-border/40 text-muted-foreground hover:border-emerald-500/40"
                                                )}
                                            >
                                                {String.fromCharCode(65 + oIdx)}
                                            </button>
                                            <Input
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                placeholder={`Variant ${String.fromCharCode(65 + oIdx)}...`}
                                                className="h-12 rounded-xl bg-muted/20 border-0"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Tushuntirish (ixtiyoriy)
                                    </div>
                                    <Textarea
                                        placeholder="To'g'ri javob uchun izoh yozing..."
                                        value={q.explanation}
                                        onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                                        className="bg-emerald-500/[0.02] border-emerald-500/10 rounded-2xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button variant="outline" onClick={handleAddQuestion} className="w-full h-20 rounded-[2.5rem] border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all font-bold text-lg group">
                        <Plus className="mr-2 h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" /> Savol Qo&apos;shish
                    </Button>
                </div>
            </div>
        </div>
    );
}

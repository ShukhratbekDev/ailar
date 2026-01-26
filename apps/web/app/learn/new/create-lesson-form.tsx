'use client';

import { useActionState, useState, useEffect } from 'react';
import { createLesson } from '@/app/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Play, BookOpen, Clock, Layers } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MarkdownPreview } from '@/components/markdown-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState = {
    message: '',
    errors: {} as Record<string, string[]>,
};

interface Course {
    id: number;
    title: string;
}

interface LessonData {
    id?: number;
    courseId: number;
    title: string;
    slug: string;
    content: string;
    videoUrl?: string | null;
    sequence: number;
    duration?: number | null;
    status: "draft" | "published";
}

export function CreateLessonForm({
    courses,
    initialData,
    action
}: {
    courses: Course[],
    initialData?: LessonData,
    action?: (prevState: any, formData: FormData) => Promise<any>
}) {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action || createLesson, initialState);

    const [formData, setFormData] = useState({
        courseId: initialData?.courseId || courses[0]?.id || 0,
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        content: initialData?.content || '',
        videoUrl: initialData?.videoUrl || '',
        sequence: initialData?.sequence || 1,
        duration: initialData?.duration || 10,
        status: initialData?.status || 'published'
    });

    const [activeTab, setActiveTab] = useState('editor');

    useEffect(() => {
        if (state.message && !state.errors) {
            toast.success(state.message);
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' && !formData.slug) {
            setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') }));
        }
    };

    return (
        <main className="min-h-screen bg-background pb-20 relative">
            {/* Header */}
            <div className="relative pt-16 bg-background border-b border-border/40">
                <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/learn">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold">{initialData ? 'Darsni Tahrirlash' : 'Yangi Dars Qo\'shish'}</h1>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Darsliklar</span>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        form="lesson-form"
                        disabled={isPending}
                        className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-8 h-10 font-bold"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Saqlash
                    </Button>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8">
                <form id="lesson-form" action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    <div className="lg:col-span-8 space-y-8">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Dars sarlavhasi..."
                                className="text-3xl md:text-5xl font-black h-auto p-0 border-0 border-l-4 border-transparent focus-visible:ring-0 focus-visible:border-primary rounded-none bg-transparent placeholder:text-muted-foreground/20 tracking-tight"
                                required
                            />
                            {state.errors?.title && <p className="text-red-500 text-xs">{state.errors.title}</p>}
                        </div>

                        {/* Video Support */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                <Play className="h-3 w-3" /> Video Havolasi (YouTube)
                            </div>
                            <Input
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="h-12 bg-muted/30 border-0 rounded-2xl"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dars Matni (Markdown)</Label>
                                    <TabsList className="bg-muted/50 rounded-xl p-1">
                                        <TabsTrigger value="editor" className="rounded-lg text-xs font-bold">Tahrirlash</TabsTrigger>
                                        <TabsTrigger value="preview" className="rounded-lg text-xs font-bold">Ko&apos;rish</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="editor" className="m-0 group relative">
                                    <Textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        placeholder="Darslik mazmunini bu yerga yozing..."
                                        className="min-h-[600px] text-lg leading-relaxed p-6 bg-muted/20 border-0 rounded-3xl resize-y font-light placeholder:text-muted-foreground/20"
                                        required
                                    />
                                    <input type="hidden" name="content_hidden" value={formData.content} />
                                </TabsContent>

                                <TabsContent value="preview" className="m-0 min-h-[600px] p-8 rounded-3xl border border-border/40 bg-card/5 prose prose-lg dark:prose-invert max-w-none">
                                    <MarkdownPreview content={formData.content || "*Matn mavjud emas*"} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-6">
                        <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    Dars Sozlamalari
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tegishli Kurs</Label>
                                    <select
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl bg-background border border-border/40 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Slug (URL)</Label>
                                    <Input
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="h-11 rounded-xl bg-background border border-border/40"
                                    />
                                    {state.errors?.slug && <p className="text-red-500 text-[10px]">{state.errors.slug}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tartib raqami</Label>
                                        <Input
                                            type="number"
                                            name="sequence"
                                            value={formData.sequence}
                                            onChange={handleInputChange}
                                            className="h-11 rounded-xl bg-background border border-border/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Vaqt (Daqiqa)</Label>
                                        <Input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            className="h-11 rounded-xl bg-background border border-border/40"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Holati</Label>
                                    <select
                                        name="status"
                                        defaultValue={formData.status}
                                        className="w-full h-11 rounded-xl bg-background border border-border/40 px-3 text-sm"
                                    >
                                        <option value="published">Chop etilgan</option>
                                        <option value="draft">Qoralama</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-8 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10 space-y-4">
                            <h4 className="font-bold flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-indigo-500" />
                                Markdown Yo&apos;riqnomasi
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Darsliklarni boyitish uchun sarlavhalar (#), qalin matn (**), va rasm (![nomi](url)) havolalaridan foydalaning.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}

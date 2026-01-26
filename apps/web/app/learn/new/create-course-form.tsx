'use client';

import { useActionState, useState, useEffect } from 'react';
import { createCourse } from '@/app/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Globe, GraduationCap, Layers } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CourseData {
    id?: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    imageUrl: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    category: string;
    duration: string;
    externalUrl?: string | null;
    language: string;
    status: "draft" | "published" | "archived";
}

const initialState = {
    message: '',
    errors: {} as Record<string, string[]>,
};

export function CreateCourseForm({
    initialData,
    action
}: {
    initialData?: CourseData,
    action?: (prevState: any, formData: FormData) => Promise<any>
}) {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action || createCourse, initialState);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        content: initialData?.content || '',
        imageUrl: initialData?.imageUrl || '',
        difficulty: initialData?.difficulty || 'beginner',
        category: initialData?.category || 'Prompt Engineering',
        duration: initialData?.duration || '2 hafta',
        externalUrl: initialData?.externalUrl || '',
        language: initialData?.language || 'uz',
        status: initialData?.status || 'draft'
    });

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
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 text-primary/5">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-current rounded-full blur-[120px] opacity-20" />
            </div>

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
                            <h1 className="text-lg font-bold">{initialData ? 'Kursni Tahrirlash' : 'Yangi Kurs Yaratish'}</h1>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Akademiya</span>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        form="course-form"
                        disabled={isPending}
                        className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-8 h-10 font-bold"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Kursni Saqlash
                    </Button>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 py-12">
                <form id="course-form" action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    <div className="lg:col-span-8 space-y-12">
                        {/* Identify */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kurs Sarlavhasi</Label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Masalan: Midjourney bo'yicha mukammal qo'llanma"
                                    className="text-3xl md:text-4xl font-black h-auto p-0 border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/20 leading-tight"
                                    required
                                />
                                {state.errors?.title && <p className="text-red-500 text-xs mt-1">{state.errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Slug (URL manzili)</Label>
                                <Input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    placeholder="kurs-nomi"
                                    className="h-11 bg-muted/30 border-0 rounded-xl"
                                />
                                {state.errors?.slug && <p className="text-red-500 text-xs mt-1">{state.errors.slug}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Qisqacha ta'rif</Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Kurs haqida 2-3 jumlali umumiy ma'lumot..."
                                    className="min-h-[100px] text-lg bg-muted/30 border-0 rounded-2xl resize-none font-light leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kurs Muqovasi (URL)</Label>
                            <div className="group relative aspect-video rounded-[2.5rem] bg-muted/20 border-2 border-dashed border-border/40 overflow-hidden flex items-center justify-center transition-all hover:border-primary/40">
                                {formData.imageUrl ? (
                                    <>
                                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="destructive" size="sm" onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))} type="button">O'chirish</Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8 space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto text-primary/40">
                                            <ImageIcon className="h-8 w-8" />
                                        </div>
                                        <Input
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://images.unsplash.com/..."
                                            className="bg-background/80 text-center rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="rounded-[2.5rem] border-border/40 bg-card/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    Kurs Sozlamalari
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Qiyinchilik darajasi</Label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl bg-background border border-border/40 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="beginner">Boshlang'ich</option>
                                        <option value="intermediate">O'rta</option>
                                        <option value="advanced">Murakkab</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Kategoriya</Label>
                                    <Input
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="h-11 rounded-xl bg-background border border-border/40"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Davomiyligi (Matn)</Label>
                                    <Input
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="Masalan: 4 hafta"
                                        className="h-11 rounded-xl bg-background border border-border/40"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tashqi Havola (Ixtiyoriy)</Label>
                                    <Input
                                        name="externalUrl"
                                        value={formData.externalUrl || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://coursera.org/... (bo'sh bo'lsa ichki kurs)"
                                        className="h-11 rounded-xl bg-background border border-border/40"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Dars Tili</Label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl bg-background border border-border/40 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="uz">O'zbek tili</option>
                                        <option value="en">Ingliz tili</option>
                                        <option value="ru">Rus tili</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Holati</Label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl bg-background border border-border/40 px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="draft">Qoralama</option>
                                        <option value="published">Chop etish</option>
                                        <option value="archived">Arxiv</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-8 rounded-[2rem] bg-primary/[0.03] border border-primary/10">
                            <h4 className="font-bold flex items-center gap-2 text-sm mb-2">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                Keyingi qadam
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Kursni saqlaganingizdan so'ng, unga darslar (lessons) qo'shishingiz mumkin bo'ladi.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}

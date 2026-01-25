'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { createNews } from '@/app/actions/news';
import { generateNewsContent, generateNewsImage } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    ArrowLeft, Save, Loader2, Sparkles, Wand2, Image as ImageIcon,
    Settings2, Link as LinkIcon, FileText, Send, Eye, Coins,
    Facebook, Instagram, Linkedin, Twitter, CheckCircle2, AlertCircle,
    Maximize2, Minimize2, RefreshCw, Globe
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { extractMediaFromUrl } from '@/app/actions/scraper';
import { TagInput } from '@/components/ui/tag-input';
import { MarkdownPreview } from '@/components/markdown-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CONTENT_MODELS, IMAGE_MODELS, DEFAULT_CONTENT_MODEL, DEFAULT_IMAGE_MODEL } from '@/lib/constants';

const initialState = {
    message: '',
    errors: {} as Record<string, string[]>,
};


export function CreateNewsForm({ isAdmin = false }: { isAdmin?: boolean }) {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(createNews, initialState);


    // AI Generation State
    const [aiContext, setAiContext] = useState('');
    const [selectedContentModel, setSelectedContentModel] = useState(DEFAULT_CONTENT_MODEL);
    const [selectedImageModel, setSelectedImageModel] = useState(DEFAULT_IMAGE_MODEL);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [aiError, setAiError] = useState('');
    const [activeTab, setActiveTab] = useState('editor');
    const [actionType, setActionType] = useState('draft'); // draft | review | publish

    // Media Extraction
    const [extractedImages, setExtractedImages] = useState<string[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);

    // Form Field States
    const [formData, setFormData] = useState({
        title: '',
        readTime: '3',
        description: '',
        content: '',
        tags: '',
        imageUrl: '',
        imagePrompt: '',
        sourceUrl: '',
    });


    useEffect(() => {
        if (state.message && !state.errors) {
            toast.success(state.message);
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExtractMedia = async (url: string) => {
        if (!url) return;
        setIsExtracting(true);
        try {
            const media = await extractMediaFromUrl(url);
            if (media.images && media.images.length > 0) {
                setExtractedImages(prev => {
                    const combined = [...prev, ...media.images];
                    return Array.from(new Set(combined));
                });

                if (!formData.imageUrl) {
                    setFormData(prev => ({ ...prev, imageUrl: media.images[0] || '' }));
                    toast.success('Rasm topildi va belgilandi');
                } else {
                    toast.success(`${media.images.length} ta rasm topildi`);
                }
            } else {
                toast.info("Bu havoladan rasm topilmadi");
            }
        } catch (e) {
            console.error("Media extraction failed", e);
            toast.error("Media yuklashda xatolik");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!aiContext.trim()) {
            toast.error('Iltimos, kontekst yoki link kiriting.');
            return;
        }


        setIsGenerating(true);
        setAiError('');

        if (aiContext.startsWith('http')) {
            setExtractedImages([]);
            handleExtractMedia(aiContext);
        }

        try {
            const result = await generateNewsContent(aiContext, selectedContentModel);
            setFormData(prev => ({
                ...prev,
                title: result.title || prev.title,
                description: result.description || prev.description,
                content: result.content || prev.content,
                tags: result.tags || prev.tags,
                readTime: result.readTime?.toString() || prev.readTime,
                imageUrl: (prev.imageUrl && prev.imageUrl !== '') ? prev.imageUrl : (result.imageUrl || ''),
                imagePrompt: result.imagePrompt || prev.imagePrompt,
                sourceUrl: aiContext.startsWith('http') ? aiContext : prev.sourceUrl
            }));

            toast.success(`Maqola yaratildi!`);
        } catch (error: any) {
            setAiError(error.message || 'Xatolik yuz berdi');
            toast.error('Generatsiya xatoligi');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefinePrompt = async () => {
        if (!formData.title && !formData.description && !formData.imagePrompt) {
            toast.error("Maqola ma'lumotlarini kiriting yoki prompt yozing");
            return;
        }

        setIsGeneratingImage(true);
        try {
            const { generateImagePrompt } = await import('@/app/actions/ai');
            const result = await generateImagePrompt(formData.title, formData.description, formData.imagePrompt, selectedContentModel);
            setFormData(p => ({ ...p, imagePrompt: result.prompt }));
            toast.success("Prompt yaratildi!");
        } catch (error: any) {
            toast.error("Prompt xatoligi: " + error.message);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerateIndependentImage = async () => {
        if (!formData.title && !formData.imagePrompt) {
            toast.error('Rasm yaratish uchun sarlavha yoki prompt kiriting.');
            return;
        }


        setIsGeneratingImage(true);
        try {
            const result = await generateNewsImage(formData.title, formData.description, selectedImageModel, formData.imagePrompt);
            setFormData(prev => ({
                ...prev,
                imageUrl: result.imageUrl,
                imagePrompt: result.imagePrompt || prev.imagePrompt
            }));

            toast.success(`Rasm yaratildi!`);
        } catch (error: any) {
            toast.error(error.message || 'Rasm yaratishda xatolik');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSave = (type: 'draft' | 'submit_review' | 'publish_now') => {
        // We set a input value dynamically or just let the form submission carry it
        // Best way is to have a hidden input that we set before submission, or buttons with values
        // Actually button value isn't reliable in useActionState sometimes directly if not handled.
        // Let's use hidden input managed by state, but since we need immediate submit from header...
        const form = document.getElementById('news-form') as HTMLFormElement;
        if (form) {
            const actionInput = document.getElementById('form-action-type') as HTMLInputElement;
            if (actionInput) actionInput.value = type;
            form.requestSubmit();
        }
    }

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20 relative selection:bg-primary/20">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-20" />
            </div>
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
                <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/news">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold leading-tight">Yangi Maqola</h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>AI Muharriri</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Action Buttons */}
                        <Button
                            variant="ghost"
                            onClick={() => handleSave('draft')}
                            disabled={isPending}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Qoralama
                        </Button>

                        {!isAdmin && (
                            <Button
                                onClick={() => handleSave('submit_review')}
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Ko&apos;rib chiqishga
                            </Button>
                        )}

                        {isAdmin && (
                            <Button
                                onClick={() => handleSave('publish_now')}
                                disabled={isPending}
                                className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saqlanmoqda...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Chop Etish
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar - AI Tools */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit lg:order-2">
                    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background backdrop-blur-3xl shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Sparkles className="h-48 w-48 rotate-12" />
                        </div>

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Wand2 className="h-5 w-5 text-primary" />
                                AI Yordamchi
                            </CardTitle>
                            <CardDescription>
                                Havola yoki mavzu kiriting, AI maqola yozib beradi.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium uppercase text-muted-foreground">Qo&apos;shimcha Kontekst / Prompt</Label>
                                <Textarea
                                    placeholder="Masalan: Maqola uslubi rasmiy bo'lsin..."
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                    className="min-h-[120px] bg-white/5 border-white/10 resize-none focus-visible:ring-primary/50 text-sm placeholder:text-muted-foreground/40"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Matn Modeli</Label>
                                    <select
                                        className="w-full text-xs h-8 bg-background/50 border rounded px-2"
                                        value={selectedContentModel}
                                        onChange={(e) => setSelectedContentModel(e.target.value)}
                                    >
                                        {CONTENT_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-indigo-500 via-primary to-purple-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25"
                                onClick={handleGenerateAI}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" /> Generatsiya
                                    </>
                                )}
                            </Button>

                            {aiError && (
                                <div className="p-3 text-xs text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                                    {aiError}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 shadow-sm bg-white/5 backdrop-blur-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                                Rasm Muharriri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Rasm Modeli</Label>
                                <select
                                    className="w-full text-xs h-8 bg-background/50 border rounded px-2"
                                    value={selectedImageModel}
                                    onChange={(e) => setSelectedImageModel(e.target.value)}
                                >
                                    {IMAGE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            {extractedImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {extractedImages.slice(0, 4).map((img, i) => (
                                        <div key={i} className="aspect-square relative rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all" onClick={() => setFormData(p => ({ ...p, imageUrl: img }))}>
                                            <img src={img} alt="Extracted" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Rasm Prompti</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 text-[10px] px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10"
                                        onClick={handleRefinePrompt}
                                        disabled={isGeneratingImage || (!formData.title && !formData.description)}
                                        type="button"
                                        title="AI yordamida promptni mukammallashtirish"
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI Yozish
                                    </Button>
                                </div>
                                <Textarea
                                    className="h-16 text-xs resize-none bg-background/50"
                                    placeholder="Rasm ta'rifi..."
                                    value={formData.imagePrompt}
                                    onChange={(e) => setFormData(p => ({ ...p, imagePrompt: e.target.value }))}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="w-full text-xs h-8"
                                onClick={handleGenerateIndependentImage}
                                disabled={isGeneratingImage || !formData.imagePrompt}
                            >
                                {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                Yangi Rasm
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Editor */}
                <div className="lg:col-span-8 lg:order-1">
                    <form id="news-form" action={formAction} className="space-y-8">
                        <input type="hidden" name="action" id="form-action-type" value="draft" />

                        {/* URL Source Card (Top Focus) */}
                        <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <LinkIcon className="w-24 h-24" />
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold text-primary flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Manba Havolasi (Link)
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Yangilik manbasini kiriting. AI ushbu manzil orqali maqola va rasmlarni tayyorlaydi.
                                    </p>
                                    <div className="flex w-full shadow-sm rounded-md">
                                        <div className="relative flex-grow focus-within:z-10">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            </div>
                                            <Input
                                                name="sourceUrl"
                                                value={aiContext}
                                                onChange={(e) => {
                                                    setAiContext(e.target.value);
                                                    setFormData(p => ({ ...p, sourceUrl: e.target.value }));
                                                }}
                                                className="block w-full rounded-none rounded-l-md pl-10 h-11 bg-background focus:ring-1 focus:ring-primary border-r-0"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => handleExtractMedia(aiContext)}
                                            disabled={isExtracting || !aiContext}
                                            className="relative -ml-px inline-flex items-center space-x-2 rounded-l-none rounded-r-md border border-input h-11 px-6 shadow-sm font-medium bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-0"
                                        >
                                            {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                                            <span>Yuklash</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Title & Description (Top Priority) */}
                        <div className="space-y-4">
                            <Input
                                name="title"
                                placeholder="Maqola Sarlavhasi"
                                className="text-3xl md:text-5xl font-black h-auto py-4 px-0 border-0 border-l-4 border-transparent focus-visible:ring-0 focus-visible:border-primary rounded-none bg-transparent placeholder:text-muted-foreground/30 tracking-tight"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                            {state.errors?.title && <p className="text-red-500 text-sm">{state.errors.title}</p>}

                            <Textarea
                                name="description"
                                placeholder="Qisqacha mazmun (subtitr)..."
                                className="text-xl text-muted-foreground min-h-[60px] border-0 px-0 resize-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/30 leading-relaxed font-light"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Cover Image (Hero) */}
                        <div className="group relative w-full aspect-[2/1] md:aspect-[21/9] bg-muted/30 rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 transition-all overflow-hidden flex items-center justify-center">
                            {formData.imageUrl ? (
                                <>
                                    <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-2">
                                        <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur border-white/10">Muqova</Badge>
                                        <Button size="sm" variant="destructive" onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))} type="button" className="h-8">
                                            O&apos;chirish
                                        </Button>
                                    </div>
                                    <Input type="hidden" name="imageUrl" value={formData.imageUrl} />
                                </>
                            ) : (
                                <div className="text-center space-y-4 p-8 w-full max-w-sm">
                                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto text-primary/40 mb-2 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                                        <ImageIcon className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground/80">Muqova rasmini yuklang</p>
                                        <div className="relative">
                                            <Input
                                                placeholder="https://..."
                                                className="h-9 text-xs bg-background/50 backdrop-blur text-center border-border/50 focus:border-primary/50 transition-colors"
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                                                name="imageUrl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Editor */}
                        <div className="relative">
                            <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex justify-end mb-2">
                                    <TabsList className="bg-muted/30 border border-border/40 h-9">
                                        <TabsTrigger value="editor" className="text-xs h-7 px-3 gap-1.5"><FileText className="h-3.5 w-3.5" /> Tahrirlash</TabsTrigger>
                                        <TabsTrigger value="preview" className="text-xs h-7 px-3 gap-1.5"><Eye className="h-3.5 w-3.5" /> Ko&apos;rish</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="editor" className="mt-0 relative group">
                                    <Textarea
                                        name="content"
                                        placeholder="Maqola matnini bu yerga yozing..."
                                        className="min-h-[600px] text-lg leading-relaxed p-0 bg-transparent border-0 focus-visible:ring-0 resize-y font-serif md:font-sans placeholder:text-muted-foreground/20"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                    />
                                    <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/40 font-mono pointer-events-none">
                                        {formData.content.length} characters
                                    </div>
                                </TabsContent>

                                <TabsContent value="preview" className="mt-0">
                                    <div className="min-h-[600px] prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-p:leading-relaxed">
                                        {formData.content ? (
                                            <MarkdownPreview content={formData.content} />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 py-20">
                                                <FileText className="h-16 w-16 mb-4" />
                                                <p>Matn mavjud emas</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Settings & Meta (Bottom Section) */}
                        <div className="grid grid-cols-1 gap-8 pt-8 border-t border-border/40">

                            {/* Metadata Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Teglar</Label>
                                    <TagInput
                                        placeholder="Enter bosing..."
                                        tags={formData.tags ? formData.tags.split(',').filter(Boolean).map(t => ({ id: t, text: t.trim() })) : []}
                                        setTags={(newTags) => {
                                            const tagsArray = typeof newTags === 'function' ? newTags([]) : newTags;
                                            setFormData(prev => ({ ...prev, tags: tagsArray.map(t => t.text).join(',') }));
                                        }}
                                        className="bg-muted/30 border-border/40"
                                    />
                                    <input type="hidden" name="tags" value={formData.tags} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">O&apos;qish Vaqti</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            name="readTime"
                                            value={formData.readTime}
                                            onChange={handleInputChange}
                                            className="bg-muted/30 border-border/40 pl-9"
                                        />
                                        <div className="absolute left-3 top-2.5 text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Publishing Options */}
                            <Card className="bg-muted/20 border-border/40 shadow-none">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-sm font-medium">Manba va Holat</Label>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        name="sourceUrl"
                                                        placeholder="Manba havolasi (ixtiyoriy)"
                                                        className="pl-9 bg-background/50"
                                                        value={formData.sourceUrl}
                                                        onChange={handleInputChange}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                                                        <input type="checkbox" name="published" defaultChecked className="rounded border-primary/50 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                                        <span className="group-hover:text-primary transition-colors">Chop etish</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                                                        <input type="checkbox" name="isFeatured" className="rounded border-primary/50 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                                        <span className="group-hover:text-primary transition-colors">Asosiy yangilik</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-sm font-medium">Ijtimoiy Tarmoqlar</Label>
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                {[
                                                    { id: 'postToTelegram', icon: Send, label: 'Telegram', color: 'text-sky-500' },
                                                    { id: 'postToFacebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
                                                    { id: 'postToInstagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
                                                    { id: 'postToLinkedIn', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
                                                    { id: 'postToX', icon: Twitter, label: 'X', color: 'text-foreground' },
                                                ].map((social) => (
                                                    <label key={social.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-background/50 hover:bg-background hover:border-primary/30 cursor-pointer transition-all" title={social.label}>
                                                        <input type="checkbox" name={social.id} defaultChecked={social.id === 'postToTelegram'} className="rounded border-primary/30 text-primary focus:ring-primary" />
                                                        {social.id === 'postToX' ? (
                                                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                            </svg>
                                                        ) : (
                                                            <social.icon className={cn("h-4 w-4", social.color)} />
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        {/* Ensure content is always submitted even if Tabs unmounts textarea (though standard shadcn tabs usually keep it in DOM, sometimes unmounting happens) */}
                        <input type="hidden" name="content_hidden" value={formData.content} />
                    </form>
                </div>
            </div >
        </main >
    );
}


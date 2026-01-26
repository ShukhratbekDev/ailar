'use client';

import { useActionState, useState, useEffect } from 'react';
import { createTool } from '@/app/actions/tools';
import { generateToolContent, generateNewsImage } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    ArrowLeft, Save, Loader2, Sparkles, Wand2, Image as ImageIcon,
    Settings2, Link as LinkIcon, FileText, Send, Eye, Coins,
    Facebook, Instagram, Linkedin, Twitter, Maximize2, Minimize2,
    RefreshCw, Globe, Tag, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { extractToolMediaFromUrl } from '@/app/actions/scraper';
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


const BASE_CATEGORIES = [
    "Chatbot", "Video yaratish", "Rasm yaratish", "Unumdorlik",
    "Matn yozish", "Dasturlash", "Marketing", "Audio/Ovoz", "SEO", "Dizayn", "Tadqiqot",
    "Multi", "Fan va Ta'lim", "Biznes va Analitika"
];

const PRICING_TYPES = [
    { id: 'free', name: 'Bepul' },
    { id: 'freemium', name: 'Freemium' },
    { id: 'paid', name: 'Pullik' },
    { id: 'contact', name: "Bog'lanish" },
];

const TOOL_TYPES = [
    { id: 'app', name: 'Ilova (App)' },
    { id: 'model', name: 'Model (LLM/AI)' },
    { id: 'api', name: 'API/Servis' },
    { id: 'library', name: 'Kutubxona/SDK' },
];

export function CreateToolForm({ isAdmin = false }: { isAdmin?: boolean }) {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(createTool, initialState);

    const [categories, setCategories] = useState(BASE_CATEGORIES);

    // AI State
    const [aiContext, setAiContext] = useState('');
    const [selectedContentModel, setSelectedContentModel] = useState(DEFAULT_CONTENT_MODEL);
    const [selectedImageModel, setSelectedImageModel] = useState(DEFAULT_IMAGE_MODEL);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [activeTab, setActiveTab] = useState('editor');

    // Media Extraction
    const [extractedImages, setExtractedImages] = useState<string[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);

    const [mounted, setMounted] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        content: '',
        url: '',
        imageUrl: '',
        logoUrl: '',
        category: 'Chatbot',
        toolType: 'app',
        pricingType: 'free',
        pricingText: '',
        tags: '',
        features: '',
        pros: '',
        cons: '',
        screenshots: '',
        videoUrl: '',
        imagePrompt: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

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
    };

    const handleGenerateAI = async () => {
        if (!aiContext.trim()) {
            toast.error('Iltimos, kontekst yoki link kiriting.');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateToolContent(aiContext, selectedContentModel);

            // Handle Dynamic Categories
            if (result.category && !categories.includes(result.category)) {
                setCategories(prev => [...prev, result.category]);
            }

            setFormData(prev => ({
                ...prev,
                name: result.name || prev.name,
                description: result.description || prev.description,
                content: result.content || prev.content,
                category: result.category || prev.category,
                toolType: result.toolType || prev.toolType,
                pricingType: result.pricingType || prev.pricingType,
                pricingText: result.pricingText || prev.pricingText,
                tags: result.tags || prev.tags,
                features: Array.isArray(result.features) ? result.features.join('\n') : prev.features,
                pros: Array.isArray(result.pros) ? result.pros.join('\n') : prev.pros,
                cons: Array.isArray(result.cons) ? result.cons.join('\n') : prev.cons,
                screenshots: Array.isArray(result.screenshots) ? result.screenshots.join(',') : prev.screenshots,
                videoUrl: result.videoUrl || prev.videoUrl,
                url: aiContext.trim().split(/\s+/)[0]?.startsWith('http') ? aiContext.trim().split(/\s+/)[0] || prev.url : prev.url
            }));

            const cleanUrl = aiContext.trim().split(/\s+/)[0]?.startsWith('http') ? aiContext.trim().split(/\s+/)[0] : null;

            if (cleanUrl) {
                handleExtractMedia(cleanUrl);
            }

            toast.success('AI ma\'lumotlarni yaratdi!');
        } catch (error: any) {
            toast.error(error.message || 'Xatolik yuz berdi');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefinePrompt = async () => {
        if (!formData.name && !formData.description && !formData.imagePrompt) {
            toast.error("Formani to'ldiring yoki prompt yozing");
            return;
        }

        setIsGeneratingImage(true);
        try {
            const { generateImagePrompt } = await import('@/app/actions/ai');
            const result = await generateImagePrompt(formData.name, formData.description, formData.imagePrompt, selectedContentModel);
            setFormData(p => ({ ...p, imagePrompt: result.prompt }));
            toast.success("Prompt yaratildi!");
        } catch (error: any) {
            toast.error("Prompt xatoligi: " + error.message);
        } finally {
            setIsGeneratingImage(false);
        }
    };


    const handleGenerateImage = async () => {
        if (!formData.name && !formData.imagePrompt) {
            toast.error('Nom yoki rasm prompti kerak');
            return;
        }

        setIsGeneratingImage(true);
        try {
            const result = await generateNewsImage(formData.name, formData.description, selectedImageModel, formData.imagePrompt);
            setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
            toast.success('Rasm yaratildi!');
        } catch (error: any) {
            toast.error(error.message || 'Rasm xatoligi');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleExtractMedia = async (url: string) => {
        if (!url.startsWith('http')) return;
        setIsExtracting(true);
        setExtractedImages([]); // Clear previous results
        try {
            const result = await extractToolMediaFromUrl(url);

            if (result.isFallback) {
                toast.info("Sayt blokladi, lekin internetdan rasmlar topildi");
            } else if (result.error && (!result.images || result.images.length === 0)) {
                toast.error(result.error);
            }

            if (result.images && result.images.length > 0) {
                setExtractedImages(result.images);

                setFormData(prev => {
                    const updates: any = {};

                    // Auto-set the first logo-like image as logoUrl
                    const logoCandidate = result.images.find((img: string) =>
                        img.toLowerCase().includes('logo') ||
                        img.toLowerCase().includes('icon') ||
                        img.toLowerCase().includes('brand')
                    ) || result.images[0];

                    if (!prev.logoUrl && logoCandidate) {
                        updates.logoUrl = logoCandidate;
                    }

                    // Set as imageUrl if empty (for cover)
                    if (!prev.imageUrl && result.images[0]) {
                        updates.imageUrl = result.images[0];
                    }

                    return { ...prev, ...updates };
                });
            }
        } catch (error) {
            console.error("Link extraction failed:", error);
        } finally {
            setIsExtracting(false);
        }
    };


    const handleSave = (type: 'save_draft' | 'submit_review' | 'publish_now') => {
        const form = document.getElementById('tool-form') as HTMLFormElement;
        if (form) {
            const actionInput = document.getElementById('form-action-type') as HTMLInputElement;
            if (actionInput) actionInput.value = type;
            form.requestSubmit();
        }
    };

    if (!mounted) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20 relative">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />

            <div className="relative pt-16 bg-background border-b border-border/40">
                <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/tools">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold">Yangi AI Vosita</h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase tracking-widest font-bold">Qoralama</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => handleSave('save_draft')}
                            disabled={isPending}
                            className="text-muted-foreground hover:text-foreground hidden md:flex h-9 rounded-full px-4"
                        >
                            Qoralama
                        </Button>

                        {isAdmin ? (
                            <Button
                                onClick={() => handleSave('publish_now')}
                                disabled={isPending}
                                className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-6 h-9 font-bold"
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Chop etish
                            </Button>
                        ) : (
                            <Button
                                onClick={() => handleSave('submit_review')}
                                disabled={isPending}
                                className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-6 h-9 font-bold"
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Ko&apos;rib chiqishga yuborish
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* AI Assistant Sidebar (Reduced) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:order-2 lg:top-24 h-fit">
                    <Card className="border-primary/10 bg-card/50 backdrop-blur-xl shadow-lg">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                                AI Yordamchi
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Vosita uchun avtomatik ma&apos;lumot yaratish
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {/* AI Controls - URL Input Moved to Main Column */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Qo&apos;shimcha Kontekst / Prompt</Label>
                                <Textarea
                                    placeholder="Masalan: Ushbu vosita haqida qisqacha ma'lumot..."
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                    className="min-h-[80px] resize-none text-xs bg-background/50 border-white/5 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Kontent Modeli</Label>
                                <select
                                    className="w-full text-xs h-9 bg-background/50 border border-white/5 rounded-md px-2 focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={selectedContentModel}
                                    onChange={(e) => setSelectedContentModel(e.target.value)}
                                >
                                    {CONTENT_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-all shadow-md group"
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wand2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    )}
                                    Generatsiya
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 shadow-sm bg-white/5 backdrop-blur-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                                Rasm Muharriri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rasm Modeli</Label>
                                <select
                                    className="w-full text-xs h-9 bg-background/50 border border-white/5 rounded-md px-2 focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={selectedImageModel}
                                    onChange={(e) => setSelectedImageModel(e.target.value)}
                                >
                                    {IMAGE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>


                            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Logo</Label>
                                    <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden border border-dashed border-emerald-500/30 flex items-center justify-center group relative">
                                        {formData.logoUrl ? (
                                            <>
                                                <img src={formData.logoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
                                                <button
                                                    onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                                                    type="button"
                                                    className="absolute top-1 right-1 h-5 w-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </>
                                        ) : (
                                            <Globe className="h-4 w-4 text-muted-foreground/30" />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Muqova</Label>
                                    <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden border border-dashed border-primary/30 flex items-center justify-center group relative">
                                        {formData.imageUrl ? (
                                            <>
                                                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Cover" />
                                                <button
                                                    onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))}
                                                    type="button"
                                                    className="absolute top-1 right-1 h-5 w-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </>
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isExtracting && (
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="aspect-square rounded-md bg-muted animate-pulse border border-white/5" />
                                    ))}
                                </div>
                            )}

                            {extractedImages.length > 0 && !isExtracting && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Olingan rasmlar</Label>
                                            <span className="text-[9px] text-muted-foreground">Chap: Logo | O'ng: Muqova</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {extractedImages.slice(0, 12).map((img, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "aspect-square relative rounded-md overflow-hidden cursor-pointer border border-white/5 transition-all group",
                                                        formData.imageUrl === img && "ring-2 ring-primary",
                                                        formData.logoUrl === img && "ring-2 ring-emerald-500"
                                                    )}
                                                >
                                                    <img src={img} alt="Extracted" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex">
                                                        <button
                                                            className="w-1/2 h-full hover:bg-emerald-500/20 transition-colors"
                                                            onClick={() => setFormData(p => ({ ...p, logoUrl: img }))}
                                                            type="button"
                                                            title="Logo sifatida tanlash"
                                                        />
                                                        <button
                                                            className="w-1/2 h-full hover:bg-primary/20 transition-colors"
                                                            onClick={() => setFormData(p => ({ ...p, imageUrl: img }))}
                                                            type="button"
                                                            title="Muqova sifatida tanlash"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 pt-4 border-t border-white/5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Skrinshotlar (Galereya)</Label>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {formData.screenshots.split(',').filter(Boolean).map((s, i) => (
                                        <div key={i} className="aspect-video relative rounded-md overflow-hidden bg-muted group">
                                            <img src={s} className="w-full h-full object-cover" alt="" />
                                            <button
                                                onClick={() => {
                                                    const current = formData.screenshots.split(',').filter(Boolean);
                                                    const updated = current.filter((_, idx) => idx !== i);
                                                    setFormData(p => ({ ...p, screenshots: updated.join(',') }));
                                                }}
                                                className="absolute top-0.5 right-0.5 h-4 w-4 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                type="button"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <Textarea
                                    className="h-16 text-[10px] resize-none bg-background/50 border-white/5"
                                    placeholder="Skrinshot URLlar (vergul bilan)..."
                                    value={formData.screenshots}
                                    onChange={(e) => setFormData(p => ({ ...p, screenshots: e.target.value }))}
                                />
                                {extractedImages.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-6 text-[9px] mt-1"
                                        onClick={() => setFormData(p => ({ ...p, screenshots: extractedImages.join(',') }))}
                                        type="button"
                                    >
                                        Barcha rasmlarni galereyaga qo'shish
                                    </Button>
                                )}
                            </div>


                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-muted-foreground">Rasm Prompti</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 text-[10px] px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10"
                                        onClick={handleRefinePrompt}
                                        disabled={isGeneratingImage}
                                        type="button"
                                        title="AI yordamida promptni mukammallashtirish"
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI Yozish
                                    </Button>
                                </div>
                                <Textarea
                                    className="h-20 text-xs resize-none bg-background/50 border-white/5 focus:border-primary/50 transition-colors"
                                    placeholder="Rasm uchun batafsil ta&apos;rif..."
                                    value={formData.imagePrompt}
                                    onChange={(e) => setFormData(p => ({ ...p, imagePrompt: e.target.value }))}
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full text-xs h-9 font-semibold hover:bg-primary/5 transition-colors border-white/10"
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage}
                            >
                                {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                                Rasm Yaratish
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Form Content */}
                <div className="lg:col-span-8 lg:order-1">
                    <form id="tool-form" action={formAction} className="space-y-8">
                        <input type="hidden" name="action" id="form-action-type" value="save_draft" />
                        <input type="hidden" name="logoUrl" value={formData.logoUrl} />
                        <input type="hidden" name="imageUrl" value={formData.imageUrl} />

                        {/* URL Source Card (Top Focus) */}
                        <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <LinkIcon className="w-24 h-24" />
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold text-primary flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Veb-sayt Manzili (Manba)
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Asosiy vosita havolasini kiriting. AI ushbu manzil orqali ma'lumotlarni to'ldiradi.
                                    </p>
                                    <div className="flex w-full shadow-sm rounded-md">
                                        <div className="relative flex-grow focus-within:z-10">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            </div>
                                            <Input
                                                value={aiContext}
                                                onChange={(e) => {
                                                    setAiContext(e.target.value);
                                                    setFormData(p => ({ ...p, url: e.target.value }));
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
                        <input type="hidden" name="imageUrl" value={formData.imageUrl} />
                        {/* Identity Section: Logo + Title */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Logo Box */}
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-card border-4 border-muted/30 shadow-sm overflow-hidden flex items-center justify-center group-hover:border-primary/50 transition-all bg-muted/50">
                                    {formData.logoUrl ? (
                                        <>
                                            <img src={formData.logoUrl} className="w-full h-full object-contain p-4" alt="Logo" />
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                                                className="absolute top-2 right-2 h-6 w-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                type="button"
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-2">
                                            <Globe className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                                            <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest">Logo</p>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    type="url"
                                    placeholder="Logo URL..."
                                    className="absolute -right-2 top-0 h-7 text-[10px] w-32 bg-background/80 backdrop-blur border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-3/4 ml-1 z-20 shadow-lg"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData(p => ({ ...p, logoUrl: e.target.value }))}
                                />
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-4 flex-1 w-full">
                                <Input
                                    name="name"
                                    placeholder="AI Vosita Nomi"
                                    className="text-3xl md:text-5xl font-black h-auto p-0 border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/20 tracking-tight"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {state.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}

                                <Textarea
                                    name="description"
                                    placeholder="Qisqacha ta'rif (Slogan)..."
                                    className="text-xl text-muted-foreground min-h-[60px] border-0 p-0 resize-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/20 leading-relaxed font-light"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Media Section: Cover Only */}
                        <div className="space-y-0 relative pt-4">
                            <div className="group relative w-full aspect-[2/1] md:aspect-[21/9] bg-muted/30 rounded-3xl border-2 border-dashed border-border/40 hover:border-primary/40 transition-all overflow-hidden flex items-center justify-center">
                                {formData.imageUrl ? (
                                    <>
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-2">
                                            <Button size="sm" variant="destructive" onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))} type="button" className="h-8">
                                                O&apos;chirish
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center space-y-4 p-8 w-full max-w-sm">
                                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto text-primary/40 mb-2 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                                            <ImageIcon className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-foreground/80 font-bold">MUQOVA</p>
                                            <Input
                                                className="h-9 text-xs bg-background/50 backdrop-blur text-center border-border/50 focus:border-primary/50 transition-colors"
                                                placeholder="https://..."
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Editor Tabs */}
                        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex justify-end mb-2">
                                <TabsList className="bg-muted/30 border border-border/40 h-9 rounded-xl">
                                    <TabsTrigger value="editor" className="text-xs h-7 px-3 gap-1.5 rounded-lg"><FileText className="h-3.5 w-3.5" /> Maqola</TabsTrigger>
                                    <TabsTrigger value="preview" className="text-xs h-7 px-3 gap-1.5 rounded-lg"><Eye className="h-3.5 w-3.5" /> Ko&apos;rish</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="editor" className="mt-0">
                                <Textarea
                                    name="content"
                                    placeholder="Vosita haqida batafsil ma'lumot (Markdown)..."
                                    className="min-h-[400px] text-lg leading-relaxed p-4 bg-background/20 backdrop-blur-sm border rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                />
                            </TabsContent>

                            <TabsContent value="preview" className="mt-0 ring-1 ring-border rounded-xl p-6 bg-card/20 min-h-[400px]">
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    {formData.content ? <MarkdownPreview content={formData.content} /> : <p className="text-muted-foreground italic">Matn yo&apos;q</p>}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Configuration Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/40">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Veb-sayt URL</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input name="url" value={formData.url} onChange={handleInputChange} className="pl-10 h-11 bg-background/50" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Kategoriya</Label>
                                    <select
                                        name="category"
                                        className="w-full h-11 bg-background/50 border rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Vosita turi</Label>
                                    <select
                                        name="toolType"
                                        className="w-full h-11 bg-background/50 border rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                        value={formData.toolType}
                                        onChange={handleInputChange}
                                    >
                                        {TOOL_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Video Demo URL</Label>
                                    <div className="relative">
                                        <Maximize2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} className="pl-10 h-11 bg-background/50" placeholder="https://youtube.com/..." />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Narxlash</Label>
                                    <div className="flex gap-2">
                                        <select
                                            name="pricingType"
                                            className="h-11 bg-background/50 border rounded-xl px-3 text-sm min-w-[120px] outline-none focus:ring-1 focus:ring-primary transition-all"
                                            value={formData.pricingType}
                                            onChange={handleInputChange}
                                        >
                                            {PRICING_TYPES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <Input
                                            name="pricingText"
                                            value={formData.pricingText}
                                            onChange={handleInputChange}
                                            className="h-11 flex-1 bg-background/50"
                                            placeholder="e.g., $10/oy"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Teglar</Label>
                                    <TagInput
                                        placeholder="Enter bosing..."
                                        tags={formData.tags ? formData.tags.split(',').filter(Boolean).map(t => ({ id: t, text: t.trim() })) : []}
                                        setTags={(newTags) => {
                                            const tagsArray = typeof newTags === 'function' ? newTags([]) : newTags;
                                            setFormData(prev => ({ ...prev, tags: tagsArray.map(t => t.text).join(',') }));
                                        }}
                                        className="bg-background/50 border-border/40"
                                    />
                                    <input type="hidden" name="tags" value={formData.tags} />
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid (Pros/Cons/Features) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 bg-muted/10 p-6 rounded-2xl border border-border/40">
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-rose-500 tracking-widest">Xususiyatlari</Label>
                                <Textarea name="features" value={formData.features} onChange={handleInputChange} className="min-h-[120px] text-xs bg-background/50" placeholder="Har qatorda bittadan..." />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Afzalliklari (Pros)</Label>
                                <Textarea name="pros" value={formData.pros} onChange={handleInputChange} className="min-h-[120px] text-xs bg-background/50" placeholder="Har qatorda bittadan..." />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Kamchiliklari (Cons)</Label>
                                <Textarea name="cons" value={formData.cons} onChange={handleInputChange} className="min-h-[120px] text-xs bg-background/50" placeholder="Har qatorda bittadan..." />
                            </div>
                        </div>

                        {/* Publication Center */}
                        <Card className="bg-muted/20 border-border/40 shadow-none">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">Ijtimoiy Tarmoqlar</Label>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        {[
                                            { id: 'postToTelegram', icon: Send, label: 'Telegram', color: 'text-sky-500' },
                                            { id: 'postToFacebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
                                            { id: 'postToInstagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
                                            { id: 'postToLinkedIn', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
                                            { id: 'postToX', icon: Twitter, label: 'X', color: 'text-foreground' },
                                        ].map((social) => (
                                            <label key={social.id} className="flex items-center gap-2 p-3 rounded-2xl border border-border/40 bg-background/50 hover:bg-background hover:border-primary/30 cursor-pointer transition-all shadow-sm group" title={social.label}>
                                                <input type="checkbox" name={social.id} defaultChecked={social.id === 'postToTelegram'} className="rounded border-primary/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                                <div className="flex items-center gap-2">
                                                    {social.id === 'postToX' ? (
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                        </svg>
                                                    ) : (
                                                        <social.icon className={cn("h-4 w-4", social.color)} />
                                                    )}
                                                    <span className="font-medium group-hover:text-primary transition-colors">{social.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <input type="hidden" name="content_hidden" value={formData.content} />
                        <input type="hidden" name="screenshots" value={formData.screenshots} />
                        <input type="hidden" name="videoUrl" value={formData.videoUrl} />
                    </form>
                </div >
            </div >
        </main >
    );
}

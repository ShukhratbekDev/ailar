'use client';

import { useActionState, useState, useEffect } from "react";
import { createPrompt } from "@/app/actions/prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft, Save, Loader2, Terminal, Code,
    TrendingUp, Palette, GraduationCap, Briefcase,
    FileText, Eye, Plus, Trash2, Settings2,
    Cpu, Box, Tag
} from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";
import Link from "next/link";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/markdown-preview";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { name: "Dasturlash", icon: Code },
    { name: "Marketing", icon: TrendingUp },
    { name: "Dizayn", icon: Palette },
    { name: "Ta'lim", icon: GraduationCap },
    { name: "Biznes", icon: Briefcase },
];

const initialState = {
    message: '',
    errors: {} as Record<string, string[]>,
};

export function CreatePromptForm() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(createPrompt, initialState);
    const [activeTab, setActiveTab] = useState('editor');
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        prompt: '',
        category: 'Dasturlash',
        description: '',
        systemPrompt: '',
        framework: '',
        tool: '',
        inputs: [] as { name: string; type: string; label?: string }[],
        tags: '',
    });

    const addInput = () => {
        setFormData(prev => ({
            ...prev,
            inputs: [...prev.inputs, { name: '', type: 'text', label: '' }]
        }));
    };

    const removeInput = (index: number) => {
        setFormData(prev => ({
            ...prev,
            inputs: prev.inputs.filter((_, i) => i !== index)
        }));
    };

    const updateInput = (index: number, field: keyof typeof formData.inputs[0], value: string) => {
        setFormData(prev => {
            const newInputs = [...prev.inputs];
            const currentItem = newInputs[index];
            if (currentItem) {
                newInputs[index] = { ...currentItem, [field]: value } as any;
            }
            return { ...prev, inputs: newInputs };
        });
    };

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

    const handleSave = () => {
        const form = document.getElementById('prompt-form') as HTMLFormElement;
        if (form) form.requestSubmit();
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
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.05),transparent_50%)]" />
            <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/prompts">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold">Yangi Prompt</h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Qoralama</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 rounded-full px-6 h-9 font-bold transition-all"
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Saqlash
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 py-8">
                <form id="prompt-form" action={formAction} className="space-y-8">

                    {/* Header Section: Icon & Title */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Icon Box */}
                        <div className="shrink-0">
                            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border-4 border-muted/30 flex items-center justify-center">
                                <Terminal className="h-10 w-10 text-purple-600" />
                            </div>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-4 flex-1 w-full">
                            <Input
                                name="title"
                                placeholder="Prompt Sarlavhasi..."
                                className="text-3xl md:text-5xl font-black h-auto p-0 border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/20 tracking-tight shadow-none"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                            {state.errors?.title && <p className="text-red-500 text-sm mt-1">{state.errors.title[0]}</p>}

                            {/* Category Selector as Pills */}
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = formData.category === cat.name;
                                    return (
                                        <label key={cat.name} className={cn(
                                            "cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium",
                                            isSelected
                                                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
                                                : "bg-background border-border/50 text-muted-foreground hover:border-purple-500/30 hover:bg-purple-500/5"
                                        )}>
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.name}
                                                checked={isSelected}
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <Icon className="h-3.5 w-3.5" />
                                            {cat.name}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>



                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/40">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Settings2 className="h-3 w-3" />
                                    Qisqacha Tavsif
                                </Label>
                                <Textarea
                                    name="description"
                                    placeholder="Bu prompt nima haqida va nima uchun ishlatiladi?"
                                    className="bg-background/50 resize-none h-24 border-border/40 focus:border-purple-500/50 transition-colors"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Teglar
                                </Label>
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

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                        <Cpu className="h-3 w-3" />
                                        AI Model
                                    </Label>
                                    <Input
                                        name="tool"
                                        placeholder="ChatGPT, Claude..."
                                        className="bg-background/50 border-border/40 focus:border-purple-500/50 h-10"
                                        value={formData.tool}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                        <Box className="h-3 w-3" />
                                        Framework
                                    </Label>
                                    <Input
                                        name="framework"
                                        placeholder="STAR, CRIT..."
                                        className="bg-background/50 border-border/40 focus:border-purple-500/50 h-10"
                                        value={formData.framework}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Input Variables Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                        <Terminal className="h-3 w-3" />
                                        O&apos;zgaruvchilar
                                    </Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addInput} className="h-6 text-[10px] uppercase font-bold px-2 bg-purple-500/5 border-purple-500/20 text-purple-600 hover:bg-purple-500/10">
                                        <Plus className="h-3 w-3 mr-1" /> Qo&apos;shish
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.inputs.map((input, idx) => (
                                        <div key={idx} className="flex gap-2 group">
                                            <Input
                                                placeholder="Nomi (masalan: topic)"
                                                value={input.name}
                                                onChange={(e) => updateInput(idx, 'name', e.target.value)}
                                                className="bg-background/50 h-9 text-xs border-border/30 focus:border-purple-500/50"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeInput(idx)} className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {formData.inputs.length === 0 && (
                                        <div className="text-[10px] text-muted-foreground/50 italic px-2 py-4 border border-dashed border-border/30 rounded-lg text-center">
                                            Dinamik o&apos;zgaruvchilar qo&apos;shilmagan
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <input type="hidden" name="inputs" value={JSON.stringify(formData.inputs)} />

                    {/* Editor Tabs */}
                    <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-4">
                                <Label className={cn("text-sm font-semibold cursor-pointer transition-colors", activeTab === 'editor' ? "text-foreground" : "text-muted-foreground")}>
                                    Asosiy Prompt
                                </Label>
                            </div>
                            <TabsList className="bg-muted/30 border border-border/40 h-9 rounded-xl">
                                <TabsTrigger value="editor" className="text-xs h-7 px-3 gap-1.5 rounded-lg"><FileText className="h-3.5 w-3.5" /> Prompt</TabsTrigger>
                                <TabsTrigger value="system" className="text-xs h-7 px-3 gap-1.5 rounded-lg"><Settings2 className="h-3.5 w-3.5" /> System</TabsTrigger>
                                <TabsTrigger value="preview" className="text-xs h-7 px-3 gap-1.5 rounded-lg"><Eye className="h-3.5 w-3.5" /> Ko&apos;rish</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="editor" className="mt-0">
                            <Card className="border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden">
                                <Textarea
                                    name="prompt"
                                    placeholder="Prompt matnini shu yerga yozing..."
                                    className="min-h-[400px] text-lg leading-relaxed p-6 bg-transparent border-0 focus-visible:ring-0 resize-y font-mono"
                                    value={formData.prompt}
                                    onChange={handleInputChange}
                                />
                            </Card>
                            {state.errors?.prompt && <p className="text-red-500 text-sm mt-2">{state.errors.prompt[0]}</p>}
                        </TabsContent>

                        <TabsContent value="system" className="mt-0">
                            <Card className="border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden">
                                <Textarea
                                    name="systemPrompt"
                                    placeholder="System prompt (AI uchun maxsus ko'rsatmalar yoki persona)..."
                                    className="min-h-[400px] text-lg leading-relaxed p-6 bg-transparent border-0 focus-visible:ring-0 resize-y font-mono text-muted-foreground"
                                    value={formData.systemPrompt}
                                    onChange={handleInputChange}
                                />
                            </Card>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                            <Card className="border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden min-h-[400px] p-6">
                                <div className="prose prose-lg dark:prose-invert max-w-none font-mono text-sm">
                                    {formData.prompt ? <MarkdownPreview content={formData.prompt} /> : <p className="text-muted-foreground italic">Matn yo&apos;q</p>}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {state.message && (
                        <div className={cn(
                            "p-4 rounded-xl border text-sm font-medium flex items-center gap-2",
                            state.errors ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                        )}>
                            {state.errors ? <div className="h-2 w-2 rounded-full bg-red-500" /> : <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                            {state.message}
                        </div>
                    )}

                </form>
            </div >
        </main >
    );
}

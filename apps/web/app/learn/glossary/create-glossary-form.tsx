'use client';

import { useActionState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Save } from "lucide-react";
import { createGlossaryTerm } from "@/app/actions/education";

interface CreateGlossaryFormProps {
    initialData?: {
        id: number;
        term: string;
        slug: string;
        definition: string;
        category?: string | null;
    };
    action?: (prevState: any, formData: FormData) => Promise<any>;
}

export function CreateGlossaryForm({ initialData, action }: CreateGlossaryFormProps) {
    const [state, formAction, isPending] = useActionState(
        action || createGlossaryTerm,
        null
    );

    return (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black">{initialData ? 'Atamani Tahrirlash' : 'Yangi Atama Qo\'shish'}</CardTitle>
                <CardDescription>
                    AI lug'ati uchun yangi professional atama va uning tavsifini kiriting.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <form action={formAction} className="space-y-6">
                    {initialData?.id && (
                        <input type="hidden" name="id" value={initialData.id} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="term" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Atama Nomi</Label>
                            <Input
                                id="term"
                                name="term"
                                placeholder="Masalan: Large Language Model"
                                required
                                defaultValue={initialData?.term}
                                className="h-12 rounded-xl bg-background/50"
                                onChange={(e) => {
                                    const slugInput = document.getElementById('slug') as HTMLInputElement;
                                    if (slugInput && !initialData) {
                                        slugInput.value = e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-')
                                            .replace(/(^-|-$)/g, '');
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Slug (URL uchun)</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="masalan: large-language-model"
                                required
                                defaultValue={initialData?.slug}
                                className="h-12 rounded-xl bg-background/50 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Kategoriya</Label>
                        <Input
                            id="category"
                            name="category"
                            placeholder="Masalan: Modellar, Asoslar"
                            defaultValue={initialData?.category ?? undefined}
                            className="h-12 rounded-xl bg-background/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="definition" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tavsif (O'zbek tilida)</Label>
                        <Textarea
                            id="definition"
                            name="definition"
                            placeholder="Atama haqida batafsil tushuntirish..."
                            required
                            defaultValue={initialData?.definition ?? ""}
                            className="min-h-[150px] rounded-xl bg-background/50 resize-none p-4"
                        />
                    </div>

                    <Button
                        disabled={isPending}
                        className="w-full h-12 rounded-xl font-black text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saqlanmoqda...
                            </>
                        ) : (
                            <>
                                {initialData ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {initialData ? 'O\'zgarishlarni Saqlash' : 'Atamani Qo\'shish'}
                            </>
                        )}
                    </Button>

                    {state?.error && (
                        <p className="text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-center italic">
                            {state.error}
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

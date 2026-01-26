'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    id: number;
    type: 'course' | 'lesson' | 'glossary';
    courseSlug?: string;
    action: (id: number, courseSlug?: string) => Promise<any>;
    label?: string;
}

export function DeleteButton({ id, type, courseSlug, action, label }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await action(id, courseSlug);
            const typeLabel = type === 'course' ? 'Kurs' : type === 'lesson' ? 'Dars' : 'Atama';
            toast.success(`${typeLabel} muvaffaqiyatli o'chirildi`);
            setIsOpen(false);
        } catch (error) {
            toast.error("O'chirishda xatolik yuz berdi");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    {label || "O'chirish"}
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-border/40 bg-card/95 backdrop-blur-xl">
                <DialogHeader className="space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-black">Haqiqatan ham o&apos;chirmoqchimisiz?</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Ushbu amalni ortga qaytarib bo&apos;lmaydi. Barcha bog&apos;langan ma&apos;lumotlar butunlay o&apos;chib ketadi.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl h-12 flex-1 font-bold">
                        Bekor qilish
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl h-12 flex-1 font-bold shadow-lg shadow-destructive/20">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        O&apos;chirishni tasdiqlash
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

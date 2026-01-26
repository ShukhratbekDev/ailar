'use client';

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toggleLessonProgress } from "@/app/actions/education";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProgressToggle({
    lessonId,
    courseId,
    courseSlug,
    initialIsCompleted
}: {
    lessonId: number;
    courseId: number;
    courseSlug: string;
    initialIsCompleted: boolean;
}) {
    const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        try {
            const result = await toggleLessonProgress(lessonId, courseId, courseSlug);
            if (result.success) {
                setIsCompleted(!isCompleted);
                toast.success(!isCompleted ? "Bajardim!" : "Bekor qilindi");
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all border",
                isCompleted
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "bg-muted text-muted-foreground border-transparent hover:border-muted-foreground/30",
                isLoading && "opacity-50 cursor-not-allowed"
            )}
        >
            {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 fill-emerald-500/10" />
            ) : (
                <CheckCircle2 className="h-5 w-5 opacity-20 grayscale" />
            )}
        </button>
    );
}

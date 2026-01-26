'use client';

import { useState } from "react";
import { CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { toggleLessonProgress } from "@/app/actions/education";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function MarkCompleteButton({
    lessonId,
    courseId,
    courseSlug,
    nextLessonSlug,
    initialIsCompleted
}: {
    lessonId: number;
    courseId: number;
    courseSlug: string;
    nextLessonSlug?: string;
    initialIsCompleted: boolean;
}) {
    const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const result = await toggleLessonProgress(lessonId, courseId, courseSlug);
            if (result.success) {
                const nowCompleted = !isCompleted;
                setIsCompleted(nowCompleted);

                if (nowCompleted) {
                    toast.success("Dars muvaffaqiyatli yakunlandi!", {
                        icon: <PartyPopper className="h-4 w-4 text-emerald-500" />
                    });

                    // If there's a next lesson, maybe suggest going there or redirect
                    if (nextLessonSlug) {
                        // We could redirect or just show a message. 
                        // Let's just stay on the page but the next button in the parent will be visible anyway.
                    }
                } else {
                    toast.info("Dars yakunlanmagan deb belgilandi");
                }
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
        <Button
            onClick={handleToggle}
            disabled={isLoading}
            size="lg"
            className={cn(
                "w-full sm:w-auto min-w-[200px] rounded-2xl h-14 font-black transition-all duration-300",
                isCompleted
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            )}
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
            ) : null}

            {isCompleted ? "Bajardim!" : "Darsni tugatish"}
        </Button>
    );
}

'use server';

import { db } from "@/db";
import { courses, lessons, glossary, userProgress, quizzes, questions, quizResults, discussions, notifications } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isEditor } from "@/lib/auth";
import { auth, currentUser } from "@clerk/nextjs/server";

const courseSchema = z.object({
    title: z.string().min(3, "Sarlavha kamida 3 ta belgidan iborat bo'lishi kerak"),
    slug: z.string().min(3, "Slug kamida 3 ta belgidan iborat bo'lishi kerak"),
    description: z.string().optional(),
    content: z.string().optional(),
    imageUrl: z.string().url("Noto'g'ri rasm havolasi").or(z.literal("")).optional(),
    bannerUrl: z.string().url("Noto'g'ri banner havolasi").or(z.literal("")).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    category: z.string().min(2, "Kategoriya tanlanishi shart"),
    duration: z.string().optional(),
    externalUrl: z.string().url("Noto'g'ri tashqi havola").or(z.literal("")).optional(),
    language: z.string().default("uz"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    isFeatured: z.boolean().default(false),
});

const lessonSchema = z.object({
    courseId: z.number(),
    title: z.string().min(3, "Sarlavha kamida 3 ta belgidan iborat bo'lishi kerak"),
    slug: z.string().min(3, "Slug kamida 3 ta belgidan iborat bo'lishi kerak"),
    content: z.string().min(10, "Matn kamida 10 ta belgidan iborat bo'lishi kerak"),
    videoUrl: z.string().url("Noto'g'ri video havolasi").or(z.literal("")).optional(),
    sequence: z.number().default(0),
    duration: z.number().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
});

const glossarySchema = z.object({
    term: z.string().min(2, "Atama kamida 2 ta belgidan iborat bo'lishi kerak"),
    slug: z.string().min(2, "Slug kamida 2 ta belgidan iborat bo'lishi kerak"),
    definition: z.string().min(5, "Ta'rif kamida 5 ta belgidan iborat bo'lishi kerak"),
    category: z.string().optional(),
});

export async function createCourse(prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = courseSchema.safeParse({
        title: formData.get("title"),
        slug: formData.get("slug"),
        description: formData.get("description"),
        content: formData.get("content"),
        imageUrl: formData.get("imageUrl"),
        bannerUrl: formData.get("bannerUrl"),
        difficulty: formData.get("difficulty"),
        category: formData.get("category"),
        duration: formData.get("duration"),
        externalUrl: formData.get("externalUrl"),
        language: formData.get("language") || "uz",
        status: formData.get("status"),
        isFeatured: formData.get("isFeatured") === "true",
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        await db.insert(courses).values({
            ...validatedFields.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } catch (error: any) {
        if (error.code === '23505') {
            return { message: "Ushbu slug band, boshqa nom tanlang." };
        }
        return { message: "Bazaga yozishda xatolik yuz berdi." };
    }

    revalidatePath("/learn");
    redirect("/learn");
}

export async function createLesson(prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = lessonSchema.safeParse({
        courseId: Number(formData.get("courseId")),
        title: formData.get("title"),
        slug: formData.get("slug"),
        content: formData.get("content_hidden") || formData.get("content"),
        videoUrl: formData.get("videoUrl"),
        sequence: Number(formData.get("sequence")),
        duration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
        status: formData.get("status"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        await db.insert(lessons).values({
            ...validatedFields.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    } catch (error) {
        return { message: "Darsni saqlashda xatolik yuz berdi." };
    }

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, validatedFields.data.courseId)
    });

    revalidatePath(`/learn/${course?.slug}`);
    redirect(`/learn/${course?.slug}`);
}

export async function updateCourse(id: number, prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = courseSchema.safeParse({
        title: formData.get("title"),
        slug: formData.get("slug"),
        description: formData.get("description"),
        content: formData.get("content"),
        imageUrl: formData.get("imageUrl"),
        bannerUrl: formData.get("bannerUrl"),
        difficulty: formData.get("difficulty"),
        category: formData.get("category"),
        duration: formData.get("duration"),
        externalUrl: formData.get("externalUrl"),
        language: formData.get("language") || "uz",
        status: formData.get("status"),
        isFeatured: formData.get("isFeatured") === "true",
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        await db.update(courses)
            .set({ ...validatedFields.data, updatedAt: new Date() })
            .where(eq(courses.id, id));
    } catch (error) {
        return { message: "O'zgartirishda xatolik yuz berdi." };
    }

    revalidatePath("/learn");
    revalidatePath(`/learn/${validatedFields.data.slug}`);
    redirect(`/learn/${validatedFields.data.slug}`);
}

export async function deleteCourse(id: number) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    await db.delete(courses).where(eq(courses.id, id));

    revalidatePath("/learn");
    redirect("/learn");
}

export async function updateLesson(id: number, prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = lessonSchema.safeParse({
        courseId: Number(formData.get("courseId")),
        title: formData.get("title"),
        slug: formData.get("slug"),
        content: formData.get("content_hidden") || formData.get("content"),
        videoUrl: formData.get("videoUrl"),
        sequence: Number(formData.get("sequence")),
        duration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
        status: formData.get("status"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        await db.update(lessons)
            .set({ ...validatedFields.data, updatedAt: new Date() })
            .where(eq(lessons.id, id));
    } catch (error) {
        return { message: "O'zgartirishda xatolik yuz berdi." };
    }

    const course = await db.query.courses.findFirst({
        where: eq(courses.id, validatedFields.data.courseId)
    });

    revalidatePath(`/learn/${course?.slug}`);
    revalidatePath(`/learn/${course?.slug}/${validatedFields.data.slug}`);
    redirect(`/learn/${course?.slug}/${validatedFields.data.slug}`);
}

export async function deleteLesson(id: number, courseSlug: string) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    await db.delete(lessons).where(eq(lessons.id, id));

    revalidatePath(`/learn/${courseSlug}`);
    redirect(`/learn/${courseSlug}`);
}

export async function createGlossaryTerm(prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = glossarySchema.safeParse({
        term: formData.get("term"),
        slug: formData.get("slug"),
        definition: formData.get("definition"),
        category: formData.get("category"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        await db.insert(glossary).values({
            ...validatedFields.data,
            createdAt: new Date(),
        });
    } catch (error) {
        return { message: "Saqlashda xatolik yuz berdi. Slug band bo'lishi mumkin." };
    }

    revalidatePath("/learn/glossary");
    redirect("/learn/glossary");
}

export async function updateGlossaryTerm(id: number, prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = glossarySchema.safeParse({
        term: formData.get("term"),
        slug: formData.get("slug"),
        definition: formData.get("definition"),
        category: formData.get("category"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        await db.update(glossary)
            .set(validatedFields.data)
            .where(eq(glossary.id, id));
    } catch (error) {
        return { message: "O'zgartirishda xatolik yuz berdi." };
    }

    revalidatePath("/learn/glossary");
    redirect("/learn/glossary");
}

export async function deleteGlossaryTerm(id: number) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    await db.delete(glossary).where(eq(glossary.id, id));

    revalidatePath("/learn/glossary");
    redirect("/learn/glossary");
}

export async function toggleLessonProgress(lessonId: number, courseId: number, courseSlug: string) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Iltimos, avval tizimga kiring" };
    }

    try {
        const existing = await db
            .select()
            .from(userProgress)
            .where(
                and(
                    eq(userProgress.userId, userId),
                    eq(userProgress.lessonId, lessonId)
                )
            );

        if (existing.length > 0) {
            await db
                .delete(userProgress)
                .where(
                    and(
                        eq(userProgress.userId, userId),
                        eq(userProgress.lessonId, lessonId)
                    )
                );
        } else {
            await db.insert(userProgress).values({
                userId,
                lessonId,
                courseId,
            });
        }

        revalidatePath(`/learn/${courseSlug}`);
        return { success: true };
    } catch (error) {
        console.error("Progress error:", error);
        return { error: "Progressni yangilashda xatolik yuz berdi" };
    }
}
const quizSchema = z.object({
    courseId: z.number(),
    title: z.string().min(3, "Sarlavha kamida 3 ta belgidan iborat bo'lishi kerak"),
    description: z.string().optional(),
    passingScore: z.number().min(0).max(100).default(70),
});

const questionSchema = z.object({
    quizId: z.number(),
    text: z.string().min(5, "Savol kamida 5 ta belgidan iborat bo'lishi kerak"),
    options: z.array(z.string()).min(2, "Kamida 2 ta variant bo'lishi kerak"),
    correctAnswer: z.number(),
    explanation: z.string().optional(),
});

export async function createQuiz(prevState: any, formData: FormData) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = quizSchema.safeParse({
        courseId: Number(formData.get("courseId")),
        title: formData.get("title"),
        description: formData.get("description"),
        passingScore: Number(formData.get("passingScore") || 70),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Xatolik yuz berdi. Iltimos, maydonlarni tekshiring.",
        };
    }

    try {
        const [newQuiz] = await db.insert(quizzes).values({
            ...validatedFields.data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        if (!newQuiz) throw new Error("Saqlashda xatolik");
        revalidatePath("/learn");
        return { success: true, quizId: newQuiz.id, message: "Test muvaffaqiyatli yaratildi" };
    } catch (error) {
        return { message: "Testni yaratishda xatolik yuz berdi." };
    }
}

export async function addQuestion(quizId: number, data: { text: string, options: string[], correctAnswer: number, explanation?: string }) {
    const hasPermission = await isEditor();
    if (!hasPermission) throw new Error("Ruxsat berilmagan");

    const validatedFields = questionSchema.safeParse({
        quizId,
        ...data
    });

    if (!validatedFields.success) {
        throw new Error("Ma'lumotlar noto'g'ri");
    }

    try {
        await db.insert(questions).values({
            ...validatedFields.data,
            createdAt: new Date(),
        });
        revalidatePath("/learn");
        return { success: true };
    } catch (error) {
        throw new Error("Savolni saqlashda xatolik yuz berdi");
    }
}

export async function submitQuiz(quizId: number, answers: Record<number, number>) {
    const { userId } = await auth();
    if (!userId) throw new Error("Iltimos, avval tizimga kiring");

    const quizData = await db.query.quizzes.findFirst({
        where: eq(quizzes.id, quizId),
        with: {
            questions: true
        }
    });

    if (!quizData) throw new Error("Test topilmadi");

    let correctCount = 0;
    quizData.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / quizData.questions.length) * 100);
    const passed = score >= (quizData.passingScore || 70);

    try {
        await db.insert(quizResults).values({
            userId,
            quizId,
            courseId: quizData.courseId,
            score,
            passed,
            completedAt: new Date(),
        });

        // Notification for passing
        if (passed) {
            await db.insert(notifications).values({
                userId,
                type: 'achievement',
                title: 'Tabriklaymiz! Testdan o\'tdingiz',
                message: `Siz "${quizData.title}" testidan ${score}% natija bilan o'tdingiz.`,
                isRead: false
            });
        }

        revalidatePath("/learn/dashboard");
        revalidatePath(`/learn/${quizId}`); // Ideally course slug, but this triggers revalidation

        return { success: true, score, passed, correctCount, totalQuestions: quizData.questions.length };
    } catch (error) {
        console.error("Quiz submission error:", error);
        throw new Error("Natijani saqlashda xatolik yuz berdi");
    }
}

// --- Discussions ---

export async function addDiscussion(lessonId: number, content: string, parentId?: number) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const userName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` || "Foydalanuvchi";
    const userImage = user.imageUrl;

    await db.insert(discussions).values({
        lessonId,
        userId: user.id,
        userName,
        userImage,
        content,
        parentId
    });

    // Notify parent author if it's a reply
    if (parentId) {
        const parentComment = await db.query.discussions.findFirst({
            where: eq(discussions.id, parentId)
        });

        if (parentComment && parentComment.userId !== user.id) {
            await db.insert(notifications).values({
                userId: parentComment.userId,
                type: 'reply',
                title: 'Yangi javob',
                message: `${userName} sizning izohingizga javob yozdi.`,
                // link is optional, can be enhanced later to point to deep link
                isRead: false
            });
        }
    }

    revalidatePath(`/learn`, 'layout');
    return { success: true };
}

export async function deleteDiscussion(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check ownership or editor permission
    const comment = await db.query.discussions.findFirst({
        where: eq(discussions.id, id)
    });

    if (!comment) throw new Error("Topilmadi");

    const hasPermission = await isEditor();
    if (comment.userId !== userId && !hasPermission) {
        throw new Error("Ruxsat berilmagan");
    }

    await db.delete(discussions).where(eq(discussions.id, id));
    revalidatePath(`/learn`, 'layout');
    return { success: true };
}

import { discussionLikes } from "@/db/schema";

export async function toggleDiscussionLike(discussionId: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Avval tizimga kiring");

    try {
        const existingLike = await db.query.discussionLikes.findFirst({
            where: and(
                eq(discussionLikes.discussionId, discussionId),
                eq(discussionLikes.userId, userId)
            )
        });

        if (existingLike) {
            await db.delete(discussionLikes).where(
                and(
                    eq(discussionLikes.discussionId, discussionId),
                    eq(discussionLikes.userId, userId)
                )
            );
            await db.update(discussions)
                .set({ upvotes: sql`${discussions.upvotes} - 1` })
                .where(eq(discussions.id, discussionId));
        } else {
            await db.insert(discussionLikes).values({
                discussionId,
                userId,
                createdAt: new Date()
            });
            await db.update(discussions)
                .set({ upvotes: sql`${discussions.upvotes} + 1` })
                .where(eq(discussions.id, discussionId));
        }

        revalidatePath('/learn', 'layout');
        return { success: true };
    } catch (error) {
        throw new Error("Xatolik yuz berdi");
    }
}

// --- Notifications ---

export async function getNotifications() {
    const { userId } = await auth();
    if (!userId) return [];

    return await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(20);
}

export async function markNotificationAsRead(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    revalidatePath(`/learn`, 'layout');
    return { success: true };
}

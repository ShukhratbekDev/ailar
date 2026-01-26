import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { CreateLessonForm } from "../../new/create-lesson-form";
import { updateLesson } from "@/app/actions/education";
import { isEditor } from "@/lib/auth";

export default async function EditLessonPage({
    params
}: {
    params: { slug: string, lessonSlug: string }
}) {
    const p = await params;
    const hasPermission = await isEditor();
    if (!hasPermission) redirect("/learn");

    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) notFound();

    const lesson = await db.query.lessons.findFirst({
        where: and(
            eq(lessons.courseId, course.id),
            eq(lessons.slug, p.lessonSlug)
        )
    });

    if (!lesson) notFound();

    const allCourses = await db.select({
        id: courses.id,
        title: courses.title
    })
        .from(courses)
        .orderBy(asc(courses.title));

    return (
        <CreateLessonForm
            courses={allCourses}
            initialData={lesson as any}
            action={async (prevState, formData) => {
                'use server';
                return await updateLesson(lesson.id, prevState, formData);
            }}
        />
    );
}

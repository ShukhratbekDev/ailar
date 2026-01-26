import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { CreateCourseForm } from "../../new/create-course-form";
import { updateCourse } from "@/app/actions/education";
import { isEditor } from "@/lib/auth";

export default async function EditCoursePage({ params }: { params: { slug: string } }) {
    const p = await params;
    const hasPermission = await isEditor();
    if (!hasPermission) redirect("/learn");

    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) notFound();

    return (
        <CreateCourseForm
            initialData={course as any}
            action={async (prevState, formData) => {
                'use server';
                return await updateCourse(course.id, prevState, formData);
            }}
        />
    );
}

import { isEditor } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateLessonForm } from "../../new/create-lesson-form";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function NewLessonPage() {
    const hasPermission = await isEditor();
    if (!hasPermission) redirect("/learn");

    const allCourses = await db.select({
        id: courses.id,
        title: courses.title
    })
        .from(courses)
        .orderBy(asc(courses.title));

    return <CreateLessonForm courses={allCourses} />;
}

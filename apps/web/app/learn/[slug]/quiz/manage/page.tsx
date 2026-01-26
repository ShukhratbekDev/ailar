import { db } from "@/db";
import { courses, quizzes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { isEditor } from "@/lib/auth";
import { QuizEditor } from "./quiz-editor";

export default async function ManageQuizPage({ params }: { params: { slug: string } }) {
    const p = await params;
    const { userId } = await auth();
    const hasPermission = await isEditor();

    if (!userId || !hasPermission) {
        redirect("/learn");
    }

    const course = await db.query.courses.findFirst({
        where: eq(courses.slug, p.slug)
    });

    if (!course) notFound();

    const existingQuiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.courseId, course.id),
        with: {
            questions: true
        }
    });

    return (
        <main className="min-h-screen bg-background pt-32 pb-24">
            <div className="container mx-auto px-4">
                <QuizEditor
                    courseId={course.id}
                    courseSlug={course.slug}
                    existingQuiz={existingQuiz}
                />
            </div>
        </main>
    );
}

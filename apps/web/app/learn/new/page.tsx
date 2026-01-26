import { isEditor } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateCourseForm } from "./create-course-form";

export default async function NewCoursePage() {
    const hasPermission = await isEditor();
    if (!hasPermission) redirect("/learn");

    return <CreateCourseForm />;
}

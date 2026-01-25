import { isEditor, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateNewsForm } from "./create-news-form";

export default async function CreateNewsPage() {
    const hasPermission = await isEditor();
    const admin = await isAdmin();

    if (!hasPermission) {
        redirect("/news");
    }

    return <CreateNewsForm isAdmin={admin} />;
}

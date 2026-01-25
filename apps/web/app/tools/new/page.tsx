import { isEditor, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateToolForm } from "./create-tool-form";

export default async function CreateToolPage() {
    const hasPermission = await isEditor();
    const admin = await isAdmin();

    if (!hasPermission) {
        redirect("/tools");
    }

    return <CreateToolForm isAdmin={admin} />;
}

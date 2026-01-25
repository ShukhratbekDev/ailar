import { isEditor } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePromptForm } from "./create-prompt-form";

export default async function CreatePromptPage() {
    const hasPermission = await isEditor();

    if (!hasPermission) {
        redirect("/prompts");
    }

    return <CreatePromptForm />;
}

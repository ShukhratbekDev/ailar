import { isEditor } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateGlossaryForm } from "../create-glossary-form";

export default async function NewGlossaryTermPage() {
    const editor = await isEditor();

    if (!editor) {
        redirect('/learn/glossary');
    }

    return (
        <div className="container mx-auto px-4 py-32 max-w-2xl">
            <CreateGlossaryForm />
        </div>
    );
}

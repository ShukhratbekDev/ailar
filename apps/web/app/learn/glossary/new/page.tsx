import { isEditor } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateGlossaryForm } from "../create-glossary-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewGlossaryTermPage() {
    const editor = await isEditor();

    if (!editor) {
        redirect('/learn/glossary');
    }

    return (
        <div className="container mx-auto px-4 py-32 max-w-2xl space-y-8">
            <Link
                href="/learn/glossary"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-opacity"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Lug&apos;atga Qaytish
            </Link>
            <CreateGlossaryForm />
        </div>
    );
}

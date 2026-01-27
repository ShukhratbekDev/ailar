import { isEditor } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { glossary } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateGlossaryForm } from "../../create-glossary-form";
import { updateGlossaryTerm } from "@/app/actions/education";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditGlossaryTermPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const editor = await isEditor();

    if (!editor) {
        redirect('/learn/glossary');
    }

    const term = await db.query.glossary.findFirst({
        where: eq(glossary.id, Number(id))
    });

    if (!term) {
        notFound();
    }

    // Bind the id to the update action
    const updateActionWithId = updateGlossaryTerm.bind(null, Number(id));

    return (
        <div className="container mx-auto px-4 py-32 max-w-2xl space-y-8">
            <Link
                href="/learn/glossary"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-opacity"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Lug&apos;atga Qaytish
            </Link>
            <CreateGlossaryForm
                initialData={term}
                action={updateActionWithId}
            />
        </div>
    );
}

import { isEditor } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { glossary } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateGlossaryForm } from "../../create-glossary-form";
import { updateGlossaryTerm } from "@/app/actions/education";

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
        <div className="container mx-auto px-4 py-32 max-w-2xl">
            <CreateGlossaryForm
                initialData={term}
                action={updateActionWithId}
            />
        </div>
    );
}

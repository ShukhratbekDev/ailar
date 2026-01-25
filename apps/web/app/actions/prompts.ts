'use server';

import { db } from '@/db';
import { prompts } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { isEditor } from '@/lib/auth';

const promptSchema = z.object({
    title: z.string().min(2, "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak"),
    prompt: z.string().min(10, "Prompt kamida 10 ta belgidan iborat bo'lishi kerak"),
    category: z.string().min(2, "Kategoriya tanlanishi kerak"),
    description: z.string().optional(),
    systemPrompt: z.string().optional(),
    framework: z.string().optional(),
    tool: z.string().optional(),
    status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
    inputs: z.array(z.object({
        name: z.string(),
        type: z.string(),
        label: z.string().optional()
    })).optional(),
    tags: z.array(z.string()).optional(),
});

export async function createPrompt(prevState: any, formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        return { message: "Siz tizimga kirmagansiz." };
    }

    const hasPermission = await isEditor();
    if (!hasPermission) {
        return { message: "Sizda ma'lumot qo'shish huquqi yo'q." };
    }

    // Extract basic fields
    const rawData: Record<string, any> = {
        title: formData.get('title'),
        prompt: formData.get('prompt'),
        category: formData.get('category'),
        description: formData.get('description') || undefined,
        systemPrompt: formData.get('systemPrompt') || undefined,
        framework: formData.get('framework') || undefined,
        tool: formData.get('tool') || undefined,
        status: formData.get('status') || 'draft',
    };

    // Extract tags (comma-separated string)
    const tagsStr = formData.get('tags') as string;
    if (tagsStr) {
        rawData.tags = tagsStr.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    // Extract complex fields (inputs) if passed as JSON string
    try {
        const inputsStr = formData.get('inputs') as string;
        if (inputsStr) {
            rawData.inputs = JSON.parse(inputsStr);
        }
    } catch (e) {
        console.error('Error parsing inputs JSON', e);
    }

    const validatedFields = promptSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Ma'lumotlar noto'g'ri kiritildi.",
        };
    }

    const data = validatedFields.data;
    const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    try {
        await db.insert(prompts).values({
            title: data.title,
            slug: slug,
            prompt: data.prompt,
            category: data.category,
            description: data.description,
            systemPrompt: data.systemPrompt,
            framework: data.framework,
            tool: data.tool,
            inputs: data.inputs,
            tags: data.tags,
            authorId: userId,
            status: data.status as "draft" | "review" | "published" | "archived",
        });
    } catch (e) {
        console.error("Database Error:", e);
        return { message: "Bazaga saqlashda xatolik yuz berdi." };
    }

    revalidatePath('/prompts');
    redirect('/prompts');
}

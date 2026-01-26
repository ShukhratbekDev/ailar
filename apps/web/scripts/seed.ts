
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

const db = drizzle(client, { schema });

async function seed() {
    console.log("🌱 Seeding database...");

    // 1. Seed Courses
    const coursesData = [
        {
            title: "Sun'iy Intellekt Asoslari",
            slug: "ai-asoslari",
            description: "AI dunyosiga birinchi qadam. Asosiy tushunchalar, tarix va kelajak.",
            imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
            difficulty: "beginner" as const,
            category: "General AI",
            status: "published" as const,
            language: "uz",
            isFeatured: true,
        },
        {
            title: "Prompt Engineering",
            slug: "prompt-engineering",
            description: "AI modellar bilan samarali muloqot qilish sirlari.",
            imageUrl: "https://images.unsplash.com/photo-1664575602276-acd073f104c1",
            difficulty: "intermediate" as const,
            category: "Engineering",
            status: "published" as const,
            language: "uz",
            isFeatured: true,
        }
    ];

    for (const course of coursesData) {
        await db.insert(schema.courses).values({
            ...course,
            createdAt: new Date(),
            updatedAt: new Date()
        }).onConflictDoNothing();
    }
    console.log("✅ Courses seeded");

    // 2. Seed Glossary
    const glossaryData = [
        {
            term: "LLM (Large Language Model)",
            slug: "llm",
            definition: "Katta hajmdagi matn ma'lumotlarida o'qitilgan sun'iy intellekt modeli.",
            category: "Models"
        },
        {
            term: "Neural Network",
            slug: "neural-network",
            definition: "Inson miyasi ishlash principlariga asoslangan algoritm.",
            category: "Core"
        },
        {
            term: "Token",
            slug: "token",
            definition: "AI matnni qayta ishlashda foydalanadigan eng kichik birlik (so'z bo'lagi).",
            category: "NLP"
        }
    ];

    for (const item of glossaryData) {
        await db.insert(schema.glossary).values({
            ...item,
            createdAt: new Date()
        }).onConflictDoNothing();
    }
    console.log("✅ Glossary seeded");

    // 3. Seed Tools (if needed, but tools grid handles fetching well)
    // ...

    process.exit(0);
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});

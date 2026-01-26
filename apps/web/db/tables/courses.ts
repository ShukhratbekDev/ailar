import { pgTable, serial, text, timestamp, boolean, integer, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { lessons } from "./lessons";

export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    content: text("content"), // Introduction or syllabus
    imageUrl: text("image_url"),
    bannerUrl: text("banner_url"),
    externalUrl: text("external_url"),
    language: varchar("language", { length: 20 }).default("uz").notNull(),

    difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced"], length: 20 }).default("beginner").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    duration: varchar("duration", { length: 50 }), // e.g. "2 soat", "4 hafta"

    status: varchar("status", { enum: ["draft", "published", "archived"], length: 20 }).default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
    lessons: many(lessons),
}));

import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const tools = pgTable("tools", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    url: text("url"),
    imageUrl: text("image_url"),
    category: text("category"),
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content"),
    published: boolean("published").default(false),
    slug: text("slug").unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const prompts = pgTable("prompts", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content"),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow(),
});

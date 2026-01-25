import { pgTable, serial, text, timestamp, boolean, integer, decimal, varchar } from "drizzle-orm/pg-core";

export const news = pgTable("news", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),

    slug: varchar("slug", { length: 255 }).unique(),

    // Media & Meta
    imageUrl: text("image_url"),
    // Author
    userId: text("user_id").notNull(), // Foreign key to users table (Clerk ID is string)
    tags: text("tags").array(),
    sourceUrl: text("source_url"),

    // Content Details
    description: text("description"), // Short summary for cards
    readTime: decimal("read_time", { precision: 3, scale: 1 }), // Best practice: Store number (2.5), render text in UI

    // Engagement
    likeCount: integer("like_count").default(0),
    viewCount: integer("view_count").default(0),

    // Status
    status: varchar("status", { enum: ["draft", "pending", "published", "rejected"], length: 20 }).default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false),
    publishedAt: timestamp("published_at"), // Schedule or display date

    createdAt: timestamp("created_at").defaultNow(),
});

export type NewsStatus = "draft" | "pending" | "published" | "rejected";

import { relations } from "drizzle-orm";
import { users } from "./users";

export const newsRelations = relations(news, ({ one }) => ({
    author: one(users, {
        fields: [news.userId],
        references: [users.id],
    }),
}));

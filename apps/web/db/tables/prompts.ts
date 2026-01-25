import { pgTable, serial, text, timestamp, boolean, integer, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const prompts = pgTable("prompts", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(), // URL-friendly ID

    // Core Content
    prompt: text("prompt").notNull(), // The actual prompt text
    systemPrompt: text("system_prompt"), // System instructions/persona
    description: text("description"),
    usageInstructions: text("usage_instructions"),

    // Structure & Settings
    framework: varchar("framework", { length: 50 }), // e.g. "CRIT", "STAR"
    tool: varchar("tool", { length: 50 }), // e.g. "Midjourney", "ChatGPT"
    metadata: jsonb("metadata"), // For structured details (camera, lighting, etc.)
    parameters: jsonb("parameters"), // Model settings { temperature: 0.7 }

    // Multi-modal Inputs & Outputs
    inputs: jsonb("inputs"), // Array of input definitions [{ name: "topic", type: "text" }, { name: "ref_image", type: "image" }]
    outputs: jsonb("outputs"), // Array of results [{ type: "image", url: "..." }, { type: "code", content: "..." }]

    // Taxonomy
    category: varchar("category", { length: 100 }), // e.g. "Content Development"
    tags: text("tags").array(),
    language: varchar("language", { length: 10 }), // 'uz', 'en', 'ru'

    // Status & Workflow
    status: varchar("status", { enum: ["draft", "review", "published", "archived"], length: 20 }).default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false),

    // Engagement
    viewCount: integer("view_count").default(0),
    copyCount: integer("copy_count").default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    totalRatings: integer("total_ratings").default(0),

    // Author
    authorId: text("author_id"), // Clerk User ID (optional if system prompt)

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    // Optimization Indexes
    statusIdx: index("idx_prompts_status").on(table.status),
    categoryIdx: index("idx_prompts_category").on(table.category),
    toolIdx: index("idx_prompts_tool").on(table.tool),
    createdIdx: index("idx_prompts_created_at").on(table.createdAt),
    featuredIdx: index("idx_prompts_featured").on(table.isFeatured),
    // Composite index for feed performance
    feedIdx: index("idx_prompts_feed").on(table.status, table.isFeatured, table.createdAt),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
    author: one(users, {
        fields: [prompts.authorId],
        references: [users.id],
    }),
}));

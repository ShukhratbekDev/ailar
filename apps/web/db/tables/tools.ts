import { pgTable, serial, text, timestamp, boolean, integer, decimal, json, varchar } from "drizzle-orm/pg-core";

export const tools = pgTable("tools", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description"), // Short summary for cards
    content: text("content"), // Markdown/Long description
    url: text("url"),
    imageUrl: text("image_url"), // Cover/Banner image
    logoUrl: text("logo_url"), // Brand logo
    category: text("category"),
    toolType: varchar("tool_type", { length: 50 }).default('app'), // app, model, api, library

    // Pricing & Features
    pricingType: varchar("pricing_type", { length: 50 }).default('free'), // free, freemium, paid, contact
    pricingText: text("pricing_text"), // e.g., "$29/mo"
    tags: text("tags").array(),
    features: text("features").array(),


    // Evaluation
    pros: text("pros").array(),
    cons: text("cons").array(),

    // Engagement & Stats
    isFeatured: boolean("is_featured").default(false),

    voteCount: integer("vote_count").default(0), // Likes/Upvotes
    viewCount: integer("view_count").default(0),

    // Status
    status: varchar("status", { enum: ["draft", "pending", "published", "rejected"], length: 20 }).default("draft").notNull(),
    publishedAt: timestamp("published_at"),

    // Rating System
    averageRating: decimal("average_rating", { precision: 3, scale: 1 }).default("0.0"),
    reviewCount: integer("review_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
});

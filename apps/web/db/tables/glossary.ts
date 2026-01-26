import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const glossary = pgTable("glossary", {
    id: serial("id").primaryKey(),
    term: varchar("term", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    definition: text("definition").notNull(),
    category: varchar("category", { length: 100 }),

    createdAt: timestamp("created_at").defaultNow(),
});

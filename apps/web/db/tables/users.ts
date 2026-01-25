import { pgTable, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: text("id").primaryKey(), // Stores Clerk ID
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }),
    imageUrl: text("image_url"),
    role: varchar("role", { length: 50 }).default("USER").notNull(),
    credits: integer("credits").default(50).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

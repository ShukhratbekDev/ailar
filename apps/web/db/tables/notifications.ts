import { pgTable, serial, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk User ID
    type: varchar("type", { enum: ["achievement", "reply", "system", "level_up"], length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    link: text("link"), // URL to redirect
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { users } from "./users";

export const creditTransactions = pgTable("credit_transactions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(), // Negative for deduction, positive for addition
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

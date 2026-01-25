import { pgTable, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { tools } from "./tools";

export const toolLikes = pgTable("tool_likes", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    toolId: integer("tool_id").notNull().references(() => tools.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.toolId] }),
    };
});

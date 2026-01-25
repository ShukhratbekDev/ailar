import { pgTable, serial, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { news } from "./news";

export const newsLikes = pgTable("news_likes", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    newsId: integer("news_id").notNull().references(() => news.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.newsId] }),
    };
});

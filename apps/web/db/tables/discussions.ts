import { pgTable, serial, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { lessons } from "./lessons";
import { news } from "./news";
import { tools } from "./tools";

export const discussions = pgTable("discussions", {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    newsId: integer("news_id").references(() => news.id, { onDelete: "cascade" }),
    toolId: integer("tool_id").references(() => tools.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull(),
    userName: varchar("user_name", { length: 255 }).notNull(),
    userImage: text("user_image"),
    content: text("content").notNull(),
    parentId: integer("parent_id"), // For replies
    upvotes: integer("upvotes").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [discussions.lessonId],
        references: [lessons.id],
    }),
    news: one(news, {
        fields: [discussions.newsId],
        references: [news.id],
    }),
    tool: one(tools, {
        fields: [discussions.toolId],
        references: [tools.id],
    }),
    parent: one(discussions, {
        fields: [discussions.parentId],
        references: [discussions.id],
        relationName: "replies",
    }),
    replies: many(discussions, {
        relationName: "replies",
    }),
}));

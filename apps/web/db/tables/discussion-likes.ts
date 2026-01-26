import { pgTable, text, integer, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { discussions } from "./discussions";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const discussionLikes = pgTable("discussion_likes", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    discussionId: integer("discussion_id").notNull().references(() => discussions.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.discussionId] }),
    };
});

export const discussionLikesRelations = relations(discussionLikes, ({ one }) => ({
    discussion: one(discussions, {
        fields: [discussionLikes.discussionId],
        references: [discussions.id],
    }),
}));

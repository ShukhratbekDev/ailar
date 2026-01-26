import { pgTable, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { lessons } from "./lessons";
import { courses } from "./courses";

export const userProgress = pgTable("user_progress", {
    userId: text("user_id").notNull(),
    lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at").defaultNow(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.lessonId] }),
    };
});

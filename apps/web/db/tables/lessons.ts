import { pgTable, serial, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";

export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    content: text("content").notNull(), // Markdown tutorial content
    videoUrl: text("video_url"),

    sequence: integer("sequence").default(0).notNull(), // Order within the course
    duration: integer("duration"), // Duration in minutes

    status: varchar("status", { enum: ["draft", "published"], length: 20 }).default("draft").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessonsRelations = relations(lessons, ({ one }) => ({
    course: one(courses, {
        fields: [lessons.courseId],
        references: [courses.id],
    }),
}));

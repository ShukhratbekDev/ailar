import { pgTable, serial, text, timestamp, boolean, integer, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";

export const quizzes = pgTable("quizzes", {
    id: serial("id").primaryKey(),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    passingScore: integer("passing_score").default(70),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    options: jsonb("options").notNull(), // Array of strings: string[]
    correctAnswer: integer("correct_answer").notNull(), // index of options
    explanation: text("explanation"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
    courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),
    completedAt: timestamp("completed_at").defaultNow(),
});

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
    course: one(courses, {
        fields: [quizzes.courseId],
        references: [courses.id],
    }),
    questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
    quiz: one(quizzes, {
        fields: [questions.quizId],
        references: [quizzes.id],
    }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
    quiz: one(quizzes, {
        fields: [quizResults.quizId],
        references: [quizzes.id],
    }),
    course: one(courses, {
        fields: [quizResults.courseId],
        references: [courses.id],
    }),
}));

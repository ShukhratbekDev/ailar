CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"content" text,
	"image_url" text,
	"banner_url" text,
	"difficulty" varchar(20) DEFAULT 'beginner' NOT NULL,
	"category" varchar(100) NOT NULL,
	"duration" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"video_url" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"duration" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "glossary" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"definition" text NOT NULL,
	"category" varchar(100),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "glossary_term_unique" UNIQUE("term"),
	CONSTRAINT "glossary_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
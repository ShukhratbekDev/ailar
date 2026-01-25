ALTER TABLE "prompts" RENAME COLUMN "content" TO "prompt";--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "category" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "system_prompt" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "usage_instructions" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "framework" varchar(50);--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "tool" varchar(50);--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "parameters" jsonb;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "inputs" jsonb;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "outputs" jsonb;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "language" varchar(10);--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "status" varchar(20) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "copy_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "rating" numeric(3, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "total_ratings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "idx_prompts_status" ON "prompts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_prompts_category" ON "prompts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_prompts_tool" ON "prompts" USING btree ("tool");--> statement-breakpoint
CREATE INDEX "idx_prompts_created_at" ON "prompts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_prompts_featured" ON "prompts" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_prompts_feed" ON "prompts" USING btree ("status","is_featured","created_at");--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_slug_unique" UNIQUE("slug");
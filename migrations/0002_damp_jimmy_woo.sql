CREATE TABLE "badge_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"professional_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"metric_type" text NOT NULL,
	"current_value" real NOT NULL,
	"target_value" real NOT NULL,
	"lastCalculated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "family" text;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "priority" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "professional_badges" ADD COLUMN "is_visible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "badge_metrics" ADD CONSTRAINT "badge_metrics_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_metrics" ADD CONSTRAINT "badge_metrics_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;
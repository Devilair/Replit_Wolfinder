DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `users` ADD `github_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_github_id_unique` ON `users` (`github_id`);
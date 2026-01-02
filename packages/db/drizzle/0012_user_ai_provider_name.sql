ALTER TABLE `user_ai_provider` ADD COLUMN `name` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `user_ai_provider_user_name_unique`
  ON `user_ai_provider` (`user_id`, `name`);

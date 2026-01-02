PRAGMA foreign_keys=OFF;--> statement-breakpoint
ALTER TABLE `user_ai_instruction` RENAME TO `user_ai_instruction_old`;--> statement-breakpoint
ALTER TABLE `user_ai_provider` RENAME TO `user_ai_provider_old`;--> statement-breakpoint
CREATE TABLE `user_ai_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`public_ai_provider_config_id` text,
	`provider_type` text NOT NULL,
	`api_url` text NOT NULL,
	`models_json` text,
	`enabled` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`public_ai_provider_config_id`) REFERENCES `public_ai_provider_config`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `user_ai_provider`("id", "user_id", "public_ai_provider_config_id", "provider_type", "api_url", "models_json", "enabled", "is_default", "created_at", "updated_at")
SELECT
  u."id",
  u."user_id",
  u."public_ai_provider_config_id",
  p."provider_type",
  p."api_url",
  COALESCE(u."models_json", p."models"),
  p."enabled",
  u."is_default",
  u."created_at",
  u."updated_at"
FROM `user_ai_provider_old` u
JOIN `public_ai_provider_config` p
  ON u."public_ai_provider_config_id" = p."id";--> statement-breakpoint
CREATE TABLE `user_ai_instruction` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_ai_provider_id` text,
	`public_ai_instruction_id` text,
	`name` text NOT NULL,
	`instruction_type` text NOT NULL,
	`system_prompt` text NOT NULL,
	`user_prompt_template` text NOT NULL,
	`input_schema_json` text,
	`output_schema_json` text,
	`enabled` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_ai_provider_id`) REFERENCES `user_ai_provider`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`public_ai_instruction_id`) REFERENCES `public_ai_instruction`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `user_ai_instruction`("id", "user_id", "user_ai_provider_id", "public_ai_instruction_id", "name", "instruction_type", "system_prompt", "user_prompt_template", "input_schema_json", "output_schema_json", "enabled", "is_default", "created_at", "updated_at")
SELECT
  i."id",
  i."user_id",
  CASE WHEN p."id" IS NULL THEN NULL ELSE i."user_ai_provider_id" END,
  i."public_ai_instruction_id",
  i."name",
  i."instruction_type",
  i."system_prompt",
  i."user_prompt_template",
  i."input_schema_json",
  i."output_schema_json",
  i."enabled",
  i."is_default",
  i."created_at",
  i."updated_at"
FROM `user_ai_instruction_old` i
LEFT JOIN `user_ai_provider` p
  ON p."id" = i."user_ai_provider_id";--> statement-breakpoint
DROP TABLE `user_ai_instruction_old`;--> statement-breakpoint
DROP TABLE `user_ai_provider_old`;--> statement-breakpoint
PRAGMA foreign_keys=ON;

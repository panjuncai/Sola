CREATE TABLE `public_ai_provider_config` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_type` text NOT NULL,
	`api_url` text NOT NULL,
	`api_key` text,
	`models` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_ai_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`public_ai_provider_config_id` text NOT NULL,
	`models_json` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`public_ai_provider_config_id`) REFERENCES `public_ai_provider_config`(`id`) ON UPDATE no action ON DELETE cascade
);

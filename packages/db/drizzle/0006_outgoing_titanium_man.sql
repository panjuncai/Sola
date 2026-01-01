CREATE TABLE `public_tts_provider_config` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_type` text NOT NULL,
	`api_url` text NOT NULL,
	`api_key` text,
	`region` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tts_voice_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`public_tts_provider_config_id` text NOT NULL,
	`voice_id` text NOT NULL,
	`lang` text NOT NULL,
	`gender` text,
	`name` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`public_tts_provider_config_id`) REFERENCES `public_tts_provider_config`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_article_sentence_tts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sentence_id` text NOT NULL,
	`language_code` text NOT NULL,
	`provider_type` text NOT NULL,
	`voice_id` text,
	`region` text,
	`speed` text,
	`cache_key` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sentence_id`) REFERENCES `user_article_sentences`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_tts_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`public_tts_provider_config_id` text NOT NULL,
	`tts_voice_native` text,
	`tts_voice_target` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`public_tts_provider_config_id`) REFERENCES `public_tts_provider_config`(`id`) ON UPDATE no action ON DELETE cascade
);

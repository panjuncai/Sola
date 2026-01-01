PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`native_language` text DEFAULT 'zh-CN' NOT NULL,
	`target_language` text DEFAULT 'en-US' NOT NULL,
	`ui_language` text,
	`display_order` text DEFAULT 'native_first',
	`playback_pause_ms` integer DEFAULT 0 NOT NULL,
	`playback_native_repeat` integer DEFAULT 1 NOT NULL,
	`playback_target_repeat` integer DEFAULT 1 NOT NULL,
	`use_ai_user_key` integer DEFAULT false NOT NULL,
	`use_tts_user_key` integer DEFAULT false NOT NULL,
	`shadowing_speeds_json` text,
	`user_tier` text DEFAULT 'free' NOT NULL,
	`ai_limit_month` integer DEFAULT 0 NOT NULL,
	`ai_left` integer DEFAULT 0 NOT NULL,
	`ai_reset_at` integer,
	`ai_ad_granted` integer DEFAULT 0 NOT NULL,
	`ai_vip_bonus` integer DEFAULT 0 NOT NULL,
	`tts_limit_month` integer DEFAULT 0 NOT NULL,
	`tts_left` integer DEFAULT 0 NOT NULL,
	`tts_reset_at` integer,
	`tts_ad_granted` integer DEFAULT 0 NOT NULL,
	`tts_vip_bonus` integer DEFAULT 0 NOT NULL,
	`study_total_ms` integer DEFAULT 0 NOT NULL,
	`study_today_ms` integer DEFAULT 0 NOT NULL,
	`study_today_date` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "image", "native_language", "target_language", "ui_language", "display_order", "playback_pause_ms", "playback_native_repeat", "playback_target_repeat", "use_ai_user_key", "use_tts_user_key", "shadowing_speeds_json", "user_tier", "ai_limit_month", "ai_left", "ai_reset_at", "ai_ad_granted", "ai_vip_bonus", "tts_limit_month", "tts_left", "tts_reset_at", "tts_ad_granted", "tts_vip_bonus", "study_total_ms", "study_today_ms", "study_today_date", "created_at", "updated_at") SELECT "id", "name", "email", "email_verified", "image", "native_language", "target_language", "ui_language", "display_order", "playback_pause_ms", "playback_native_repeat", "playback_target_repeat", "use_ai_user_key", "use_tts_user_key", "shadowing_speeds_json", "user_tier", "ai_limit_month", "ai_left", "ai_reset_at", "ai_ad_granted", "ai_vip_bonus", "tts_limit_month", "tts_left", "tts_reset_at", "tts_ad_granted", "tts_vip_bonus", "study_total_ms", "study_today_ms", "study_today_date", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
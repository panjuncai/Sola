ALTER TABLE `users` ADD `native_language` text;--> statement-breakpoint
ALTER TABLE `users` ADD `target_language` text;--> statement-breakpoint
ALTER TABLE `users` ADD `ui_language` text;--> statement-breakpoint
ALTER TABLE `users` ADD `display_order` text DEFAULT 'native_first';--> statement-breakpoint
ALTER TABLE `users` ADD `playback_pause_ms` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `playback_native_repeat` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `playback_target_repeat` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `use_ai_user_key` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `use_tts_user_key` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `shadowing_speeds_json` text;--> statement-breakpoint
ALTER TABLE `users` ADD `user_tier` text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ai_limit_month` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ai_left` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ai_reset_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `ai_ad_granted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ai_vip_bonus` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tts_limit_month` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tts_left` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tts_reset_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `tts_ad_granted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tts_vip_bonus` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `study_total_ms` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `study_today_ms` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `study_today_date` text;
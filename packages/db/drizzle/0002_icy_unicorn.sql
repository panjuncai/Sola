CREATE TABLE `user_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`source_type` text NOT NULL,
	`native_language` text NOT NULL,
	`target_language` text NOT NULL,
	`display_order` text DEFAULT 'native_first' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_article_sentences` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`paragraph_index` integer DEFAULT 0 NOT NULL,
	`target_text` text NOT NULL,
	`native_text` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `user_articles`(`id`) ON UPDATE no action ON DELETE cascade
);

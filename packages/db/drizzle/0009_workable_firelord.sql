CREATE TABLE `public_ai_instruction` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`instruction_type` text NOT NULL,
	`system_prompt` text NOT NULL,
	`user_prompt_template` text NOT NULL,
	`input_schema_json` text,
	`output_schema_json` text,
	`enabled` integer DEFAULT true NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_ai_instruction` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
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
	FOREIGN KEY (`public_ai_instruction_id`) REFERENCES `public_ai_instruction`(`id`) ON UPDATE no action ON DELETE set null
);

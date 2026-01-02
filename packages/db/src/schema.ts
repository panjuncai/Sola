import * as crypto from "node:crypto"
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  nativeLanguage: text("native_language").notNull().default("zh-CN"),
  targetLanguage: text("target_language").notNull().default("en-US"),
  uiLanguage: text("ui_language").notNull().default("zh-CN"),
  displayOrder: text("display_order").default("native_first"),
  playbackPauseMs: integer("playback_pause_ms").notNull().default(1000),
  playbackNativeRepeat: integer("playback_native_repeat").notNull().default(1),
  playbackTargetRepeat: integer("playback_target_repeat").notNull().default(1),
  useAiUserKey: integer("use_ai_user_key", { mode: "boolean" })
    .notNull()
    .default(false),
  useTtsUserKey: integer("use_tts_user_key", { mode: "boolean" })
    .notNull()
    .default(false),
  shadowingSpeedsJson: text("shadowing_speeds_json"),
  userTier: text("user_tier").notNull().default("free"),
  aiLimitMonth: integer("ai_limit_month").notNull().default(0),
  aiLeft: integer("ai_left").notNull().default(0),
  aiResetAt: integer("ai_reset_at", { mode: "timestamp" }),
  aiAdGranted: integer("ai_ad_granted").notNull().default(0),
  aiVipBonus: integer("ai_vip_bonus").notNull().default(0),
  ttsLimitMonth: integer("tts_limit_month").notNull().default(0),
  ttsLeft: integer("tts_left").notNull().default(0),
  ttsResetAt: integer("tts_reset_at", { mode: "timestamp" }),
  ttsAdGranted: integer("tts_ad_granted").notNull().default(0),
  ttsVipBonus: integer("tts_vip_bonus").notNull().default(0),
  studyTotalMs: integer("study_total_ms").notNull().default(0),
  studyTodayMs: integer("study_today_ms").notNull().default(0),
  studyTodayDate: text("study_today_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
})

export const accounts = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const verifications = sqliteTable("verifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const userArticles = sqliteTable("user_articles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(),
  nativeLanguage: text("native_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  displayOrder: text("display_order").notNull().default("native_first"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const userArticleSentences = sqliteTable("user_article_sentences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  articleId: text("article_id")
    .notNull()
    .references(() => userArticles.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  paragraphIndex: integer("paragraph_index").notNull().default(0),
  targetText: text("target_text").notNull(),
  nativeText: text("native_text"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const publicTtsProviderConfig = sqliteTable("public_tts_provider_config", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  providerType: text("provider_type").notNull(),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key"),
  region: text("region"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const publicAiProviderConfig = sqliteTable("public_ai_provider_config", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  providerType: text("provider_type").notNull(),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key"),
  models: text("models"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const publicAiInstruction = sqliteTable("public_ai_instruction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  instructionType: text("instruction_type").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  userPromptTemplate: text("user_prompt_template").notNull(),
  inputSchemaJson: text("input_schema_json"),
  outputSchemaJson: text("output_schema_json"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const ttsVoiceCatalog = sqliteTable("tts_voice_catalog", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  publicTtsProviderConfigId: text("public_tts_provider_config_id")
    .notNull()
    .references(() => publicTtsProviderConfig.id, { onDelete: "cascade" }),
  voiceId: text("voice_id").notNull(),
  lang: text("lang").notNull(),
  gender: text("gender"),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const userTtsProvider = sqliteTable("user_tts_provider", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  publicTtsProviderConfigId: text("public_tts_provider_config_id")
    .notNull()
    .references(() => publicTtsProviderConfig.id, { onDelete: "cascade" }),
  ttsVoiceNative: text("tts_voice_native"),
  ttsVoiceTarget: text("tts_voice_target"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const userAiProvider = sqliteTable(
  "user_ai_provider",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicAiProviderConfigId: text("public_ai_provider_config_id").references(
      () => publicAiProviderConfig.id,
      { onDelete: "cascade" }
    ),
    name: text("name"),
    providerType: text("provider_type").notNull(),
    apiUrl: text("api_url").notNull(),
    apiKey: text("api_key"),
    modelsJson: text("models_json"),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userNameUnique: uniqueIndex("user_ai_provider_user_name_unique").on(
      table.userId,
      table.name
    ),
  })
)

export const userAiInstruction = sqliteTable("user_ai_instruction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userAiProviderId: text("user_ai_provider_id").references(() => userAiProvider.id, {
    onDelete: "set null",
  }),
  publicAiInstructionId: text("public_ai_instruction_id").references(
    () => publicAiInstruction.id,
    { onDelete: "set null" }
  ),
  name: text("name").notNull(),
  instructionType: text("instruction_type").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  userPromptTemplate: text("user_prompt_template").notNull(),
  inputSchemaJson: text("input_schema_json"),
  outputSchemaJson: text("output_schema_json"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const userArticleSentenceTts = sqliteTable("user_article_sentence_tts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sentenceId: text("sentence_id")
    .notNull()
    .references(() => userArticleSentences.id, { onDelete: "cascade" }),
  languageCode: text("language_code").notNull(),
  providerType: text("provider_type").notNull(),
  voiceId: text("voice_id"),
  region: text("region"),
  speed: text("speed"),
  cacheKey: text("cache_key").notNull(),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

import { TRPCError } from "@trpc/server"
import { and, asc, eq, ne, isNotNull } from "drizzle-orm"
import { z } from "zod"

import {
  db,
  publicAiInstruction,
  publicAiProviderConfig,
  publicTtsProviderConfig,
  ttsVoiceCatalog,
  userAiInstruction,
  userAiProvider,
  userTtsProvider,
  users,
} from "@sola/db"
import { AI_INSTRUCTION_TYPES, AI_PROVIDER_TYPES } from "@sola/shared"

import { requireAuthSession } from "../auth-session.js"
import { publicProcedure, router } from "../trpc.js"

const languageCode = z.enum(["zh-CN", "en-US", "fr-FR"])
const displayOrder = z.enum(["native_first", "target_first"])
const shadowingSettingsSchema = z.object({
  enabled: z.boolean(),
  speeds: z.array(z.number()),
})
const aiInstructionType = z.enum(AI_INSTRUCTION_TYPES)
const aiProviderType = z.enum(AI_PROVIDER_TYPES)

const settingsSchema = z.object({
  uiLanguage: languageCode,
  nativeLanguage: languageCode,
  targetLanguage: languageCode,
  displayOrder,
  playbackNativeRepeat: z.number().int().min(0),
  playbackTargetRepeat: z.number().int().min(0),
  playbackPauseMs: z.number().int().min(0),
  useAiUserKey: z.boolean(),
  shadowing: shadowingSettingsSchema,
})

const ttsOptionsInput = z.object({
  nativeLanguage: languageCode,
  targetLanguage: languageCode,
})

const ttsVoiceOption = z.object({
  id: z.string(),
  name: z.string().nullable(),
  voiceId: z.string(),
  lang: z.string(),
  gender: z.string().nullable(),
})

const ttsOptionsOutput = z.object({
  providerId: z.string(),
  providerType: z.string(),
  providerRegion: z.string().nullable(),
  nativeOptions: z.array(ttsVoiceOption),
  targetOptions: z.array(ttsVoiceOption),
  nativeVoiceId: z.string().nullable(),
  targetVoiceId: z.string().nullable(),
})

const updateTtsVoicesInput = z.object({
  nativeVoiceId: z.string().min(1),
  targetVoiceId: z.string().min(1),
})

const aiProviderSchema = z.object({
  id: z.string(),
  providerType: aiProviderType,
  apiUrl: z.string(),
  name: z.string().nullable(),
  apiKey: z.string().nullable(),
  models: z.array(z.string()),
  availableModels: z.array(z.string()),
  isDefault: z.boolean(),
  enabled: z.boolean(),
  isPublic: z.boolean(),
})

const updateAiProviderDefaultInput = z.object({
  id: z.string().min(1),
})

const updateAiProviderModelsInput = z.object({
  id: z.string().min(1),
  models: z.array(z.string()),
})

const updateAiProviderConfigInput = z
  .object({
    id: z.string().min(1),
    apiUrl: z.string().min(1).optional(),
    models: z.array(z.string()).optional(),
    enabled: z.boolean().optional(),
    apiKey: z.string().nullable().optional(),
    name: z.string().optional(),
  })
  .refine(
    (value) =>
      value.apiUrl !== undefined ||
      value.models !== undefined ||
      value.enabled !== undefined ||
      value.apiKey !== undefined ||
      value.name !== undefined,
    {
      message: "No fields to update",
    }
  )

const deleteAiProviderInput = z.object({
  id: z.string().min(1),
})

const resetAiProvidersInput = z.object({
  confirm: z.boolean().optional(),
})

const createUserAiProviderInput = z.object({
  name: z.string().min(1),
  providerType: aiProviderType,
  apiUrl: z.string().min(1),
  models: z.array(z.string().min(1)).min(1),
  apiKey: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
})

const userAiInstructionSchema = z.object({
  id: z.string(),
  name: z.string(),
  instructionType: aiInstructionType,
  systemPrompt: z.string(),
  userPromptTemplate: z.string(),
  inputSchemaJson: z.string().nullable(),
  outputSchemaJson: z.string().nullable(),
  enabled: z.boolean(),
  isDefault: z.boolean(),
  publicAiInstructionId: z.string().nullable(),
  userAiProviderId: z.string().nullable(),
})

const publicAiInstructionSchema = z.object({
  id: z.string(),
  name: z.string(),
  instructionType: aiInstructionType,
  systemPrompt: z.string(),
  userPromptTemplate: z.string(),
  inputSchemaJson: z.string().nullable(),
  outputSchemaJson: z.string().nullable(),
  enabled: z.boolean(),
  isDefault: z.boolean(),
})

const createUserAiInstructionInput = z.object({
  publicAiInstructionId: z.string().min(1),
  userAiProviderId: z.string().nullable(),
})

const updateUserAiInstructionInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  instructionType: aiInstructionType,
  systemPrompt: z.string().min(1),
  userPromptTemplate: z.string().min(1),
  inputSchemaJson: z.string().nullable(),
  outputSchemaJson: z.string().nullable(),
  enabled: z.boolean(),
  isDefault: z.boolean(),
  userAiProviderId: z.string().nullable(),
})

const deleteUserAiInstructionInput = z.object({
  id: z.string().min(1),
})

export const userRouter = router({
  getSettings: publicProcedure.output(settingsSchema).query(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)
    const row = await db.query.users
      .findFirst({
        where: eq(users.id, session.user.id),
      })
      .execute()

    const fallback: {
      uiLanguage: "zh-CN" | "en-US" | "fr-FR"
      nativeLanguage: "zh-CN" | "en-US" | "fr-FR"
      targetLanguage: "zh-CN" | "en-US" | "fr-FR"
      displayOrder: "native_first" | "target_first"
      playbackNativeRepeat: number
      playbackTargetRepeat: number
      playbackPauseMs: number
      useAiUserKey: boolean
      shadowing: { enabled: boolean; speeds: number[] }
    } = {
      uiLanguage: "zh-CN",
      nativeLanguage: "zh-CN",
      targetLanguage: "en-US",
      displayOrder: "native_first",
      playbackNativeRepeat: 1,
      playbackTargetRepeat: 1,
      playbackPauseMs: 1000,
      useAiUserKey: false,
      shadowing: {
        enabled: false,
        speeds: [0.2, 0.4, 0.6, 0.8],
      },
    }

    if (!row) {
      return fallback
    }

    let shadowing = fallback.shadowing
    if (row.shadowingSpeedsJson) {
      try {
        const parsed = JSON.parse(row.shadowingSpeedsJson)
        if (Array.isArray(parsed)) {
          const speeds = parsed
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value))
          if (speeds.length > 0) {
            shadowing = { enabled: true, speeds }
          }
        } else if (parsed && typeof parsed === "object") {
          const enabled = Boolean(parsed.enabled)
          const speedsRaw = Array.isArray(parsed.speeds) ? parsed.speeds : []
          const speeds = speedsRaw
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value))
          shadowing = {
            enabled,
            speeds: speeds.length > 0 ? speeds : fallback.shadowing.speeds,
          }
        }
      } catch {
        shadowing = fallback.shadowing
      }
    }

    return settingsSchema.parse({
      uiLanguage: row.uiLanguage ?? fallback.uiLanguage,
      nativeLanguage: row.nativeLanguage ?? fallback.nativeLanguage,
      targetLanguage: row.targetLanguage ?? fallback.targetLanguage,
      displayOrder: row.displayOrder ?? fallback.displayOrder,
      playbackNativeRepeat: row.playbackNativeRepeat ?? fallback.playbackNativeRepeat,
      playbackTargetRepeat: row.playbackTargetRepeat ?? fallback.playbackTargetRepeat,
      playbackPauseMs: row.playbackPauseMs ?? fallback.playbackPauseMs,
      useAiUserKey: row.useAiUserKey ?? fallback.useAiUserKey,
      shadowing,
    })
  }),

  updateSettings: publicProcedure.input(settingsSchema).mutation(async ({ ctx, input }) => {
    const session = await requireAuthSession(ctx)
    await db
      .update(users)
      .set({
        uiLanguage: input.uiLanguage,
        nativeLanguage: input.nativeLanguage,
        targetLanguage: input.targetLanguage,
        displayOrder: input.displayOrder,
        playbackNativeRepeat: input.playbackNativeRepeat,
        playbackTargetRepeat: input.playbackTargetRepeat,
        playbackPauseMs: input.playbackPauseMs,
        useAiUserKey: input.useAiUserKey,
        shadowingSpeedsJson: JSON.stringify(input.shadowing),
      })
      .where(eq(users.id, session.user.id))
      .run()

    return { ok: true }
  }),

  deleteAccount: publicProcedure.mutation(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)

    await db.delete(users).where(eq(users.id, session.user.id)).run()

    return { ok: true }
  }),

  getTtsOptions: publicProcedure
    .input(ttsOptionsInput)
    .output(ttsOptionsOutput)
    .query(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const provider = await db.query.publicTtsProviderConfig
        .findFirst({
          where: and(
            eq(publicTtsProviderConfig.providerType, "azure"),
            eq(publicTtsProviderConfig.enabled, true)
          ),
        })
        .execute()

      if (!provider) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No enabled public TTS provider available",
        })
      }

      const userProvider = await db.query.userTtsProvider
        .findFirst({
          where: and(
            eq(userTtsProvider.userId, session.user.id),
            eq(userTtsProvider.publicTtsProviderConfigId, provider.id)
          ),
        })
        .execute()

      const nativeOptions = await db.query.ttsVoiceCatalog
        .findMany({
          where: and(
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id),
            eq(ttsVoiceCatalog.lang, input.nativeLanguage)
          ),
          orderBy: asc(ttsVoiceCatalog.voiceId),
        })
        .execute()

      const targetOptions = await db.query.ttsVoiceCatalog
        .findMany({
          where: and(
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id),
            eq(ttsVoiceCatalog.lang, input.targetLanguage)
          ),
          orderBy: asc(ttsVoiceCatalog.voiceId),
        })
        .execute()

      const sortVoices = (rows: typeof nativeOptions) => {
        const rank = (gender: string | null) => {
          if (gender === "Female") return 0
          if (gender === "Male") return 1
          return 2
        }
        return [...rows].sort((a, b) => {
          const g = rank(a.gender) - rank(b.gender)
          if (g !== 0) return g
          const nameA = a.name ?? a.voiceId
          const nameB = b.name ?? b.voiceId
          return nameA.localeCompare(nameB)
        })
      }

      return {
        providerId: provider.id,
        providerType: provider.providerType,
        providerRegion: provider.region ?? null,
        nativeOptions: sortVoices(nativeOptions).map((row) => ({
          id: row.id,
          name: row.name,
          voiceId: row.voiceId,
          lang: row.lang,
          gender: row.gender,
        })),
        targetOptions: sortVoices(targetOptions).map((row) => ({
          id: row.id,
          name: row.name,
          voiceId: row.voiceId,
          lang: row.lang,
          gender: row.gender,
        })),
        nativeVoiceId: userProvider?.ttsVoiceNative ?? null,
        targetVoiceId: userProvider?.ttsVoiceTarget ?? null,
      }
    }),

  updateTtsVoices: publicProcedure
    .input(updateTtsVoicesInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const provider = await db.query.publicTtsProviderConfig
        .findFirst({
          where: and(
            eq(publicTtsProviderConfig.providerType, "azure"),
            eq(publicTtsProviderConfig.enabled, true)
          ),
        })
        .execute()

      if (!provider) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No enabled public TTS provider available",
        })
      }

      const nativeVoice = await db.query.ttsVoiceCatalog
        .findFirst({
          where: and(
            eq(ttsVoiceCatalog.id, input.nativeVoiceId),
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id)
          ),
        })
        .execute()

      const targetVoice = await db.query.ttsVoiceCatalog
        .findFirst({
          where: and(
            eq(ttsVoiceCatalog.id, input.targetVoiceId),
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id)
          ),
        })
        .execute()

      if (!nativeVoice || !targetVoice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid voice selection",
        })
      }

      const existingProvider = await db.query.userTtsProvider
        .findFirst({
          where: and(
            eq(userTtsProvider.userId, session.user.id),
            eq(userTtsProvider.publicTtsProviderConfigId, provider.id)
          ),
        })
        .execute()

      if (existingProvider) {
        await db
          .update(userTtsProvider)
          .set({
            ttsVoiceNative: input.nativeVoiceId,
            ttsVoiceTarget: input.targetVoiceId,
            isDefault: true,
          })
          .where(eq(userTtsProvider.id, existingProvider.id))
          .run()
      } else {
        await db
          .insert(userTtsProvider)
          .values({
            userId: session.user.id,
            publicTtsProviderConfigId: provider.id,
            ttsVoiceNative: input.nativeVoiceId,
            ttsVoiceTarget: input.targetVoiceId,
            isDefault: true,
          })
          .run()
      }

      return { ok: true }
    }),

  getAiProviders: publicProcedure.output(z.array(aiProviderSchema)).query(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)
    const rows = await db
      .select({
        id: userAiProvider.id,
        providerType: userAiProvider.providerType,
        apiUrl: userAiProvider.apiUrl,
        name: userAiProvider.name,
        apiKey: userAiProvider.apiKey,
        models: userAiProvider.modelsJson,
        publicModels: publicAiProviderConfig.models,
        isDefault: userAiProvider.isDefault,
        enabled: userAiProvider.enabled,
        publicAiProviderConfigId: userAiProvider.publicAiProviderConfigId,
      })
      .from(userAiProvider)
      .leftJoin(
        publicAiProviderConfig,
        eq(userAiProvider.publicAiProviderConfigId, publicAiProviderConfig.id)
      )
      .where(eq(userAiProvider.userId, session.user.id))
      .orderBy(asc(userAiProvider.providerType))
      .execute()

    const parseModels = (value: string | null) => {
      if (!value) return []
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item))
        }
      } catch {
        return []
      }
      return []
    }

    return rows
      .map((row) => {
        const models = parseModels(row.models) || []
        const fallback = parseModels(row.publicModels)
        return {
          id: row.id,
          providerType: row.providerType as z.infer<typeof aiProviderType>,
          apiUrl: row.apiUrl,
          name: row.name ?? null,
          apiKey: row.apiKey ?? null,
          models: models.length > 0 ? models : fallback,
          availableModels: fallback,
          isDefault: row.isDefault ?? false,
          enabled: row.enabled ?? true,
          isPublic: Boolean(row.publicAiProviderConfigId),
        }
      })
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  }),

  createUserAiProvider: publicProcedure
    .input(createUserAiProviderInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const normalizedName = input.name.trim()

      if (!normalizedName) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provider name required" })
      }

      const nameExists = await db.query.userAiProvider
        .findFirst({
          where: and(
            eq(userAiProvider.userId, session.user.id),
            eq(userAiProvider.name, normalizedName)
          ),
          columns: { id: true },
        })
        .execute()

      if (nameExists) {
        throw new TRPCError({ code: "CONFLICT", message: "Provider name already exists" })
      }

      const shouldBeDefault = input.isDefault ?? false

      if (shouldBeDefault) {
        await db
          .update(userAiProvider)
          .set({ isDefault: false })
          .where(eq(userAiProvider.userId, session.user.id))
          .run()
      }

      await db
        .insert(userAiProvider)
        .values({
          userId: session.user.id,
          publicAiProviderConfigId: null,
          name: normalizedName,
          providerType: input.providerType,
          apiUrl: input.apiUrl,
          apiKey: input.apiKey ?? null,
          modelsJson: JSON.stringify(input.models),
          enabled: input.enabled ?? true,
          isDefault: shouldBeDefault,
        })
        .run()

      return { ok: true }
    }),

  updateAiProviderDefault: publicProcedure
    .input(updateAiProviderDefaultInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const target = await db.query.userAiProvider
        .findFirst({
          where: and(
            eq(userAiProvider.id, input.id),
            eq(userAiProvider.userId, session.user.id)
          ),
        })
        .execute()

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "AI provider not found" })
      }

      await db
        .update(userAiProvider)
        .set({ isDefault: false })
        .where(eq(userAiProvider.userId, session.user.id))
        .run()

      await db
        .update(userAiProvider)
        .set({ isDefault: true })
        .where(eq(userAiProvider.id, input.id))
        .run()

      return { ok: true }
    }),

  updateAiProviderModels: publicProcedure
    .input(updateAiProviderModelsInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      await db
        .update(userAiProvider)
        .set({ modelsJson: JSON.stringify(input.models) })
        .where(
          and(
            eq(userAiProvider.id, input.id),
            eq(userAiProvider.userId, session.user.id)
          )
        )
        .run()

      return { ok: true }
    }),

  updateAiProviderConfig: publicProcedure
    .input(updateAiProviderConfigInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const target = await db.query.userAiProvider
        .findFirst({
          where: and(
            eq(userAiProvider.id, input.id),
            eq(userAiProvider.userId, session.user.id)
          ),
          columns: { id: true, publicAiProviderConfigId: true },
        })
        .execute()

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "AI provider not found" })
      }

      const updateData: {
        apiUrl?: string
        modelsJson?: string
        enabled?: boolean
        apiKey?: string | null
        name?: string | null
      } = {}

      if (input.apiUrl !== undefined) {
        updateData.apiUrl = input.apiUrl
      }
      if (input.models !== undefined) {
        updateData.modelsJson = JSON.stringify(input.models)
      }
      if (input.enabled !== undefined) {
        updateData.enabled = input.enabled
      }
      if (input.apiKey !== undefined) {
        updateData.apiKey = input.apiKey
      }
      if (input.name !== undefined) {
        const normalizedName = input.name.trim()
        if (!normalizedName) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Provider name required" })
        }
        if (target.publicAiProviderConfigId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Public provider name cannot be changed",
          })
        }
        const nameExists = await db.query.userAiProvider
          .findFirst({
            where: and(
              eq(userAiProvider.userId, session.user.id),
              eq(userAiProvider.name, normalizedName),
              ne(userAiProvider.id, input.id)
            ),
            columns: { id: true },
          })
          .execute()
        if (nameExists) {
          throw new TRPCError({ code: "CONFLICT", message: "Provider name already exists" })
        }
        updateData.name = normalizedName
      }

      await db
        .update(userAiProvider)
        .set(updateData)
        .where(
          and(
            eq(userAiProvider.id, input.id),
            eq(userAiProvider.userId, session.user.id)
          )
        )
        .run()

      return { ok: true }
    }),

  deleteAiProvider: publicProcedure
    .input(deleteAiProviderInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const target = await db.query.userAiProvider
        .findFirst({
          where: and(
            eq(userAiProvider.id, input.id),
            eq(userAiProvider.userId, session.user.id)
          ),
          columns: { id: true, isDefault: true },
        })
        .execute()

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "AI provider not found" })
      }

      await db
        .delete(userAiProvider)
        .where(eq(userAiProvider.id, input.id))
        .run()

      if (target.isDefault) {
        const next = await db.query.userAiProvider
          .findFirst({
            where: eq(userAiProvider.userId, session.user.id),
            orderBy: asc(userAiProvider.providerType),
            columns: { id: true },
          })
          .execute()
        if (next) {
          await db
            .update(userAiProvider)
            .set({ isDefault: true })
            .where(eq(userAiProvider.id, next.id))
            .run()
        }
      }

      return { ok: true }
    }),

  resetAiProvidersToPublic: publicProcedure
    .input(resetAiProvidersInput)
    .mutation(async ({ ctx }) => {
      const session = await requireAuthSession(ctx)
      const publicProviders = await db.query.publicAiProviderConfig
        .findMany({
          where: eq(publicAiProviderConfig.enabled, true),
        })
        .execute()

      if (publicProviders.length === 0) {
        return { ok: true }
      }

      await db
        .delete(userAiProvider)
        .where(
          and(
            eq(userAiProvider.userId, session.user.id),
            isNotNull(userAiProvider.publicAiProviderConfigId)
          )
        )
        .run()

      await db
        .insert(userAiProvider)
        .values(
          publicProviders.map((provider) => ({
            userId: session.user.id,
            publicAiProviderConfigId: provider.id,
            providerType: provider.providerType,
            apiUrl: provider.apiUrl,
            modelsJson: provider.models ?? null,
            enabled: provider.enabled ?? true,
            isDefault: provider.providerType === "openai",
            name: null,
            apiKey: null,
          }))
        )
        .run()

      return { ok: true }
    }),

  getUserAiInstructions: publicProcedure
    .output(z.array(userAiInstructionSchema))
    .query(async ({ ctx }) => {
      const session = await requireAuthSession(ctx)
      const rows = await db.query.userAiInstruction
        .findMany({
          where: eq(userAiInstruction.userId, session.user.id),
          orderBy: asc(userAiInstruction.name),
        })
        .execute()

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        instructionType: row.instructionType as z.infer<typeof aiInstructionType>,
        systemPrompt: row.systemPrompt,
        userPromptTemplate: row.userPromptTemplate,
        inputSchemaJson: row.inputSchemaJson,
        outputSchemaJson: row.outputSchemaJson,
        enabled: row.enabled ?? true,
        isDefault: row.isDefault ?? false,
        publicAiInstructionId: row.publicAiInstructionId ?? null,
        userAiProviderId: row.userAiProviderId ?? null,
      }))
    }),

  getPublicAiInstructions: publicProcedure
    .output(z.array(publicAiInstructionSchema))
    .query(async () => {
      const rows = await db.query.publicAiInstruction
        .findMany({
          where: eq(publicAiInstruction.enabled, true),
          orderBy: asc(publicAiInstruction.name),
        })
        .execute()

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        instructionType: row.instructionType as z.infer<typeof aiInstructionType>,
        systemPrompt: row.systemPrompt,
        userPromptTemplate: row.userPromptTemplate,
        inputSchemaJson: row.inputSchemaJson,
        outputSchemaJson: row.outputSchemaJson,
        enabled: row.enabled ?? true,
        isDefault: row.isDefault ?? false,
      }))
    }),

  createUserAiInstructionFromPublic: publicProcedure
    .input(createUserAiInstructionInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const instruction = await db.query.publicAiInstruction
        .findFirst({
          where: eq(publicAiInstruction.id, input.publicAiInstructionId),
        })
        .execute()

      if (!instruction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Public instruction not found" })
      }

      const fallbackProvider = await db.query.userAiProvider
        .findFirst({
          where: and(
            eq(userAiProvider.userId, session.user.id),
            eq(userAiProvider.isDefault, true)
          ),
        })
        .execute()

      await db
        .insert(userAiInstruction)
        .values({
          userId: session.user.id,
          userAiProviderId: input.userAiProviderId ?? fallbackProvider?.id ?? null,
          publicAiInstructionId: instruction.id,
          name: instruction.name,
          instructionType: instruction.instructionType,
          systemPrompt: instruction.systemPrompt,
          userPromptTemplate: instruction.userPromptTemplate,
          inputSchemaJson: instruction.inputSchemaJson,
          outputSchemaJson: instruction.outputSchemaJson,
          enabled: instruction.enabled ?? true,
          isDefault: false,
        })
        .run()

      return { ok: true }
    }),

  updateUserAiInstruction: publicProcedure
    .input(updateUserAiInstructionInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      const existing = await db.query.userAiInstruction
        .findFirst({
          where: and(
            eq(userAiInstruction.id, input.id),
            eq(userAiInstruction.userId, session.user.id)
          ),
        })
        .execute()

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Instruction not found" })
      }

      await db
        .update(userAiInstruction)
        .set({
          name: input.name,
          instructionType: input.instructionType,
          systemPrompt: input.systemPrompt,
          userPromptTemplate: input.userPromptTemplate,
          inputSchemaJson: input.inputSchemaJson,
          outputSchemaJson: input.outputSchemaJson,
          enabled: input.enabled,
          isDefault: input.isDefault,
          userAiProviderId: input.userAiProviderId,
        })
        .where(eq(userAiInstruction.id, input.id))
        .run()

      if (input.isDefault) {
        await db
          .update(userAiInstruction)
          .set({ isDefault: false })
          .where(
            and(
              eq(userAiInstruction.userId, session.user.id),
              eq(userAiInstruction.instructionType, input.instructionType),
              ne(userAiInstruction.id, input.id)
            )
          )
          .run()
      }

      return { ok: true }
    }),

  deleteUserAiInstruction: publicProcedure
    .input(deleteUserAiInstructionInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)
      await db
        .delete(userAiInstruction)
        .where(
          and(
            eq(userAiInstruction.id, input.id),
            eq(userAiInstruction.userId, session.user.id)
          )
        )
        .run()

      return { ok: true }
    }),
})

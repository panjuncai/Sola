import { TRPCError } from "@trpc/server"
import { and, asc, eq } from "drizzle-orm"
import { z } from "zod"

import { db, publicTtsProviderConfig, ttsVoiceCatalog, userTtsProvider, users } from "@sola/db"

import { requireAuthSession } from "../auth-session.js"
import { publicProcedure, router } from "../trpc.js"

const languageCode = z.enum(["zh-CN", "en-US", "fr-FR"])
const displayOrder = z.enum(["native_first", "target_first"])

const settingsSchema = z.object({
  uiLanguage: languageCode,
  nativeLanguage: languageCode,
  targetLanguage: languageCode,
  displayOrder,
  playbackNativeRepeat: z.number().int().min(0),
  playbackTargetRepeat: z.number().int().min(0),
  playbackPauseMs: z.number().int().min(0),
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
  nativeOptions: z.array(ttsVoiceOption),
  targetOptions: z.array(ttsVoiceOption),
  nativeVoiceId: z.string().nullable(),
  targetVoiceId: z.string().nullable(),
})

const updateTtsVoicesInput = z.object({
  nativeVoiceId: z.string().min(1),
  targetVoiceId: z.string().min(1),
})

export const userRouter = router({
  getSettings: publicProcedure.output(settingsSchema).query(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)
    const row = await db.query.users
      .findFirst({
        where: eq(users.id, session.user.id),
      })
      .execute()

    const fallback = {
      uiLanguage: "zh-CN",
      nativeLanguage: "zh-CN",
      targetLanguage: "en-US",
      displayOrder: "native_first",
      playbackNativeRepeat: 1,
      playbackTargetRepeat: 1,
      playbackPauseMs: 0,
    } as const

    if (!row) {
      return fallback
    }

    return settingsSchema.parse({
      uiLanguage: row.uiLanguage ?? fallback.uiLanguage,
      nativeLanguage: row.nativeLanguage ?? fallback.nativeLanguage,
      targetLanguage: row.targetLanguage ?? fallback.targetLanguage,
      displayOrder: row.displayOrder ?? fallback.displayOrder,
      playbackNativeRepeat: row.playbackNativeRepeat ?? fallback.playbackNativeRepeat,
      playbackTargetRepeat: row.playbackTargetRepeat ?? fallback.playbackTargetRepeat,
      playbackPauseMs: row.playbackPauseMs ?? fallback.playbackPauseMs,
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
})

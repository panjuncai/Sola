import { TRPCError } from "@trpc/server"
import { and, asc, desc, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { router, publicProcedure } from "../trpc.js"
import {
  authSessionResponseSchema,
  callAuthEndpoint,
  requireAuthSession,
} from "../auth-session.js"

import {
  db,
  publicAiProviderConfig,
  publicTtsProviderConfig,
  sessions,
  ttsVoiceCatalog,
  userAiProvider,
  userTtsProvider,
  users,
} from "@sola/db"


export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
        name: z.string().min(1),
        nativeLanguage: z.enum(["zh-CN", "en-US", "fr-FR"]),
        targetLanguage: z.enum(["zh-CN", "en-US", "fr-FR"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await callAuthEndpoint(ctx, "/sign-up/email", {
        method: "POST",
        json: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      })

      const user = await db.query.users
        .findFirst({
          where: eq(users.email, input.email),
        })
        .execute()

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User record not found after sign-up",
        })
      }

      await db
        .update(users)
        .set({
          nativeLanguage: input.nativeLanguage,
          targetLanguage: input.targetLanguage,
        })
        .where(eq(users.id, user.id))
        .run()

      const provider = await db.query.publicTtsProviderConfig
        .findFirst({
          where: eq(publicTtsProviderConfig.id, "1"),
        })
        .execute()

      if (!provider) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Default public TTS provider (id=1) is missing",
        })
      }

      const nativeVoice = await db.query.ttsVoiceCatalog
        .findFirst({
          where: and(
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id),
            eq(ttsVoiceCatalog.lang, input.nativeLanguage)
          ),
          orderBy: asc(ttsVoiceCatalog.voiceId),
        })
        .execute()

      const targetVoice = await db.query.ttsVoiceCatalog
        .findFirst({
          where: and(
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id),
            eq(ttsVoiceCatalog.lang, input.targetLanguage)
          ),
          orderBy: asc(ttsVoiceCatalog.voiceId),
        })
        .execute()

      if (!nativeVoice || !targetVoice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No default TTS voice available for the selected languages",
        })
      }

      const existingProvider = await db.query.userTtsProvider
        .findFirst({
          where: and(
            eq(userTtsProvider.userId, user.id),
            eq(userTtsProvider.publicTtsProviderConfigId, provider.id)
          ),
        })
        .execute()

      if (existingProvider) {
        await db
          .update(userTtsProvider)
          .set({
            ttsVoiceNative: nativeVoice.id,
            ttsVoiceTarget: targetVoice.id,
            isDefault: true,
          })
          .where(eq(userTtsProvider.id, existingProvider.id))
          .run()
      } else {
        await db
          .insert(userTtsProvider)
          .values({
            userId: user.id,
            publicTtsProviderConfigId: provider.id,
            ttsVoiceNative: nativeVoice.id,
            ttsVoiceTarget: targetVoice.id,
            isDefault: true,
          })
          .run()
      }

      const aiProviders = await db.query.publicAiProviderConfig
        .findMany({
          where: eq(publicAiProviderConfig.enabled, true),
        })
        .execute()

      if (aiProviders.length > 0) {
        await db
          .insert(userAiProvider)
          .values(
            aiProviders.map((provider) => ({
              userId: user.id,
              publicAiProviderConfigId: provider.id,
              modelsJson: provider.models ?? null,
              isDefault: provider.providerType === "openai",
            }))
          )
          .run()
      }

      return result
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Device limit (max 3 sessions): before creating a new session, evict the oldest one.
      const user = await db.query.users
        .findFirst({
          where: eq(users.email, input.email),
          columns: { id: true },
        })
        .execute()

      if (user) {
        const existing = await db.query.sessions
          .findMany({
            where: eq(sessions.userId, user.id),
            orderBy: asc(sessions.createdAt),
            columns: { id: true },
          })
          .execute()

        if (existing.length >= 3) {
          await db.delete(sessions).where(eq(sessions.id, existing[0]!.id)).run()
        }
      }

      return callAuthEndpoint(ctx, "/sign-in/email", {
        method: "POST",
        json: {
          email: input.email,
          password: input.password,
        },
      })
    }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    return callAuthEndpoint(ctx, "/sign-out", {
      method: "POST",
    })
  }),

  getSession: publicProcedure
    .output(authSessionResponseSchema)
    .query(async ({ ctx }) => {
      const result = await callAuthEndpoint(ctx, "/get-session", {
        method: "GET",
      })
      return authSessionResponseSchema.parse(result)
    }),

  getMySessions: publicProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          ipAddress: z.string().nullable().optional(),
          userAgent: z.string().nullable().optional(),
          createdAt: z.number(),
          isCurrent: z.boolean(),
        })
      )
    )
    .query(async ({ ctx }) => {
      const session = await requireAuthSession(ctx)
      const currentToken = (session.session as any)?.token as string | undefined

      const rows = await db.query.sessions
        .findMany({
          where: eq(sessions.userId, session.user.id),
          orderBy: desc(sessions.createdAt),
        })
        .execute()

      return rows.map((row) => ({
        id: row.id,
        ipAddress: row.ipAddress ?? null,
        userAgent: row.userAgent ?? null,
        createdAt: row.createdAt instanceof Date ? row.createdAt.getTime() : Number(row.createdAt),
        isCurrent: currentToken ? row.token === currentToken : false,
      }))
    }),

  signOutOtherDevices: publicProcedure.mutation(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)
    const currentToken = (session.session as any)?.token as string | undefined
    if (!currentToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unable to resolve current session token",
      })
    }

    db.delete(sessions)
      .where(and(eq(sessions.userId, session.user.id), ne(sessions.token, currentToken)))
      .run()

    return { ok: true }
  }),
})

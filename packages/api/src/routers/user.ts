import { eq } from "drizzle-orm"
import { z } from "zod"

import { db, users } from "@sola/db"

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
})

import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import {
  db,
  publicAiProviderConfig,
  userAiInstruction,
  userAiProvider,
  userArticleSentences,
  userArticles,
  users,
} from "@sola/db"

import { requireAuthSession } from "../auth-session.js"
import { publicProcedure, router } from "../trpc.js"

const translateSentenceInput = z.object({
  sentenceId: z.string().min(1),
  instructionId: z.string().min(1),
})

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

const renderTemplate = (template: string, data: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "")

export const aiRouter = router({
  translateSentence: publicProcedure
    .input(translateSentenceInput)
    .mutation(async ({ ctx, input }) => {
      const session = await requireAuthSession(ctx)

      const sentenceRow = await db
        .select({
          id: userArticleSentences.id,
          targetText: userArticleSentences.targetText,
        })
        .from(userArticleSentences)
        .innerJoin(userArticles, eq(userArticleSentences.articleId, userArticles.id))
        .where(
          and(
            eq(userArticleSentences.id, input.sentenceId),
            eq(userArticles.userId, session.user.id)
          )
        )
        .execute()

      const sentence = sentenceRow[0]
      if (!sentence) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sentence not found" })
      }

      const instruction = await db.query.userAiInstruction
        .findFirst({
          where: and(
            eq(userAiInstruction.id, input.instructionId),
            eq(userAiInstruction.userId, session.user.id),
            eq(userAiInstruction.enabled, true)
          ),
        })
        .execute()

      if (!instruction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Instruction not found" })
      }

      const providerId =
        instruction.userAiProviderId ??
        (await db.query.userAiProvider
          .findFirst({
            where: and(
              eq(userAiProvider.userId, session.user.id),
              eq(userAiProvider.isDefault, true)
            ),
          })
          .execute())?.id

      if (!providerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "AI provider not found" })
      }

      const provider = await db.query.userAiProvider
        .findFirst({
          where: and(
            eq(userAiProvider.id, providerId),
            eq(userAiProvider.userId, session.user.id)
          ),
        })
        .execute()

      if (!provider) {
        throw new TRPCError({ code: "NOT_FOUND", message: "AI provider not found" })
      }

      const user = await db.query.users
        .findFirst({
          where: eq(users.id, session.user.id),
          columns: { nativeLanguage: true, useAiUserKey: true },
        })
        .execute()

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
      }

      let apiUrl = provider.apiUrl
      let apiKey: string | null = null
      let models = parseModels(provider.modelsJson)

      if (user.useAiUserKey) {
        apiKey = provider.apiKey ?? null
      } else {
        if (!provider.publicAiProviderConfigId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Public provider is not available",
          })
        }
        const publicProvider = await db.query.publicAiProviderConfig
          .findFirst({
            where: eq(publicAiProviderConfig.id, provider.publicAiProviderConfigId),
          })
          .execute()
        if (!publicProvider) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Public provider not found" })
        }
        apiUrl = publicProvider.apiUrl
        apiKey = publicProvider.apiKey ?? null
        models = parseModels(publicProvider.models)
      }

      if (!apiKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "API key is missing" })
      }

      const selectedModel = instruction.model?.trim()
      const model = selectedModel || models[0]
      if (!model) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Model is missing" })
      }

      const userPrompt = renderTemplate(instruction.userPromptTemplate, {
        target_text: sentence.targetText,
        native_language: user.nativeLanguage,
      })

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: instruction.systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorText || "AI request failed",
        })
      }

      const payload = (await response.json()) as any
      const translation =
        payload?.choices?.[0]?.message?.content ??
        payload?.choices?.[0]?.text ??
        ""

      if (!translation || typeof translation !== "string") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No translation returned",
        })
      }

      await db
        .update(userArticleSentences)
        .set({ nativeText: translation.trim() })
        .where(eq(userArticleSentences.id, sentence.id))
        .run()

      return { sentenceId: sentence.id, translation: translation.trim() }
    }),
})

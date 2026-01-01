import * as crypto from "node:crypto"
import { z } from "zod"

import { db, userArticles, userArticleSentences } from "@sola/db"

import { requireAuthSession } from "../auth-session.js"
import { router, publicProcedure } from "../trpc.js"

const createArticleInput = z.object({
  title: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1),
  sourceType: z.enum(["word_list", "article"]),
  nativeLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  displayOrder: z.enum(["native_first", "target_first"]).optional(),
})

type SentenceDraft = {
  orderIndex: number
  paragraphIndex: number
  targetText: string
}

function splitWordList(content: string): SentenceDraft[] {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return lines.map((line, index) => ({
    orderIndex: index,
    paragraphIndex: 0,
    targetText: line,
  }))
}

function splitArticleContent(content: string): SentenceDraft[] {
  const normalized = content.replace(/\r\n/g, "\n").trim()
  const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const sentences: SentenceDraft[] = []
  let orderIndex = 0

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const merged = paragraph.replace(/\n+/g, " ").trim()
    if (!merged) return

    const parts = merged
      .split(/(?<=[.!?。！？])\s+/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length === 0) {
      sentences.push({
        orderIndex: orderIndex++,
        paragraphIndex,
        targetText: merged,
      })
      return
    }

    for (const part of parts) {
      sentences.push({
        orderIndex: orderIndex++,
        paragraphIndex,
        targetText: part,
      })
    }
  })

  if (sentences.length === 0 && normalized) {
    sentences.push({
      orderIndex: 0,
      paragraphIndex: 0,
      targetText: normalized,
    })
  }

  return sentences
}

export const articleRouter = router({
  create: publicProcedure.input(createArticleInput).mutation(async ({ input, ctx }) => {
    const session = await requireAuthSession(ctx)
    const articleId = crypto.randomUUID()
    const displayOrder = input.displayOrder ?? "native_first"

    const sentenceDrafts =
      input.sourceType === "word_list"
        ? splitWordList(input.content)
        : splitArticleContent(input.content)

    await db
      .insert(userArticles)
      .values({
        id: articleId,
        userId: session.user.id,
        title: input.title ?? null,
        content: input.content,
        sourceType: input.sourceType,
        nativeLanguage: input.nativeLanguage,
        targetLanguage: input.targetLanguage,
        displayOrder,
      })
      .run()

    if (sentenceDrafts.length > 0) {
      await db
        .insert(userArticleSentences)
        .values(
          sentenceDrafts.map((sentence) => ({
            articleId,
            orderIndex: sentence.orderIndex,
            paragraphIndex: sentence.paragraphIndex,
            targetText: sentence.targetText,
          }))
        )
        .run()
    }

    return {
      articleId,
      sentenceCount: sentenceDrafts.length,
    }
  }),
})

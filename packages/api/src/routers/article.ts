import * as crypto from "node:crypto"
import { TRPCError } from "@trpc/server"
import { and, asc, desc, eq, inArray } from "drizzle-orm"
import { z } from "zod"
import fs from "node:fs"
import path from "node:path"

import {
  db,
  userArticles,
  userArticleSentences,
  userArticleSentenceTts,
  users,
} from "@sola/db"

import { requireAuthSession } from "../auth-session.js"
import { router, publicProcedure } from "../trpc.js"

const createArticleInput = z.object({
  title: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1),
  sourceType: z.enum(["word_list", "article"]),
  nativeLanguage: z.string().min(1).optional(),
  targetLanguage: z.string().min(1).optional(),
  displayOrder: z.enum(["native_first", "target_first"]).optional(),
})

const getArticleInput = z.object({
  articleId: z.string().min(1),
})

const deleteManyInput = z.object({
  articleIds: z.array(z.string().min(1)).min(1),
})

const updateSentenceInput = z.object({
  sentenceId: z.string().min(1),
  nativeText: z.string().optional(),
  targetText: z.string().optional(),
})

const deleteSentenceInput = z.object({
  sentenceId: z.string().min(1),
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
    const lines = paragraph
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length === 0) return

    for (const line of lines) {
      const parts = line
        .split(/(?<=[.!?。！？])\s+/)
        .map((part) => part.trim())
        .filter(Boolean)

      if (parts.length === 0) {
        sentences.push({
          orderIndex: orderIndex++,
          paragraphIndex,
          targetText: line,
        })
        continue
      }

      for (const part of parts) {
        sentences.push({
          orderIndex: orderIndex++,
          paragraphIndex,
          targetText: part,
        })
      }
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

function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}

function toTimestamp(value: unknown) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === "number") return value
  return Number(value)
}

function resolvePublicTtsDir() {
  const cwd = process.cwd()
  const serverDir = cwd.endsWith(path.join("apps", "server"))
    ? cwd
    : path.join(cwd, "apps", "server")
  return path.join(serverDir, "public", "tts")
}

async function deleteSentenceTtsFiles(params: {
  userId: string
  sentenceId: string
}) {
  const rows = await db.query.userArticleSentenceTts
    .findMany({
      where: and(
        eq(userArticleSentenceTts.userId, params.userId),
        eq(userArticleSentenceTts.sentenceId, params.sentenceId)
      ),
    })
    .execute()

  if (rows.length === 0) return

  const storageDir = process.env.SOLA_TTS_DIR ?? resolvePublicTtsDir()
  for (const row of rows) {
    if (!row.url) continue
    const fileName = row.url.split("/").pop()
    if (!fileName) continue
    const filePath = path.join(storageDir, fileName)
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch {
      // ignore missing file cleanup errors
    }
  }

  await db
    .delete(userArticleSentenceTts)
    .where(
      and(
        eq(userArticleSentenceTts.userId, params.userId),
        eq(userArticleSentenceTts.sentenceId, params.sentenceId)
      )
    )
    .run()
}

export const articleRouter = router({
  create: publicProcedure.input(createArticleInput).mutation(async ({ input, ctx }) => {
    const session = await requireAuthSession(ctx)
    const articleId = crypto.randomUUID()
    const user = await db.query.users
      .findFirst({
        where: eq(users.id, session.user.id),
      })
      .execute()

    const displayOrder = input.displayOrder ?? user?.displayOrder ?? "native_first"
    const title = input.title?.trim() || deriveTitle(input.content)
    const nativeLanguage = input.nativeLanguage ?? user?.nativeLanguage ?? "zh-CN"
    const targetLanguage = input.targetLanguage ?? user?.targetLanguage ?? "en-US"

    const sentenceDrafts =
      input.sourceType === "word_list"
        ? splitWordList(input.content)
        : splitArticleContent(input.content)

    await db
      .insert(userArticles)
      .values({
        id: articleId,
        userId: session.user.id,
        title,
        content: input.content,
        sourceType: input.sourceType,
        nativeLanguage,
        targetLanguage,
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

  list: publicProcedure.query(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)

    const rows = await db.query.userArticles
      .findMany({
        where: eq(userArticles.userId, session.user.id),
        orderBy: desc(userArticles.createdAt),
      })
      .execute()

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      sourceType: row.sourceType,
      nativeLanguage: row.nativeLanguage,
      targetLanguage: row.targetLanguage,
      displayOrder: row.displayOrder,
      createdAt: toTimestamp(row.createdAt),
      updatedAt: toTimestamp(row.updatedAt),
    }))
  }),

  get: publicProcedure.input(getArticleInput).query(async ({ input, ctx }) => {
    const session = await requireAuthSession(ctx)

    const article = await db.query.userArticles
      .findFirst({
        where: and(
          eq(userArticles.id, input.articleId),
          eq(userArticles.userId, session.user.id)
        ),
      })
      .execute()

    if (!article) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Article not found",
      })
    }

    const sentences = await db.query.userArticleSentences
      .findMany({
        where: eq(userArticleSentences.articleId, article.id),
        orderBy: asc(userArticleSentences.orderIndex),
      })
      .execute()

    return {
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        sourceType: article.sourceType,
        nativeLanguage: article.nativeLanguage,
        targetLanguage: article.targetLanguage,
        displayOrder: article.displayOrder,
        createdAt: toTimestamp(article.createdAt),
        updatedAt: toTimestamp(article.updatedAt),
      },
      sentences: sentences.map((row) => ({
        id: row.id,
        orderIndex: row.orderIndex,
        paragraphIndex: row.paragraphIndex,
        targetText: row.targetText,
        nativeText: row.nativeText,
        createdAt: toTimestamp(row.createdAt),
        updatedAt: toTimestamp(row.updatedAt),
      })),
    }
  }),

  deleteMany: publicProcedure.input(deleteManyInput).mutation(async ({ input, ctx }) => {
    const session = await requireAuthSession(ctx)

    await db
      .delete(userArticles)
      .where(
        and(
          eq(userArticles.userId, session.user.id),
          inArray(userArticles.id, input.articleIds)
        )
      )
      .run()

    return { ok: true }
  }),

  updateSentence: publicProcedure
    .input(updateSentenceInput)
    .mutation(async ({ input, ctx }) => {
      const session = await requireAuthSession(ctx)
      const sentence = await db.query.userArticleSentences
        .findFirst({
          where: eq(userArticleSentences.id, input.sentenceId),
        })
        .execute()

      if (!sentence) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sentence not found" })
      }

      const article = await db.query.userArticles
        .findFirst({
          where: and(
            eq(userArticles.id, sentence.articleId),
            eq(userArticles.userId, session.user.id)
          ),
        })
        .execute()

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" })
      }

      const nextNative =
        input.nativeText !== undefined ? input.nativeText.trim() || null : sentence.nativeText
      const nextTarget =
        input.targetText !== undefined
          ? input.targetText.trim() || ""
          : sentence.targetText

      const changed =
        nextNative !== sentence.nativeText || nextTarget !== sentence.targetText

      await db
        .update(userArticleSentences)
        .set({
          nativeText: nextNative,
          targetText: nextTarget,
        })
        .where(eq(userArticleSentences.id, input.sentenceId))
        .run()

      if (changed) {
        await deleteSentenceTtsFiles({
          userId: session.user.id,
          sentenceId: input.sentenceId,
        })
      }

      return {
        sentenceId: input.sentenceId,
        nativeText: nextNative,
        targetText: nextTarget,
      }
    }),

  deleteSentence: publicProcedure
    .input(deleteSentenceInput)
    .mutation(async ({ input, ctx }) => {
      const session = await requireAuthSession(ctx)
      const sentence = await db.query.userArticleSentences
        .findFirst({
          where: eq(userArticleSentences.id, input.sentenceId),
        })
        .execute()

      if (!sentence) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sentence not found" })
      }

      const article = await db.query.userArticles
        .findFirst({
          where: and(
            eq(userArticles.id, sentence.articleId),
            eq(userArticles.userId, session.user.id)
          ),
        })
        .execute()

      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" })
      }

      await deleteSentenceTtsFiles({
        userId: session.user.id,
        sentenceId: input.sentenceId,
      })

      await db
        .delete(userArticleSentences)
        .where(eq(userArticleSentences.id, input.sentenceId))
        .run()

      return { ok: true }
    }),
})

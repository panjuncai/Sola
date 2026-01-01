import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import * as crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

import {
  db,
  publicTtsProviderConfig,
  ttsVoiceCatalog,
  userArticleSentenceTts,
  userArticleSentences,
  userArticles,
  userTtsProvider,
} from "@sola/db"
import { buildTtsCacheKey } from "@sola/shared"

import { requireAuthSession } from "../auth-session.js"
import { publicProcedure, router } from "../trpc.js"

const getSentenceAudioInput = z.object({
  sentenceId: z.string().min(1),
  role: z.enum(["native", "target"]),
  speed: z.number().min(0.1).max(2).optional(),
})

async function synthesizeAzureTts(params: {
  text: string
  voiceId: string
  apiUrl?: string | null
  apiKey?: string | null
  region?: string | null
  speed?: number
}) {
  const apiKey = params.apiKey
  if (!apiKey) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing Azure TTS api_key",
    })
  }
  const endpoint =
    params.apiUrl?.trim() ||
    (params.region
      ? `https://${params.region}.tts.speech.microsoft.com/cognitiveservices/v1`
      : "")

  if (!endpoint) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing Azure TTS endpoint",
    })
  }

  const speed = Number.isFinite(params.speed) ? Number(params.speed) : 1
  const ratePercent = Math.round((speed - 1) * 100)
  const rate = `${ratePercent >= 0 ? "+" : ""}${ratePercent}%`
  const ssml = `<speak version="1.0" xml:lang="en-US"><voice name="${params.voiceId}"><prosody rate="${rate}">${params.text}</prosody></voice></speak>`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Azure TTS error: ${response.status} ${text}`,
    })
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function resolvePublicTtsDir() {
  const cwd = process.cwd()
  const serverDir = cwd.endsWith(path.join("apps", "server"))
    ? cwd
    : path.join(cwd, "apps", "server")
  return path.join(serverDir, "public", "tts")
}

function resolveBaseUrl(ctx: { req: import("node:http").IncomingMessage }) {
  const host = ctx.req.headers.host ?? "localhost:6001"
  const forwardedProto = ctx.req.headers["x-forwarded-proto"]
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || "http"
  return `${proto}://${host}`
}

export const ttsRouter = router({
  getSentenceAudio: publicProcedure
    .input(getSentenceAudioInput)
    .mutation(async ({ ctx, input }) => {
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
          message: "No enabled Azure TTS provider",
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

      if (!userProvider) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User TTS provider not configured",
        })
      }

      const voiceCatalogId =
        input.role === "native" ? userProvider.ttsVoiceNative : userProvider.ttsVoiceTarget

      if (!voiceCatalogId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voice selection missing",
        })
      }

      const voice = await db.query.ttsVoiceCatalog
        .findFirst({
          where: and(
            eq(ttsVoiceCatalog.id, voiceCatalogId),
            eq(ttsVoiceCatalog.publicTtsProviderConfigId, provider.id)
          ),
        })
        .execute()

      if (!voice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voice not found",
        })
      }

      const text =
        input.role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""

      if (!text) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Text is empty",
        })
      }

      const speed = Number.isFinite(input.speed) ? Number(input.speed) : 1
      const languageCode =
        input.role === "native" ? article.nativeLanguage : article.targetLanguage
      const cacheKey = buildTtsCacheKey({
        userId: session.user.id,
        sentenceId: sentence.id,
        languageCode,
        providerType: provider.providerType,
        voiceId: voice.voiceId,
        region: provider.region ?? "",
        speed,
      })

      const cached = await db.query.userArticleSentenceTts
        .findFirst({
          where: and(
            eq(userArticleSentenceTts.userId, session.user.id),
            eq(userArticleSentenceTts.cacheKey, cacheKey)
          ),
        })
        .execute()

      const storageDir = process.env.SOLA_TTS_DIR ?? resolvePublicTtsDir()
      if (cached?.url) {
        const urlPath = cached.url
        const fileName = urlPath.split("/").pop()
        const filePath = fileName ? path.join(storageDir, fileName) : null
        if (filePath && fs.existsSync(filePath)) {
          const url = urlPath.startsWith("http")
            ? urlPath
            : `${resolveBaseUrl(ctx)}${urlPath}`
          return { url, cacheKey }
        }
      }

      const buffer = await synthesizeAzureTts({
        text,
        voiceId: voice.voiceId,
        apiUrl: provider.apiUrl,
        apiKey: provider.apiKey,
        region: provider.region,
        speed,
      })

      const fileName = `${crypto
        .createHash("sha1")
        .update(cacheKey)
        .digest("hex")}.mp3`
      const filePath = path.join(storageDir, fileName)
      fs.mkdirSync(storageDir, { recursive: true })
      fs.writeFileSync(filePath, buffer)
      const urlPath = `/tts/${fileName}`
      const url = `${resolveBaseUrl(ctx)}${urlPath}`

      await db
        .insert(userArticleSentenceTts)
        .values({
          userId: session.user.id,
          sentenceId: sentence.id,
          languageCode,
          providerType: provider.providerType,
          voiceId: voice.voiceId,
          region: provider.region ?? null,
          speed: speed?.toFixed(2) ?? "1.00",
          cacheKey,
          url: urlPath,
        })
        .run()

      return { url, cacheKey }
    }),
})

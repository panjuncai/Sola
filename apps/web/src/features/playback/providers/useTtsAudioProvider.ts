import * as React from "react"

import type { ArticleDetail, ArticleSentence } from "@sola/shared"

import { buildCacheKey } from "../utils/tts"
import { AudioPlayer } from "./audioPlayer"

type PlaybackSentence = Pick<ArticleSentence, "id" | "nativeText" | "targetText">

type VoiceOption = { id: string; voiceId: string }

type PlaybackDetail = {
  article: Pick<ArticleDetail, "nativeLanguage" | "targetLanguage">
}

type TtsOptions =
  | {
      providerType: string
      providerRegion?: string | null
      nativeOptions: VoiceOption[]
      targetOptions: VoiceOption[]
    }
  | undefined

type SentenceAudioMutation = {
  mutateAsync: (input: {
    sentenceId: string
    role: "native" | "target"
    speed?: number
  }) => Promise<{ cacheKey: string; url: string }>
}

type UseTtsAudioProviderParams = {
  userId: string | null
  apiBaseUrl: string
  detail: PlaybackDetail | null | undefined
  ttsOptions: TtsOptions
  nativeVoiceId: string | null
  targetVoiceId: string | null
  sentenceAudioMutation: SentenceAudioMutation
  onCacheCleared?: (() => void) | undefined
}

export const useTtsAudioProvider = ({
  userId,
  apiBaseUrl,
  detail,
  ttsOptions,
  nativeVoiceId,
  targetVoiceId,
  sentenceAudioMutation,
  onCacheCleared,
}: UseTtsAudioProviderParams) => {
  const audioPlayerRef = React.useRef(new AudioPlayer())
  const ttsCacheRef = React.useRef<Record<string, string>>({})

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("sola-tts-cache")
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>
        if (parsed && typeof parsed === "object") {
          ttsCacheRef.current = parsed
        }
      }
    } catch {
      ttsCacheRef.current = {}
    }
  }, [])

  const persistTtsCache = React.useCallback(() => {
    try {
      window.localStorage.setItem("sola-tts-cache", JSON.stringify(ttsCacheRef.current))
    } catch {
      // ignore quota errors
    }
  }, [])

  const getCachedAudioUrl = React.useCallback(
    (cacheKey: string) => {
      const cached = ttsCacheRef.current[cacheKey]
      if (!cached) return undefined
      if (cached.startsWith("/")) {
        const upgraded = `${apiBaseUrl}${cached}`
        ttsCacheRef.current[cacheKey] = upgraded
        persistTtsCache()
        return upgraded
      }
      return cached
    },
    [apiBaseUrl, persistTtsCache]
  )

  const setCachedAudioUrl = React.useCallback(
    (cacheKey: string, url: string) => {
      ttsCacheRef.current[cacheKey] = url
      persistTtsCache()
    },
    [persistTtsCache]
  )

  const clearTtsCache = React.useCallback(async () => {
    ttsCacheRef.current = {}
    try {
      window.localStorage.removeItem("sola-tts-cache")
    } catch {
      // ignore
    }
    if ("caches" in window) {
      try {
        await caches.delete("sola-tts-audio")
      } catch {
        // ignore
      }
    }
    onCacheCleared?.()
  }, [onCacheCleared])

  const clearSentenceCache = React.useCallback(
    async (sentenceId: string) => {
      const removedUrls: string[] = []
      for (const [key, url] of Object.entries(ttsCacheRef.current)) {
        if (key.includes(sentenceId) || url.includes(`sentenceId=${sentenceId}`)) {
          removedUrls.push(url)
          delete ttsCacheRef.current[key]
        }
      }
      persistTtsCache()

      if ("caches" in window) {
        try {
          const cache = await caches.open("sola-tts-audio")
          await Promise.all(removedUrls.map((url) => cache.delete(url)))
        } catch {
          // ignore
        }
      }
    },
    [persistTtsCache]
  )

  const resolveVoiceId = React.useCallback(
    (role: "native" | "target") => {
      if (!ttsOptions) return null
      const selectedId = role === "native" ? nativeVoiceId : targetVoiceId
      const options = role === "native" ? ttsOptions.nativeOptions : ttsOptions.targetOptions
      const match = options.find((voice) => voice.id === selectedId)
      return match?.voiceId ?? null
    },
    [nativeVoiceId, targetVoiceId, ttsOptions]
  )

  const buildLocalCacheKey = React.useCallback(
    (sentenceId: string, role: "native" | "target", speed?: number) => {
      if (!userId || !detail || !ttsOptions) return null
      const voiceId = resolveVoiceId(role)
      if (!voiceId) return null
      const languageCode =
        role === "native" ? detail.article.nativeLanguage : detail.article.targetLanguage
      return buildCacheKey({
        userId,
        sentenceId,
        languageCode,
        providerType: ttsOptions.providerType,
        voiceId,
        region: ttsOptions.providerRegion ?? "",
        speed: speed ?? 1,
      })
    },
    [detail, resolveVoiceId, ttsOptions, userId]
  )

  const stopAudioPlayback = React.useCallback(() => {
    audioPlayerRef.current.stop()
  }, [])

  const playAudioUrl = React.useCallback(async (url: string) => {
    let objectUrl: string | null = null
    if ("caches" in window) {
      try {
        const cache = await caches.open("sola-tts-audio")
        const cached = await cache.match(url)
        if (cached) {
          const blob = await cached.blob()
          objectUrl = URL.createObjectURL(blob)
        } else {
          try {
            const response = await fetch(url, { credentials: "include" })
            if (response.ok) {
              await cache.put(url, response.clone())
              const blob = await response.blob()
              objectUrl = URL.createObjectURL(blob)
            }
          } catch {
            objectUrl = null
          }
        }
      } catch {
        objectUrl = null
      }
    }

    const ok = await audioPlayerRef.current.play(objectUrl ?? url)
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
    return ok
  }, [])

  const requestSentenceAudio = React.useCallback(
    (input: { sentenceId: string; role: "native" | "target"; speed?: number }) =>
      sentenceAudioMutation.mutateAsync(input),
    [sentenceAudioMutation]
  )

  const playSentenceRole = React.useCallback(
    async (sentence: PlaybackSentence, role: "native" | "target", speed?: number) => {
      if (!sentence || !detail) return false
      const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
      if (!text.trim()) return false
      const cacheKey = buildLocalCacheKey(sentence.id, role, speed)
      if (!cacheKey) return false
      const cachedUrl = getCachedAudioUrl(cacheKey)
      if (cachedUrl) {
        return playAudioUrl(cachedUrl)
      }
      const payload =
        speed === undefined
          ? { sentenceId: sentence.id, role }
          : { sentenceId: sentence.id, role, speed }
      const result = await requestSentenceAudio(payload)
      if (result?.cacheKey && result?.url) {
        setCachedAudioUrl(result.cacheKey, result.url)
        return playAudioUrl(result.url)
      }
      return false
    },
    [
      buildLocalCacheKey,
      detail,
      getCachedAudioUrl,
      playAudioUrl,
      requestSentenceAudio,
      setCachedAudioUrl,
    ]
  )

  return {
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    clearTtsCache,
    clearSentenceCache,
    stopAudioPlayback,
    playAudioUrl,
    requestSentenceAudio,
    playSentenceRole,
  }
}

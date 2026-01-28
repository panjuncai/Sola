import * as React from "react"

import type { ArticleDetail, ArticleSentence } from "@sola/shared"

import { buildCacheKey } from "../../utils/tts"
import { usePlaybackActions, usePlaybackState } from "../../atoms/playback"

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

type UsePlaybackParams = {
  userId: string | null
  apiBaseUrl: string
  detail: PlaybackDetail | null | undefined
  ttsOptions: TtsOptions
  nativeVoiceId: string | null
  targetVoiceId: string | null
  sentenceAudioMutation: {
    mutateAsync: (input: {
      sentenceId: string
      role: "native" | "target"
      speed?: number
    }) => Promise<{ cacheKey: string; url: string }>
  }
  onCacheCleared?: () => void
}

const usePlaybackLogic = ({
  userId,
  apiBaseUrl,
  detail,
  ttsOptions,
  nativeVoiceId,
  targetVoiceId,
  sentenceAudioMutation,
  onCacheCleared,
}: UsePlaybackParams) => {
  const { setPlayingSentenceId, setPlayingRole, setPlayingSpeed } = usePlaybackActions()
  const { playingSentenceId } = usePlaybackState()
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }, [])

  const stopPlayback = React.useCallback(() => {
    stopAudioPlayback()
    setPlayingSentenceId(null)
    setPlayingRole(null)
    setPlayingSpeed(null)
  }, [setPlayingRole, setPlayingSentenceId, setPlayingSpeed, stopAudioPlayback])

  const clearPlaybackForSentence = React.useCallback(
    (sentenceId: string) => {
      if (playingSentenceId !== sentenceId) return
      setPlayingSentenceId(null)
      setPlayingRole(null)
      setPlayingSpeed(null)
    },
    [playingSentenceId, setPlayingRole, setPlayingSentenceId, setPlayingSpeed]
  )

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

    return new Promise<boolean>((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      let retried = false
      let started = false
      const play = (src: string) => {
        const audio = new Audio(src)
        audioRef.current = audio
        const cleanup = () => {
          audio.onended = null
          audio.onerror = null
          audio.onplay = null
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
            objectUrl = null
          }
        }
        const finalize = () => {
          cleanup()
          resolve(true)
        }
        const fail = () => {
          cleanup()
          if (started) {
            resolve(true)
            return
          }
          if (objectUrl && !retried) {
            retried = true
            play(url)
            return
          }
          resolve(false)
        }
        audio.onended = finalize
        audio.onerror = fail
        audio.onplay = () => {
          started = true
        }
        audio
          .play()
          .catch(() => {
            fail()
          })
      }
      play(objectUrl ?? url)
    })
  }, [])

  const playSentenceRole = React.useCallback(
    async (sentence: PlaybackSentence, role: "native" | "target", speed?: number) => {
      if (!sentence || !detail) return false
      const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
      if (!text.trim()) return false
      const cacheKey = buildLocalCacheKey(sentence.id, role, speed)
      if (!cacheKey) return false
      const cachedUrl = getCachedAudioUrl(cacheKey)
      if (cachedUrl) {
        const ok = await playAudioUrl(cachedUrl)
        return ok
      }
      const payload =
        speed === undefined
          ? { sentenceId: sentence.id, role }
          : { sentenceId: sentence.id, role, speed }
      const result = await sentenceAudioMutation.mutateAsync(payload)
      if (result?.cacheKey && result?.url) {
        setCachedAudioUrl(result.cacheKey, result.url)
        const ok = await playAudioUrl(result.url)
        return ok
      }
      return false
    },
    [
      buildLocalCacheKey,
      detail,
      getCachedAudioUrl,
      playAudioUrl,
      sentenceAudioMutation,
      setCachedAudioUrl,
    ]
  )

  return {
    playingSentenceId,
    stopPlayback,
    clearTtsCache,
    clearSentenceCache,
    clearPlaybackForSentence,
    playSentenceRole,
    getCachedAudioUrl,
    setCachedAudioUrl,
    buildLocalCacheKey,
  }
}

export const useInitPlayback = (params: UsePlaybackParams) => {
  const api = usePlaybackLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestPlaybackApi = api
  return api
}

export const usePlaybackRequired = () => {
  if (latestPlaybackApi) return latestPlaybackApi
  throw new Error("Playback API is not initialized.")
}

type PlaybackApi = ReturnType<typeof usePlaybackLogic>

let latestPlaybackApi: PlaybackApi | null = null

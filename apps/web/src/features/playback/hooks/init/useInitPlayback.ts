import * as React from "react"

import type { ArticleDetailResponse, TtsOptionsResponse } from "@sola/shared"

import { usePlaybackActions, usePlaybackState } from "../../atoms/playback"
import { useTtsAudioProvider } from "../../providers/useTtsAudioProvider"

type UsePlaybackParams = {
  userId: string | null
  apiBaseUrl: string
  detail: ArticleDetailResponse | null | undefined
  ttsOptions: TtsOptionsResponse | undefined
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
  const {
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    clearTtsCache,
    clearSentenceCache,
    stopAudioPlayback,
    playSentenceRole,
  } = useTtsAudioProvider({
    userId,
    apiBaseUrl,
    detail,
    ttsOptions,
    nativeVoiceId,
    targetVoiceId,
    sentenceAudioMutation,
    onCacheCleared,
  })

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

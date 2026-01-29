import * as React from "react"

import type { ArticleDetailResponse, TtsOptionsResponse } from "@sola/shared"

import { usePlaybackActions, usePlaybackState } from "../../atoms/playback"
import { useTtsAudioProvider } from "../../providers/useTtsAudioProvider"
import { WebAudioProvider } from "../../providers/WebAudioProvider"

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
  onPlayError?: () => void
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
  onPlayError,
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
    requestSentenceAudio,
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

  const playSentenceRoleSafe = React.useCallback(
    async (sentence: Parameters<typeof playSentenceRole>[0], role: "native" | "target", speed?: number) => {
      const ok = await playSentenceRole(sentence, role, speed)
      if (!ok) {
        onPlayError?.()
      }
      return ok
    },
    [onPlayError, playSentenceRole]
  )

  const [audioProvider, setAudioProvider] = React.useState(
    () =>
      new WebAudioProvider({
        userId,
        apiBaseUrl,
        detail,
        nativeVoiceId,
        targetVoiceId,
        providerType: ttsOptions?.providerType,
        providerRegion: ttsOptions?.providerRegion,
        sentenceAudioMutation,
        getCachedAudioUrl,
        setCachedAudioUrl,
      })
  )

  React.useEffect(() => {
    setAudioProvider(
      new WebAudioProvider({
      userId,
      apiBaseUrl,
      detail,
      nativeVoiceId,
      targetVoiceId,
      providerType: ttsOptions?.providerType,
      providerRegion: ttsOptions?.providerRegion,
      sentenceAudioMutation,
      getCachedAudioUrl,
      setCachedAudioUrl,
      })
    )
  }, [
    apiBaseUrl,
    detail,
    getCachedAudioUrl,
    nativeVoiceId,
    sentenceAudioMutation,
    setCachedAudioUrl,
    targetVoiceId,
    ttsOptions?.providerRegion,
    ttsOptions?.providerType,
    userId,
  ])

  return {
    playingSentenceId,
    stopPlayback,
    clearTtsCache,
    clearSentenceCache,
    clearPlaybackForSentence,
    playSentenceRole: playSentenceRoleSafe,
    getCachedAudioUrl,
    setCachedAudioUrl,
    buildLocalCacheKey,
    requestSentenceAudio,
    audioProvider,
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

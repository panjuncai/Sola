import * as React from "react"
import { useTranslation } from "react-i18next"

import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"
import { useArticleToolbarState, useInitArticleToolbar } from "@/features/playback"
import { useInitAiManagement } from "@/features/ai-management"
import {
  useInitClozePractice,
  useInitSentenceOperations,
  useSentenceSelectionActions,
  useSentenceSelectionState,
} from "@/features/articles"
import { useInitArticles } from "@/features/articles"
import { useSettingsView } from "@/features/articles"
import {
  useInitPlayback,
} from "@/features/playback"
import { useInitSettingsDialogs, useSettingsDialogs } from "@/features/articles"
import { useInitCardMode } from "@/features/card-mode"

function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}

export const useArticleListPageView = () => {
  const { t } = useTranslation()

  const articlesState = useInitArticles({ deriveTitle })
  const {
    detailQuery,
    activeArticleId,
    showCreate,
  } = articlesState
  const {
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    blurTarget,
    handleSetBlurTarget,
    nativeVoiceId,
    targetVoiceId,
    useAiUserKey,
    shadowingSpeeds,
  } = useSettingsView()
  const { isClozeEnabled, isRandomMode } = useArticleToolbarState()
  const { selectedSentenceId, selectedSentenceRole } = useSentenceSelectionState()
  const { setSelectedSentenceId, setSelectedSentenceRole } =
    useSentenceSelectionActions()
  const apiBaseUrl = React.useMemo(() => {
    const envBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
    if (envBase) return envBase
    if (import.meta.env.DEV) return "http://localhost:6001"
    return window.location.origin
  }, [])
  useInitSettingsDialogs({
    onDeleteAccountSuccess: () => {
      window.location.href = "/auth/login"
    },
  })
  const settingsDialogs = useSettingsDialogs()
  const {
    ttsOptionsQuery,
  } = settingsDialogs
  const userId = useAuthStore((state) => state.user?.id ?? null)
  useInitAiManagement({
    t,
    detail: detailQuery.data,
    useAiUserKey,
  })
  const sentenceAudioMutation = trpc.tts.getSentenceAudio.useMutation()

  const handlePlayError = React.useCallback(() => {
    toast.error(t("tts.audioPlayFailed"))
  }, [t])

  const playback = useInitPlayback({
    userId,
    apiBaseUrl,
    detail: detailQuery.data,
    ttsOptions: ttsOptionsQuery.data,
    nativeVoiceId,
    targetVoiceId,
    sentenceAudioMutation,
    onCacheCleared: () => toast.success(t("settings.cacheCleared")),
  })
  const {
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    playSentenceRole,
    stopPlayback,
    clearSentenceCache,
    clearPlaybackForSentence,
  } = playback

  const clearSentenceSelection = React.useCallback(
    (sentenceId: string) => {
      if (selectedSentenceId === sentenceId) {
        setSelectedSentenceId(null)
        setSelectedSentenceRole(null)
      }
      clearPlaybackForSentence(sentenceId)
    },
    [
      selectedSentenceId,
      setSelectedSentenceId,
      setSelectedSentenceRole,
      clearPlaybackForSentence,
    ]
  )

  const requestSentenceAudio = React.useCallback(
    (input: { sentenceId: string; role: "native" | "target" }) =>
      sentenceAudioMutation.mutateAsync(input),
    [sentenceAudioMutation]
  )

  const articleToolbar = useInitArticleToolbar({
    detail: detailQuery.data,
    activeArticleId,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    shadowingSpeeds,
    selectedSentenceId,
    selectedSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    playSentenceRole,
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    requestSentenceAudio,
    onPlayError: handlePlayError,
    onSelectSentenceRequired: () => toast.error(t("tts.selectSentenceFirst")),
    stopPlayback,
  })
  const { stopLoopPlayback } = articleToolbar
  useInitClozePractice({
    isClozeEnabled,
    blurTarget,
    setBlurTarget: handleSetBlurTarget,
    activeArticleId,
    detail: detailQuery.data,
    stopLoopPlayback,
    playSentenceRole,
    onPlayError: handlePlayError,
  })

  useInitCardMode({
    sentences: detailQuery.data?.sentences ?? [],
    displayOrderSetting,
    isRandomMode,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    playSentenceRole,
    onPlayError: handlePlayError,
  })

  useInitSentenceOperations({
    t,
    detail: detailQuery.data,
    stopLoopPlayback,
    clearSentenceSelection,
    clearSentenceCache,
  })

  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        stopLoopPlayback()
        stopPlayback()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [stopPlayback, stopLoopPlayback])

  React.useEffect(() => {
    stopLoopPlayback()
  }, [activeArticleId, showCreate, stopLoopPlayback])

  return {}
}

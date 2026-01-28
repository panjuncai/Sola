import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { ArticleEntity, deriveTitle } from "@sola/logic"
import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { useGlobalAuthState } from "@/features/auth"
import { useArticleToolbarState, useInitArticleToolbar } from "@/features/playback"
import { useInitAiManagement } from "@/features/ai-management"
import { useInitPlayback } from "@/features/playback"
import { useInitCardMode } from "@/features/card-mode"
import { useInitClozePractice } from "../init/useInitClozePractice"
import { useInitSentenceOperations } from "../init/useInitSentenceOperations"
import { useInitArticles } from "../init/useInitArticles"
import { useInitSettingsDialogs, useSettingsDialogs } from "../init/useInitSettingsDialogs"
import {
  useSentenceSelectionActions,
  useSentenceSelectionState,
} from "../state/useSentenceSelectionState"
import { useSettingsView } from "./useSettingsView"

export const useArticleListPageView = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { articleId: routeArticleId } = useParams<{ articleId?: string }>()
  const lastRouteAppliedRef = React.useRef<string | null>(null)
  const lastNavigatedRef = React.useRef<string | null>(null)

  const articlesState = useInitArticles({
    deriveTitle,
    routeArticleId: routeArticleId ?? null,
  })
  const {
    list,
    listQuery,
    detailQuery,
    activeArticleId,
    showCreate,
    setActiveArticleId,
    setIsCreating,
  } = articlesState
  const {
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    blurTarget,
    handleSetBlurTarget,
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
  const { ttsOptionsQuery } = settingsDialogs
  const nativeVoiceId = ttsOptionsQuery.data?.nativeVoiceId ?? null
  const targetVoiceId = ttsOptionsQuery.data?.targetVoiceId ?? null
  const { user } = useGlobalAuthState()
  const userId = user?.id ?? null
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
    const article = detailQuery.data?.article
    if (!article) return
    const title = new ArticleEntity({
      id: article.id,
      title: article.title,
      content: article.content,
      displayOrder: article.displayOrder,
    }).getTitle()
    document.title = title ?? "Sola"
  }, [detailQuery.data])

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

  const stopLoopPlaybackRef = React.useRef(stopLoopPlayback)
  React.useEffect(() => {
    stopLoopPlaybackRef.current = stopLoopPlayback
  }, [stopLoopPlayback])

  React.useEffect(() => {
    stopLoopPlaybackRef.current()
  }, [activeArticleId, showCreate])

  React.useEffect(() => {
    if (!routeArticleId) return
    if (routeArticleId === activeArticleId) return
    if (lastRouteAppliedRef.current === routeArticleId) return
    if (
      !listQuery.isFetching &&
      !listQuery.isLoading &&
      list.length > 0 &&
      !list.some((article) => article.id === routeArticleId)
    ) {
      return
    }
    lastRouteAppliedRef.current = routeArticleId
    setIsCreating(false)
    setActiveArticleId(routeArticleId)
  }, [
    activeArticleId,
    list,
    listQuery.isFetching,
    listQuery.isLoading,
    routeArticleId,
    setActiveArticleId,
    setIsCreating,
  ])

  React.useEffect(() => {
    if (showCreate) {
      if (routeArticleId) {
        navigate("/articles", { replace: true })
      }
      return
    }
    if (routeArticleId) return
    if (!activeArticleId) return
    if (routeArticleId === activeArticleId) return
    if (lastNavigatedRef.current === activeArticleId) return
    lastNavigatedRef.current = activeArticleId
    navigate(`/articles/${activeArticleId}`, { replace: true })
  }, [activeArticleId, navigate, routeArticleId, showCreate])

  React.useEffect(() => {
    if (!routeArticleId) return
    if (listQuery.isLoading || listQuery.isFetching) return
    if (list.length === 0) return
    if (list.some((article) => article.id === routeArticleId)) return
    setActiveArticleId(null)
    setIsCreating(true)
    navigate("/articles", { replace: true })
  }, [
    list,
    listQuery.isFetching,
    listQuery.isLoading,
    navigate,
    routeArticleId,
    setActiveArticleId,
    setIsCreating,
  ])

  return {}
}

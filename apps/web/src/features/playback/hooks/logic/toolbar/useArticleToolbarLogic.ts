import * as React from "react"

import { ArticleEntity, PlaybackEngine, PlaybackScheduler, buildRoleOrder } from "@sola/logic"
import type { AudioSourceProvider } from "@sola/logic"
import type { ArticleSentence } from "@sola/shared"

import {
  useArticleToolbarActions,
  useArticleToolbarState,
} from "../../../atoms/articleToolbar"
import { usePlaybackActions, usePlaybackState } from "../../../atoms/playback"
import { useCardModeActions } from "@/features/card-mode"

type ToolbarPlaybackSentence = Pick<ArticleSentence, "id" | "nativeText" | "targetText">

export type UseArticleToolbarParams = {
  detail:
    | {
        sentences: ToolbarPlaybackSentence[]
      }
    | null
    | undefined
  displayOrderSetting: "native_first" | "target_first"
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseSeconds: number
  shadowingSpeeds: number[]
  selectedSentenceId: string | null
  selectedSentenceRole: "native" | "target" | null
  setSelectedSentenceId: (id: string | null) => void
  setSelectedSentenceRole: (role: "native" | "target" | null) => void
  playSentenceRole: (
    sentence: ToolbarPlaybackSentence,
    role: "native" | "target",
    speed?: number
  ) => Promise<boolean>
  buildLocalCacheKey: (sentenceId: string, role: "native" | "target") => string | null
  getCachedAudioUrl: (cacheKey: string) => string | undefined
  setCachedAudioUrl: (cacheKey: string, url: string) => void
  requestSentenceAudio: (input: {
    sentenceId: string
    role: "native" | "target"
  }) => Promise<{ cacheKey: string; url: string }>
  onPlayError: () => void
  onSelectSentenceRequired: () => void
  stopPlayback: () => void
}

export const useArticleToolbarLogic = ({
  detail,
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
  onPlayError,
  onSelectSentenceRequired,
  stopPlayback,
}: UseArticleToolbarParams) => {
  const {
    isLoopingAll,
    isLoopingTarget,
    isLoopingSingle,
    isLoopingShadowing,
    isRandomMode,
    isClozeEnabled,
  } = useArticleToolbarState()
  const {
    setIsLoopingAll,
    setIsLoopingTarget,
    setIsLoopingSingle,
    setIsLoopingShadowing,
    setIsRandomMode,
    setIsClozeEnabled,
  } = useArticleToolbarActions()
  const { setIsCardMode } = useCardModeActions()
  const { setPlayingSentenceId, setPlayingRole, setPlayingSpeed } = usePlaybackActions()
  const { playingSentenceId, playingRole } = usePlaybackState()

  const firstRoleOverrideRef = React.useRef(false)

  const markUserSelected = React.useCallback(() => {
    // selection is tracked by state; no-op keeps API stable
  }, [])

  const playbackEngine = React.useMemo(
    () =>
      new PlaybackEngine(async (sentence, role, speed) =>
        playSentenceRole(sentence, role, speed)
      ),
    [playSentenceRole]
  )

  const getShadowingSpeeds = React.useCallback(
    (role: "native" | "target") => {
      if (role !== "target") return [1]
      if (!isLoopingShadowing) return [1]
      return shadowingSpeeds.length > 0 ? shadowingSpeeds : [1, 1, 1, 1]
    },
    [isLoopingShadowing, shadowingSpeeds]
  )

  const prefetchAudio = React.useCallback(
    (sentence: ToolbarPlaybackSentence, role: "native" | "target") => {
      const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
      if (!text) return
      const cacheKey = buildLocalCacheKey(sentence.id, role)
      if (cacheKey) {
        const cached = getCachedAudioUrl(cacheKey)
        if (cached) return
      }
      requestSentenceAudio({ sentenceId: sentence.id, role })
        .then((result) => {
          setCachedAudioUrl(result.cacheKey, result.url)
        })
        .catch(() => {})
    },
    [buildLocalCacheKey, getCachedAudioUrl, requestSentenceAudio, setCachedAudioUrl]
  )

  const audioProvider = React.useMemo<AudioSourceProvider>(
    () => ({
      prefetch: prefetchAudio,
    }),
    [prefetchAudio]
  )

  const scheduler = React.useMemo(
    () =>
      new PlaybackScheduler(playbackEngine, {
        pauseMs: Math.max(0, Math.round(playbackPauseSeconds * 1000)),
        repeats: {
          native: playbackNativeRepeat,
          target: playbackTargetRepeat,
        },
        getShadowingSpeeds,
        audioProvider,
        prefetchCount: 5,
      }),
    [
      audioProvider,
      getShadowingSpeeds,
      playbackEngine,
      playbackNativeRepeat,
      playbackPauseSeconds,
      playbackTargetRepeat,
    ]
  )

  React.useEffect(() => {
    scheduler.updateOptions({
      pauseMs: Math.max(0, Math.round(playbackPauseSeconds * 1000)),
      repeats: {
        native: playbackNativeRepeat,
        target: playbackTargetRepeat,
      },
      getShadowingSpeeds,
      audioProvider,
    })
  }, [
    audioProvider,
    getShadowingSpeeds,
    playbackNativeRepeat,
    playbackPauseSeconds,
    playbackTargetRepeat,
    scheduler,
  ])

  React.useEffect(() => {
    return scheduler.subscribe((snapshot) => {
      if (snapshot.status === "idle") {
        if (playingSentenceId !== null) setPlayingSentenceId(null)
        if (playingRole !== null) setPlayingRole(null)
        setPlayingSpeed(null)
      } else {
        if (snapshot.currentSentenceId !== playingSentenceId) {
          setPlayingSentenceId(snapshot.currentSentenceId)
        }
        if (snapshot.currentRole !== playingRole) {
          setPlayingRole(snapshot.currentRole)
        }
      }
      if (snapshot.currentSentenceId !== selectedSentenceId) {
        setSelectedSentenceId(snapshot.currentSentenceId)
      }
      if (snapshot.currentRole !== selectedSentenceRole) {
        setSelectedSentenceRole(snapshot.currentRole)
      }
    })
  }, [
    playingRole,
    playingSentenceId,
    scheduler,
    selectedSentenceId,
    selectedSentenceRole,
    setPlayingRole,
    setPlayingSentenceId,
    setPlayingSpeed,
    setSelectedSentenceId,
    setSelectedSentenceRole,
  ])

  const stopLoopPlayback = React.useCallback(() => {
    setIsLoopingAll(false)
    setIsLoopingTarget(false)
    setIsLoopingSingle(false)
    setIsLoopingShadowing(false)
    scheduler.stop()
    stopPlayback()
  }, [
    scheduler,
    setIsLoopingAll,
    setIsLoopingShadowing,
    setIsLoopingSingle,
    setIsLoopingTarget,
    stopPlayback,
  ])

  const startLoopAll = React.useCallback(() => {
    if (!detail) return
    stopLoopPlayback()
    const articleEntity = new ArticleEntity({
      id: "loop-all",
      displayOrder: displayOrderSetting,
    })
    if (!articleEntity.hasPlayableSentence(detail.sentences)) {
      onPlayError()
      return
    }
    const sentences = detail.sentences
    const startIndex =
      selectedSentenceId != null
        ? Math.max(0, sentences.findIndex((sentence) => sentence.id === selectedSentenceId))
        : 0
    const order = buildRoleOrder(displayOrderSetting)
    firstRoleOverrideRef.current = true
    scheduler.updateOptions({
      getRoleOrder: (_sentence, index, _total, baseOrder) => {
        if (
          firstRoleOverrideRef.current &&
          index === startIndex &&
          selectedSentenceRole
        ) {
          firstRoleOverrideRef.current = false
          return selectedSentenceRole === "target"
            ? ["target"]
            : [
                selectedSentenceRole,
                ...baseOrder.filter((role) => role !== selectedSentenceRole),
              ]
        }
        return baseOrder
      },
      getPrefetchRoles: (_sentence, _index, _total, baseOrder) => baseOrder,
    })
    scheduler.setMode("loop-all")
    scheduler.loadPlaylist(sentences, startIndex)
    scheduler.start(order)
    setIsLoopingAll(true)
  }, [
    detail,
    displayOrderSetting,
    onPlayError,
    scheduler,
    selectedSentenceId,
    selectedSentenceRole,
    setIsLoopingAll,
    stopLoopPlayback,
  ])

  const startLoopTarget = React.useCallback(() => {
    if (!detail) return
    stopLoopPlayback()
    const articleEntity = new ArticleEntity({
      id: "loop-target",
      displayOrder: "target_first",
    })
    if (!articleEntity.hasPlayableSentence(detail.sentences, "target")) {
      onPlayError()
      return
    }
    const sentences = detail.sentences
    const startIndex =
      selectedSentenceId != null
        ? Math.max(0, sentences.findIndex((sentence) => sentence.id === selectedSentenceId))
        : 0
    scheduler.updateOptions({
      getRoleOrder: () => ["target"],
      getPrefetchRoles: () => ["target"],
    })
    scheduler.setMode("loop-target")
    scheduler.loadPlaylist(sentences, startIndex)
    scheduler.start(["target"])
    setIsLoopingTarget(true)
  }, [detail, onPlayError, scheduler, selectedSentenceId, setIsLoopingTarget, stopLoopPlayback])

  const startLoopSingle = React.useCallback(() => {
    if (!detail || !selectedSentenceId || !selectedSentenceRole) {
      onSelectSentenceRequired()
      return
    }
    stopLoopPlayback()
    const articleEntity = new ArticleEntity({
      id: "loop-single",
      displayOrder: displayOrderSetting,
    })
    if (!articleEntity.hasPlayableSentence(detail.sentences, selectedSentenceRole)) {
      onPlayError()
      return
    }
    const sentence = detail.sentences.find((item) => item.id === selectedSentenceId)
    if (!sentence) return
    scheduler.updateOptions({
      getRoleOrder: () => [selectedSentenceRole],
      getPrefetchRoles: () => [selectedSentenceRole],
    })
    scheduler.playSingle(sentence, selectedSentenceRole, "single")
    setIsLoopingSingle(true)
  }, [
    detail,
    displayOrderSetting,
    onPlayError,
    onSelectSentenceRequired,
    scheduler,
    selectedSentenceId,
    selectedSentenceRole,
    setIsLoopingSingle,
    stopLoopPlayback,
  ])

  const handleToggleShadowing = React.useCallback(async () => {
    if (isLoopingShadowing) {
      setIsLoopingShadowing(false)
      if (!isLoopingAll && !isLoopingTarget && !isLoopingSingle) {
        stopLoopPlayback()
      }
      return
    }
    if (!detail) return
    if (isLoopingAll || isLoopingTarget || isLoopingSingle) {
      setIsLoopingShadowing(true)
      return
    }

    const sentences = detail.sentences
    if (sentences.length === 0) {
      setIsLoopingShadowing(false)
      return
    }
    const targetSentence =
      selectedSentenceId != null
        ? sentences.find((sentence) => sentence.id === selectedSentenceId)
        : sentences[0]
    if (!targetSentence) {
      setIsLoopingShadowing(false)
      return
    }
    const role =
      targetSentence.targetText && targetSentence.targetText.trim().length > 0
        ? "target"
        : (selectedSentenceRole ?? "target")
    setIsLoopingShadowing(true)
    scheduler.updateOptions({
      getRoleOrder: () => [role],
      getPrefetchRoles: () => [role],
    })
    scheduler.playSingle(targetSentence, role, "shadowing")
  }, [
    detail,
    isLoopingAll,
    isLoopingShadowing,
    isLoopingSingle,
    isLoopingTarget,
    scheduler,
    selectedSentenceId,
    selectedSentenceRole,
    setIsLoopingShadowing,
    stopLoopPlayback,
  ])

  const toggleRandomMode = React.useCallback(() => {
    setIsRandomMode((prev: boolean) => {
      const next = !prev
      setIsCardMode(next)
      return next
    })
  }, [setIsCardMode, setIsRandomMode])

  const handleToggleCardMode = React.useCallback(() => {
    setIsCardMode((prev: boolean) => !prev)
  }, [setIsCardMode])

  const toggleCloze = React.useCallback(() => {
    setIsClozeEnabled((prev: boolean) => !prev)
  }, [setIsClozeEnabled])

  return {
    isLoopingAll,
    isLoopingTarget,
    isLoopingSingle,
    isLoopingShadowing,
    isRandomMode,
    isClozeEnabled,
    setIsRandomMode,
    setIsClozeEnabled,
    toggleRandomMode,
    handleToggleCardMode,
    toggleCloze,
    stopLoopPlayback,
    startLoopAll,
    startLoopTarget,
    startLoopSingle,
    handleToggleShadowing,
    markUserSelected,
  }
}

export type ArticleToolbarApi = ReturnType<typeof useArticleToolbarLogic>

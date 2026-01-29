import * as React from "react"

import {
  ArticleEntity,
  PlaybackEngine,
  PlaybackScheduler,
  buildRoleOrder,
  type PlayRole,
} from "@sola/logic"
import type { AudioSourceProvider } from "@sola/logic"
import type { ArticleSentence } from "@sola/shared"

import {
  useArticleToolbarActions,
  useArticleToolbarState,
} from "../../../atoms/articleToolbar"
import { usePlaybackActions, usePlaybackState } from "../../../atoms/playback"
import { useCardModeActions } from "@/features/card-mode"

type ToolbarPlaybackSentence = Pick<ArticleSentence, "id" | "nativeText" | "targetText">

const noopPlayRole: PlayRole = async () => false
let playSentenceRoleLatest: PlayRole = noopPlayRole

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
  audioProvider: AudioSourceProvider
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
  audioProvider: injectedAudioProvider,
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


  const markUserSelected = React.useCallback(() => {
    // selection is tracked by state; no-op keeps API stable
  }, [])

  React.useEffect(() => {
    playSentenceRoleLatest = playSentenceRole
  }, [playSentenceRole])

  const playSentenceRoleProxy = React.useCallback<PlayRole>(
    (sentence, role, speed) => playSentenceRoleLatest(sentence, role, speed),
    []
  )

  const [playbackEngine] = React.useState(
    () => new PlaybackEngine(playSentenceRoleProxy)
  )

  const getShadowingSpeeds = React.useCallback(
    (role: "native" | "target") => {
      if (role !== "target") return [1]
      if (!isLoopingShadowing) return [1]
      return shadowingSpeeds.length > 0 ? shadowingSpeeds : [1, 1, 1, 1]
    },
    [isLoopingShadowing, shadowingSpeeds]
  )

  // prefetch is handled by injected provider (AudioSourceProvider)

  const [scheduler] = React.useState(
    () =>
      new PlaybackScheduler(playbackEngine, {
        pauseMs: Math.max(0, Math.round(playbackPauseSeconds * 1000)),
        repeats: {
          native: playbackNativeRepeat,
          target: playbackTargetRepeat,
        },
        getShadowingSpeeds,
        audioProvider: injectedAudioProvider,
        prefetchCount: 5,
        onError: onPlayError,
        errorPolicy: "stop",
      })
  )

  React.useEffect(() => {
    scheduler.updateOptions({
      pauseMs: Math.max(0, Math.round(playbackPauseSeconds * 1000)),
      repeats: {
        native: playbackNativeRepeat,
        target: playbackTargetRepeat,
      },
      getShadowingSpeeds,
      audioProvider: injectedAudioProvider,
      onError: onPlayError,
      errorPolicy: "stop",
    })
  }, [
    getShadowingSpeeds,
    injectedAudioProvider,
    onPlayError,
    playbackNativeRepeat,
    playbackPauseSeconds,
    playbackTargetRepeat,
    scheduler,
  ])

  React.useEffect(() => () => scheduler.stop(), [scheduler])

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

import * as React from "react"

import { PlaybackEngine, buildRoleOrder } from "@sola/logic"
import type { DisplayOrder } from "@sola/shared"

import {
  useArticleToolbarActions,
  useArticleToolbarState,
} from "../../../atoms/articleToolbar"
import { useCardModeActions } from "@/features/card-mode"

type ToolbarPlaybackSentence = {
  id: string
  nativeText: string | null
  targetText: string | null
}

type LoopTokenRef = React.MutableRefObject<number>
type ShadowingRef = React.MutableRefObject<boolean>
type UserSelectedRef = React.MutableRefObject<boolean>

type PlaybackHelpersParams = {
  playbackPauseSeconds: number
  shadowingSpeeds: number[]
  shadowingLoopRef: ShadowingRef
  loopTokenRef: LoopTokenRef
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
}

type LoopLogicParams = {
  detail:
    | {
        sentences: ToolbarPlaybackSentence[]
      }
    | null
    | undefined
  displayOrderSetting: DisplayOrder
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  selectedSentenceId: string | null
  selectedSentenceRole: "native" | "target" | null
  onPlayError: () => void
  onSelectSentenceRequired: () => void
  setIsLoopingAll: (value: boolean) => void
  setIsLoopingTarget: (value: boolean) => void
  setIsLoopingSingle: (value: boolean) => void
  setIsLoopingShadowing: (value: boolean) => void
  stopPlayback: () => void
  userSelectedRef: UserSelectedRef
  loopTokenRef: LoopTokenRef
  shadowingLoopRef: ShadowingRef
  prefetchAudio: (
    params: PlaybackHelpersParams,
    sentences: ToolbarPlaybackSentence[],
    startIndex: number,
    order: ("native" | "target")[]
  ) => void
  playbackHelpers: PlaybackHelpersParams
  playbackEngine: PlaybackEngine
  getShadowingSpeeds: (role: "native" | "target") => number[]
}

const stopLoopPlayback = (params: LoopLogicParams) => {
  const {
    loopTokenRef,
    shadowingLoopRef,
    setIsLoopingAll,
    setIsLoopingTarget,
    setIsLoopingSingle,
    setIsLoopingShadowing,
    stopPlayback,
  } = params
  loopTokenRef.current += 1
  setIsLoopingAll(false)
  setIsLoopingTarget(false)
  setIsLoopingSingle(false)
  setIsLoopingShadowing(false)
  shadowingLoopRef.current = false
  stopPlayback()
}

const startLoopAll = async (params: LoopLogicParams) => {
  const {
    detail,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    selectedSentenceId,
    selectedSentenceRole,
    onPlayError,
    setIsLoopingAll,
    userSelectedRef,
    loopTokenRef,
    prefetchAudio,
    playbackHelpers,
    playbackEngine,
    getShadowingSpeeds,
  } = params
  if (!detail) return
  stopLoopPlayback(params)
  const token = loopTokenRef.current + 1
  loopTokenRef.current = token
  setIsLoopingAll(true)

  const sentences = detail.sentences
  const initialStartIndex =
    userSelectedRef.current && selectedSentenceId != null
      ? Math.max(0, sentences.findIndex((sentence) => sentence.id === selectedSentenceId))
      : 0
  const orderSetting = displayOrderSetting ?? "native_first"
  let startIndex = initialStartIndex

  while (loopTokenRef.current === token) {
    for (let sIndex = startIndex; sIndex < sentences.length; sIndex += 1) {
      const sentence = sentences[sIndex]
      if (!sentence) continue
      if (loopTokenRef.current !== token) break
      const order = buildRoleOrder(orderSetting)
      const isFirstSentence = sIndex === startIndex
      const orderedRoles: Array<"native" | "target"> =
        userSelectedRef.current && isFirstSentence && selectedSentenceRole
          ? selectedSentenceRole === "target"
            ? ["target"]
            : [
                selectedSentenceRole,
                ...order.filter((role) => role !== selectedSentenceRole),
              ]
          : order

      const ok = await playbackEngine.playSentence(
        sentence,
        orderedRoles,
        {
          native: playbackNativeRepeat,
          target: playbackTargetRepeat,
        },
        {
          pauseMs: Math.max(0, Math.round(playbackHelpers.playbackPauseSeconds * 1000)),
          shadowingSpeeds: playbackHelpers.shadowingSpeeds,
          getShadowingSpeeds,
          shouldStop: () => loopTokenRef.current !== token,
        }
      )
      if (!ok) {
        stopLoopPlayback(params)
        onPlayError()
        return
      }
      prefetchAudio(playbackHelpers, sentences, sIndex, order)
    }
    startIndex = 0
  }
}

const startLoopTarget = async (params: LoopLogicParams) => {
  const {
    detail,
    playbackTargetRepeat,
    selectedSentenceId,
    onPlayError,
    setIsLoopingTarget,
    userSelectedRef,
    loopTokenRef,
    prefetchAudio,
    playbackHelpers,
    playbackEngine,
    getShadowingSpeeds,
  } = params
  if (!detail) return
  stopLoopPlayback(params)
  const token = loopTokenRef.current + 1
  loopTokenRef.current = token
  setIsLoopingTarget(true)

  const sentences = detail.sentences
  const initialStartIndex =
    userSelectedRef.current && selectedSentenceId != null
      ? Math.max(0, sentences.findIndex((sentence) => sentence.id === selectedSentenceId))
      : 0
  let startIndex = initialStartIndex
  while (loopTokenRef.current === token) {
    for (let sIndex = startIndex; sIndex < sentences.length; sIndex += 1) {
      const sentence = sentences[sIndex]
      if (!sentence) continue
      if (loopTokenRef.current !== token) break
      const text = sentence.targetText ?? ""
      if (!text) continue

      const ok = await playbackEngine.playSentence(
        sentence,
        ["target"],
        {
          native: playbackTargetRepeat,
          target: playbackTargetRepeat,
        },
        {
          pauseMs: Math.max(0, Math.round(playbackHelpers.playbackPauseSeconds * 1000)),
          shadowingSpeeds: playbackHelpers.shadowingSpeeds,
          getShadowingSpeeds,
          shouldStop: () => loopTokenRef.current !== token,
        }
      )
      if (!ok) {
        stopLoopPlayback(params)
        onPlayError()
        return
      }

      prefetchAudio(playbackHelpers, sentences, sIndex, ["target"])
    }
    startIndex = 0
  }
}

const startLoopSingle = async (params: LoopLogicParams) => {
  const {
    detail,
    playbackNativeRepeat,
    playbackTargetRepeat,
    selectedSentenceId,
    selectedSentenceRole,
    onPlayError,
    onSelectSentenceRequired,
    setIsLoopingSingle,
    loopTokenRef,
    playbackHelpers,
    playbackEngine,
    getShadowingSpeeds,
  } = params
  if (!detail || !selectedSentenceId || !selectedSentenceRole) {
    onSelectSentenceRequired()
    return
  }
  stopLoopPlayback(params)
  const token = loopTokenRef.current + 1
  loopTokenRef.current = token
  setIsLoopingSingle(true)

  const sentence = detail.sentences.find((item) => item.id === selectedSentenceId)
  if (!sentence) {
    stopLoopPlayback(params)
    return
  }

  const repeatTimes =
    selectedSentenceRole === "native" ? playbackNativeRepeat : playbackTargetRepeat

  while (loopTokenRef.current === token) {
    const ok = await playbackEngine.playSentence(
      sentence,
      [selectedSentenceRole],
      {
        native: repeatTimes,
        target: repeatTimes,
      },
      {
        pauseMs: Math.max(0, Math.round(playbackHelpers.playbackPauseSeconds * 1000)),
        shadowingSpeeds: playbackHelpers.shadowingSpeeds,
        getShadowingSpeeds,
        shouldStop: () => loopTokenRef.current !== token,
      }
    )
    if (!ok) {
      stopLoopPlayback(params)
      onPlayError()
      return
    }
  }
}

export type UseArticleToolbarParams = {
  detail:
    | {
        sentences: ToolbarPlaybackSentence[]
      }
    | null
    | undefined
  displayOrderSetting: DisplayOrder
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseSeconds: number
  activeArticleId: string | null
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
  activeArticleId,
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
  const loopTokenRef = React.useRef(0)
  const shadowingLoopRef = React.useRef(false)
  const userSelectedRef = React.useRef(false)

  React.useEffect(() => {
    shadowingLoopRef.current = isLoopingShadowing
  }, [isLoopingShadowing])

  React.useEffect(() => {
    userSelectedRef.current = false
  }, [activeArticleId])

  const markUserSelected = React.useCallback(() => {
    userSelectedRef.current = true
  }, [])

  const playbackHelpers = React.useMemo(
    () => ({
      playbackPauseSeconds,
      shadowingSpeeds,
      shadowingLoopRef,
      loopTokenRef,
      setSelectedSentenceId,
      setSelectedSentenceRole,
      playSentenceRole,
      buildLocalCacheKey,
      getCachedAudioUrl,
      setCachedAudioUrl,
      requestSentenceAudio,
    }),
    [
      playbackPauseSeconds,
      shadowingSpeeds,
      shadowingLoopRef,
      loopTokenRef,
      setSelectedSentenceId,
      setSelectedSentenceRole,
      playSentenceRole,
      buildLocalCacheKey,
      getCachedAudioUrl,
      setCachedAudioUrl,
      requestSentenceAudio,
    ]
  )

  const playbackEngine = React.useMemo(
    () =>
      new PlaybackEngine(async (sentence, role, speed) => {
        setSelectedSentenceId(sentence.id)
        setSelectedSentenceRole(role)
        return playSentenceRole(sentence, role, speed)
      }),
    [playSentenceRole, setSelectedSentenceId, setSelectedSentenceRole]
  )

  const getShadowingSpeeds = React.useCallback(
    (role: "native" | "target") => {
      if (role !== "target") return [1]
      if (!shadowingLoopRef.current) return [1]
      return shadowingSpeeds.length > 0 ? shadowingSpeeds : [1, 1, 1, 1]
    },
    [shadowingSpeeds]
  )

  const prefetchAudio = React.useCallback(
    (
      params: PlaybackHelpersParams,
      sentences: ToolbarPlaybackSentence[],
      startIndex: number,
      order: ("native" | "target")[]
    ) => {
      const {
        buildLocalCacheKey,
        getCachedAudioUrl,
        requestSentenceAudio,
        setCachedAudioUrl,
      } = params
      const upcoming = sentences.slice(startIndex + 1, startIndex + 6)
      for (const next of upcoming) {
        for (const role of order) {
          const text =
            role === "native" ? next.nativeText ?? "" : next.targetText ?? ""
          if (!text) continue
          const localKey = buildLocalCacheKey(next.id, role)
          if (localKey) {
            const cached = getCachedAudioUrl(localKey)
            if (cached) continue
          }
          requestSentenceAudio({ sentenceId: next.id, role })
            .then((result) => {
              setCachedAudioUrl(result.cacheKey, result.url)
            })
            .catch(() => {})
        }
      }
    },
    []
  )

  const loopParams = React.useMemo(
    () => ({
      detail,
      displayOrderSetting,
      playbackNativeRepeat,
      playbackTargetRepeat,
      selectedSentenceId,
      selectedSentenceRole,
      onPlayError,
      onSelectSentenceRequired,
      setIsLoopingAll,
      setIsLoopingTarget,
      setIsLoopingSingle,
      setIsLoopingShadowing,
      stopPlayback,
      userSelectedRef,
      loopTokenRef,
      shadowingLoopRef,
      prefetchAudio,
      playbackHelpers,
      playbackEngine,
      getShadowingSpeeds,
    }),
    [
      detail,
      displayOrderSetting,
      playbackNativeRepeat,
      playbackTargetRepeat,
      selectedSentenceId,
      selectedSentenceRole,
      onPlayError,
      onSelectSentenceRequired,
      setIsLoopingAll,
      setIsLoopingTarget,
      setIsLoopingSingle,
      setIsLoopingShadowing,
      stopPlayback,
      userSelectedRef,
      loopTokenRef,
      shadowingLoopRef,
      prefetchAudio,
      playbackHelpers,
      playbackEngine,
      getShadowingSpeeds,
    ]
  )

  const stopLoopPlaybackAction = React.useCallback(
    () => stopLoopPlayback(loopParams),
    [loopParams]
  )
  const startLoopAllAction = React.useCallback(
    () => startLoopAll(loopParams),
    [loopParams]
  )
  const startLoopTargetAction = React.useCallback(
    () => startLoopTarget(loopParams),
    [loopParams]
  )
  const startLoopSingleAction = React.useCallback(
    () => startLoopSingle(loopParams),
    [loopParams]
  )

  const handleToggleShadowing = React.useCallback(async () => {
    if (isLoopingShadowing) {
      setIsLoopingShadowing(false)
      if (!isLoopingAll && !isLoopingTarget && !isLoopingSingle) {
        stopLoopPlayback(loopParams)
      }
      return
    }
    if (!detail) return
    if (isLoopingAll || isLoopingTarget || isLoopingSingle) {
      setIsLoopingShadowing((prev: boolean) => !prev)
      return
    }
    stopLoopPlayback(loopParams)
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingShadowing(true)
    shadowingLoopRef.current = true

    const sentences = detail.sentences
    if (sentences.length === 0) {
      setIsLoopingShadowing(false)
      shadowingLoopRef.current = false
      return
    }
    const targetSentence =
      selectedSentenceId != null
        ? sentences.find((sentence) => sentence.id === selectedSentenceId)
        : sentences[0]
    if (!targetSentence) {
      setIsLoopingShadowing(false)
      shadowingLoopRef.current = false
      return
    }
    const role =
      targetSentence.targetText && targetSentence.targetText.trim().length > 0
        ? "target"
        : (selectedSentenceRole ?? "target")
    if (selectedSentenceId == null) {
      setSelectedSentenceId(targetSentence.id)
      setSelectedSentenceRole(role)
    }
    const ok = await playbackEngine.playSentence(
      targetSentence,
      [role],
      {
        native: 1,
        target: 1,
      },
      {
        pauseMs: Math.max(0, Math.round(playbackHelpers.playbackPauseSeconds * 1000)),
        shadowingSpeeds: playbackHelpers.shadowingSpeeds,
        getShadowingSpeeds,
        shouldStop: () => loopTokenRef.current !== token,
      }
    )
    if (!ok) {
      stopLoopPlayback(loopParams)
      onPlayError()
      return
    }
    if (loopTokenRef.current === token) {
      setIsLoopingShadowing(false)
      shadowingLoopRef.current = false
    }
  }, [
    detail,
    isLoopingAll,
    isLoopingTarget,
    isLoopingSingle,
    isLoopingShadowing,
    selectedSentenceId,
    selectedSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    setIsLoopingShadowing,
    onPlayError,
    playbackHelpers,
    playbackEngine,
    getShadowingSpeeds,
    loopParams,
    loopTokenRef,
    shadowingLoopRef,
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
    stopLoopPlayback: stopLoopPlaybackAction,
    startLoopAll: startLoopAllAction,
    startLoopTarget: startLoopTargetAction,
    startLoopSingle: startLoopSingleAction,
    handleToggleShadowing,
    markUserSelected,
  }
}

export type ArticleToolbarApi = ReturnType<typeof useArticleToolbarLogic>

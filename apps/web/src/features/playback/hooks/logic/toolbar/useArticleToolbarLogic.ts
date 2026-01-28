import * as React from "react"

import {
  useArticleToolbarActions,
  useArticleToolbarState,
} from "../../../atoms/articleToolbar"
import { useCardModeActions } from "@/features/card-mode"
import type { DisplayOrder } from "@sola/shared"

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
  playWithShadowing: (
    params: PlaybackHelpersParams,
    sentence: ToolbarPlaybackSentence,
    role: "native" | "target",
    repeatTimes: number,
    token?: number
  ) => Promise<boolean>
  prefetchAudio: (
    params: PlaybackHelpersParams,
    sentences: ToolbarPlaybackSentence[],
    startIndex: number,
    order: ("native" | "target")[]
  ) => void
  playbackHelpers: PlaybackHelpersParams
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
    playWithShadowing,
    prefetchAudio,
    playbackHelpers,
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
      const order: Array<"native" | "target"> =
        orderSetting === "native_first"
          ? ["native", "target"]
          : ["target", "native"]
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

      for (const role of orderedRoles) {
        if (loopTokenRef.current !== token) break
        const text =
          role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
        if (!text) continue

        const repeatTimes =
          role === "native" ? playbackNativeRepeat : playbackTargetRepeat
        const ok = await playWithShadowing(
          playbackHelpers,
          sentence,
          role,
          repeatTimes,
          token
        )
        if (!ok) {
          stopLoopPlayback(params)
          onPlayError()
          return
        }
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
    playWithShadowing,
    prefetchAudio,
    playbackHelpers,
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

      const ok = await playWithShadowing(
        playbackHelpers,
        sentence,
        "target",
        playbackTargetRepeat,
        token
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
    playWithShadowing,
    playbackHelpers,
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
    const ok = await playWithShadowing(
      playbackHelpers,
      sentence,
      selectedSentenceRole,
      repeatTimes,
      token
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
  const waitMs = React.useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        if (!ms) return resolve()
        setTimeout(resolve, ms)
      }),
    []
  )

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

  const playWithShadowing = React.useCallback(
    async (
      params: PlaybackHelpersParams,
      sentence: ToolbarPlaybackSentence,
      role: "native" | "target",
      repeatTimes: number,
      token?: number
    ) => {
      const {
        playbackPauseSeconds: pauseSeconds,
        shadowingSpeeds: speedsInput,
        shadowingLoopRef: shadowingRef,
        loopTokenRef: tokenRef,
        setSelectedSentenceId: setId,
        setSelectedSentenceRole: setRole,
        playSentenceRole: playRole,
      } = params
      const pauseMs = Math.max(0, Math.round(pauseSeconds * 1000))
      const speeds =
        shadowingRef.current && role === "target"
          ? speedsInput.length > 0
            ? speedsInput
            : [1, 1, 1, 1]
          : [1]
      for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
        for (const speed of speeds) {
          if (token && tokenRef.current !== token) return false
          setId(sentence.id)
          setRole(role)
          const ok = await playRole(
            sentence,
            role,
            shadowingRef.current && role === "target" ? speed : undefined
          )
          if (!ok) return false
          if (pauseMs > 0) {
            await waitMs(pauseMs)
          }
        }
      }
      return true
    },
    [waitMs]
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
      playWithShadowing,
      prefetchAudio,
      playbackHelpers,
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
      playWithShadowing,
      prefetchAudio,
      playbackHelpers,
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
    const ok = await playWithShadowing(playbackHelpers, targetSentence, role, 1, token)
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
    playWithShadowing,
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

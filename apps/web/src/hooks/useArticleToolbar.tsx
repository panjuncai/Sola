import * as React from "react"

import {
  useArticleToolbarActions,
  useArticleToolbarApi,
  useArticleToolbarState,
  useSetArticleToolbarApi,
} from "@/atoms/articleToolbar"
import { useCardModeActions } from "@/atoms/cardMode"

type PlaybackSentence = {
  id: string
  nativeText: string | null
  targetText: string | null
}

type UseArticleToolbarParams = {
  detail:
    | {
        sentences: PlaybackSentence[]
      }
    | null
    | undefined
  displayOrderSetting: "native_first" | "target_first"
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
    sentence: PlaybackSentence,
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
  onStopAudio: () => void
}

const useArticleToolbarLogic = ({
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
  onStopAudio,
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

  const stopLoopPlayback = React.useCallback(() => {
    loopTokenRef.current += 1
    setIsLoopingAll(false)
    setIsLoopingTarget(false)
    setIsLoopingSingle(false)
    setIsLoopingShadowing(false)
    shadowingLoopRef.current = false
    onStopAudio()
  }, [onStopAudio])

  const waitMs = React.useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        if (!ms) return resolve()
        setTimeout(resolve, ms)
      }),
    []
  )

  const playWithShadowing = React.useCallback(
    async (
      sentence: PlaybackSentence,
      role: "native" | "target",
      repeatTimes: number,
      token?: number
    ) => {
      const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))
      const speeds =
        shadowingLoopRef.current && role === "target"
          ? shadowingSpeeds.length > 0
            ? shadowingSpeeds
            : [1, 1, 1, 1]
          : [1]
      for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
        for (const speed of speeds) {
          if (token && loopTokenRef.current !== token) return false
          setSelectedSentenceId(sentence.id)
          setSelectedSentenceRole(role)
          const ok = await playSentenceRole(
            sentence,
            role,
            shadowingLoopRef.current && role === "target" ? speed : undefined
          )
          if (!ok) return false
          if (pauseMs > 0) {
            await waitMs(pauseMs)
          }
        }
      }
      return true
    },
    [
      playbackPauseSeconds,
      playSentenceRole,
      setSelectedSentenceId,
      setSelectedSentenceRole,
      shadowingSpeeds,
      waitMs,
    ]
  )

  const prefetchAudio = React.useCallback(
    (sentences: PlaybackSentence[], startIndex: number, order: ("native" | "target")[]) => {
      const upcoming = sentences.slice(startIndex + 1, startIndex + 6)
      for (const next of upcoming) {
        for (const role of order) {
          const text = role === "native" ? next.nativeText ?? "" : next.targetText ?? ""
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
    [buildLocalCacheKey, getCachedAudioUrl, requestSentenceAudio, setCachedAudioUrl]
  )

  const startLoopAll = React.useCallback(async () => {
    if (!detail) return
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingAll(true)

    const sentences = detail.sentences
    const startIndex =
      userSelectedRef.current && selectedSentenceId != null
        ? Math.max(
            0,
            sentences.findIndex((sentence) => sentence.id === selectedSentenceId)
          )
        : 0
    const orderSetting = displayOrderSetting ?? "native_first"

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
            ? [
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
          const ok = await playWithShadowing(sentence, role, repeatTimes, token)
          if (!ok) {
            stopLoopPlayback()
            onPlayError()
            return
          }
        }
        prefetchAudio(sentences, sIndex, order)
      }
    }
  }, [
    detail,
    displayOrderSetting,
    onPlayError,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playWithShadowing,
    prefetchAudio,
    selectedSentenceId,
    selectedSentenceRole,
    stopLoopPlayback,
  ])

  const startLoopTarget = React.useCallback(async () => {
    if (!detail) return
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingTarget(true)

    const sentences = detail.sentences
    const startIndex =
      userSelectedRef.current && selectedSentenceId != null
        ? Math.max(
            0,
            sentences.findIndex((sentence) => sentence.id === selectedSentenceId)
          )
        : 0
    while (loopTokenRef.current === token) {
      for (let sIndex = startIndex; sIndex < sentences.length; sIndex += 1) {
        const sentence = sentences[sIndex]
        if (!sentence) continue
        if (loopTokenRef.current !== token) break
        const isFirstSentence = sIndex === startIndex
        const shouldPlaySelectedFirst =
          isFirstSentence &&
          userSelectedRef.current &&
          selectedSentenceRole === "native" &&
          sentence.nativeText &&
          sentence.nativeText.trim().length > 0
        const text = sentence.targetText ?? ""
        if (!text) continue

        if (shouldPlaySelectedFirst) {
          const ok = await playWithShadowing(
            sentence,
            "native",
            playbackNativeRepeat,
            token
          )
          if (!ok) {
            stopLoopPlayback()
            onPlayError()
            return
          }
        }

        const ok = await playWithShadowing(
          sentence,
          "target",
          playbackTargetRepeat,
          token
        )
        if (!ok) {
          stopLoopPlayback()
          onPlayError()
          return
        }

        prefetchAudio(sentences, sIndex, ["target"])
      }
    }
  }, [
    detail,
    onPlayError,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playWithShadowing,
    prefetchAudio,
    selectedSentenceId,
    selectedSentenceRole,
    stopLoopPlayback,
  ])

  const startLoopSingle = React.useCallback(async () => {
    if (!detail || !selectedSentenceId || !selectedSentenceRole) {
      onSelectSentenceRequired()
      return
    }
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingSingle(true)

    const sentence = detail.sentences.find(
      (item) => item.id === selectedSentenceId
    )
    if (!sentence) {
      stopLoopPlayback()
      return
    }

    const repeatTimes =
      selectedSentenceRole === "native" ? playbackNativeRepeat : playbackTargetRepeat

    while (loopTokenRef.current === token) {
      const ok = await playWithShadowing(
        sentence,
        selectedSentenceRole,
        repeatTimes,
        token
      )
      if (!ok) {
        stopLoopPlayback()
        onPlayError()
        return
      }
    }
  }, [
    detail,
    onPlayError,
    onSelectSentenceRequired,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playWithShadowing,
    selectedSentenceId,
    selectedSentenceRole,
    stopLoopPlayback,
  ])

  const startLoopShadowing = React.useCallback(async () => {
    if (!detail) return
    if (isLoopingAll || isLoopingTarget || isLoopingSingle) {
      setIsLoopingShadowing((prev) => !prev)
      return
    }
    stopLoopPlayback()
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
    const ok = await playWithShadowing(targetSentence, role, 1, token)
    if (!ok) {
      stopLoopPlayback()
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
    isLoopingSingle,
    isLoopingTarget,
    onPlayError,
    playWithShadowing,
    selectedSentenceId,
    selectedSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    stopLoopPlayback,
  ])

  const handleToggleShadowing = React.useCallback(() => {
    if (isLoopingShadowing) {
      setIsLoopingShadowing(false)
      if (!isLoopingAll && !isLoopingTarget && !isLoopingSingle) {
        stopLoopPlayback()
      }
    } else {
      startLoopShadowing()
    }
  }, [
    isLoopingAll,
    isLoopingShadowing,
    isLoopingSingle,
    isLoopingTarget,
    startLoopShadowing,
    stopLoopPlayback,
  ])

  const toggleRandomMode = React.useCallback(() => {
    setIsRandomMode((prev) => {
      const next = !prev
      setIsCardMode(next)
      return next
    })
  }, [setIsCardMode, setIsRandomMode])

  const toggleCloze = React.useCallback(() => {
    setIsClozeEnabled((prev) => !prev)
  }, [])

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
    toggleCloze,
    stopLoopPlayback,
    startLoopAll,
    startLoopTarget,
    startLoopSingle,
    handleToggleShadowing,
    markUserSelected,
  }
}

type ArticleToolbarApi = ReturnType<typeof useArticleToolbarLogic>

let latestArticleToolbarApi: ArticleToolbarApi | null = null

export const useArticleToolbar = (params?: UseArticleToolbarParams) => {
  const setApi = useSetArticleToolbarApi()
  const storedApi = useArticleToolbarApi()
  const fallbackState = useArticleToolbarState()
  const noop = React.useCallback(() => {}, [])
  const noopAsync = React.useCallback(async () => {}, [])
  if (!params) {
    if (latestArticleToolbarApi) return latestArticleToolbarApi
    if (storedApi) return storedApi
    return {
      ...fallbackState,
      setIsRandomMode: noop,
      setIsClozeEnabled: noop,
      toggleRandomMode: noop,
      toggleCloze: noop,
      stopLoopPlayback: noop,
      startLoopAll: noopAsync,
      startLoopTarget: noopAsync,
      startLoopSingle: noopAsync,
      handleToggleShadowing: noop,
      markUserSelected: noop,
    }
  }
  const api = useArticleToolbarLogic(params)
  latestArticleToolbarApi = api
  React.useEffect(() => {
    setApi(api)
  }, [api, setApi])
  return api
}

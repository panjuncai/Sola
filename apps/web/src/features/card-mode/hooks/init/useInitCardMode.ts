import * as React from "react"
import type { DisplayOrder } from "@sola/shared"

import { useCardModeActions, useCardModeState } from "../../atoms/cardMode"

type CardSentence = {
  id: string
  nativeText: string | null
  targetText: string | null
}

type UseCardModeParams = {
  sentences: CardSentence[]
  displayOrderSetting: DisplayOrder
  isRandomMode: boolean
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseSeconds: number
  playSentenceRole: (sentence: CardSentence, role: "native" | "target") => Promise<boolean>
  onPlayError: () => void
}

const useCardModeLogic = ({
  sentences,
  displayOrderSetting,
  isRandomMode,
  playbackNativeRepeat,
  playbackTargetRepeat,
  playbackPauseSeconds,
  playSentenceRole,
  onPlayError,
}: UseCardModeParams) => {
  const { isCardMode, cardIndex, cardFlipped, cardDragX, cardDragging } =
    useCardModeState()
  const { setIsCardMode, setCardIndex, setCardFlipped, setCardDragX, setCardDragging } =
    useCardModeActions()

  const cardPointerRef = React.useRef<{ id: number | null; x: number }>({
    id: null,
    x: 0,
  })
  const cardDragMovedRef = React.useRef(false)
  const cardPlayTokenRef = React.useRef(0)

  const cardSentences = React.useMemo(
    () =>
      sentences.filter(
        (sentence) =>
          Boolean(sentence.targetText?.trim()) || Boolean(sentence.nativeText?.trim())
      ),
    [sentences]
  )

  const cardFrontRole: "native" | "target" =
    displayOrderSetting === "native_first" ? "native" : "target"
  const cardBackRole: "native" | "target" =
    cardFrontRole === "native" ? "target" : "native"

  React.useEffect(() => {
    if (isRandomMode && !isCardMode) {
      setIsCardMode(true)
    }
    if (!isRandomMode && isCardMode) {
      setIsCardMode(false)
    }
  }, [isCardMode, isRandomMode, setIsCardMode])

  React.useEffect(() => {
    if (!isCardMode) return
    setCardIndex(0)
    setCardFlipped(false)
    setCardDragX(0)
    setCardDragging(false)
  }, [isCardMode, setCardDragX, setCardDragging, setCardFlipped, setCardIndex])

  React.useEffect(() => {
    if (!isCardMode) return
    setCardIndex(0)
    setCardFlipped(false)
  }, [isCardMode, cardSentences.length, setCardFlipped, setCardIndex])

  const cardCount = cardSentences.length
  const activeCardSentence = cardSentences[cardIndex]

  React.useEffect(() => {
    if (!isCardMode) return
    if (cardCount === 0) return
    if (cardIndex < cardCount) return
    setCardIndex(0)
  }, [cardCount, cardIndex, isCardMode, setCardIndex])

  const goCard = React.useCallback(
    (nextIndex: number) => {
      if (cardCount === 0) return
      let bounded = nextIndex
      if (isRandomMode) {
        if (cardCount === 1) {
          bounded = 0
        } else {
          do {
            bounded = Math.floor(Math.random() * cardCount)
          } while (bounded === cardIndex)
        }
      } else {
        bounded = Math.max(0, Math.min(nextIndex, cardCount - 1))
      }
      setCardIndex(bounded)
      setCardFlipped(false)
    },
    [cardCount, cardIndex, isRandomMode, setCardFlipped, setCardIndex]
  )

  const waitMs = React.useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        if (!ms) return resolve()
        setTimeout(resolve, ms)
      }),
    []
  )

  const cancelCardPlayback = React.useCallback(() => {
    cardPlayTokenRef.current += 1
  }, [])

  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        cancelCardPlayback()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [cancelCardPlayback])

  const playCardAudio = React.useCallback(
    async (sentenceId: string, role: "native" | "target") => {
      const sentence = sentences.find((item) => item.id === sentenceId)
      if (!sentence) return
      const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
      if (!text.trim()) return
      const repeatTimes =
        role === "native" ? playbackNativeRepeat : playbackTargetRepeat
      const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))
      const token = cardPlayTokenRef.current + 1
      cardPlayTokenRef.current = token
      for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
        if (cardPlayTokenRef.current !== token) return
        const ok = await playSentenceRole(sentence, role)
        if (cardPlayTokenRef.current !== token) return
        if (!ok) {
          onPlayError()
          return
        }
        if (pauseMs > 0) {
          await waitMs(pauseMs)
        }
      }
    },
    [
      onPlayError,
      playSentenceRole,
      playbackNativeRepeat,
      playbackPauseSeconds,
      playbackTargetRepeat,
      sentences,
      waitMs,
    ]
  )

  React.useEffect(() => {
    if (!isCardMode) return
    const sentence = activeCardSentence
    if (!sentence) return
    const role = cardFlipped ? cardBackRole : cardFrontRole
    playCardAudio(sentence.id, role)
  }, [
    activeCardSentence,
    cardBackRole,
    cardFlipped,
    cardFrontRole,
    cardIndex,
    isCardMode,
    playCardAudio,
  ])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-card-nav]")) return
    event.currentTarget.setPointerCapture(event.pointerId)
    cardPointerRef.current = { id: event.pointerId, x: event.clientX }
    cardDragMovedRef.current = false
    setCardDragging(true)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-card-nav]")) return
    if (cardPointerRef.current.id !== event.pointerId) return
    const deltaX = event.clientX - cardPointerRef.current.x
    cardPointerRef.current = { id: null, x: 0 }
    setCardDragging(false)
    setCardDragX(0)
    if (Math.abs(deltaX) < 10) {
      cardDragMovedRef.current = false
      setCardFlipped(!cardFlipped)
      return
    }
    if (deltaX > 40) {
      goCard(cardIndex - 1)
      return
    }
    if (deltaX < -40) {
      goCard(cardIndex + 1)
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (cardPointerRef.current.id !== event.pointerId) return
    const deltaX = event.clientX - cardPointerRef.current.x
    cardDragMovedRef.current = Math.abs(deltaX) > 6
    setCardDragX(deltaX)
  }

  return {
    isCardMode,
    cardIndex,
    cardFlipped,
    cardDragX,
    cardDragging,
    cardFrontRole,
    cardBackRole,
    cardSentences,
    cardCount,
    activeCardSentence,
    setCardFlipped,
    setCardDragging,
    setCardDragX,
    goCard,
    cancelCardPlayback,
    playCardAudio,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
  }
}

export const useInitCardMode = (params: UseCardModeParams) => {
  const api = useCardModeLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestCardModeApi = api
  return api
}

export const useCardModeRequired = () => {
  if (latestCardModeApi) return latestCardModeApi
  throw new Error("CardMode API is not initialized.")
}

type CardModeApi = ReturnType<typeof useCardModeLogic>

let latestCardModeApi: CardModeApi | null = null

import * as React from "react"

type CardSentence = {
  id: string
  nativeText: string | null
  targetText: string | null
}

type UseCardModeParams = {
  sentences: CardSentence[]
  displayOrderSetting: "native_first" | "target_first"
  isRandomMode: boolean
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseSeconds: number
  playSentenceRole: (sentence: CardSentence, role: "native" | "target") => Promise<boolean>
  onPlayError: () => void
}

const useCardModeState = ({
  sentences,
  displayOrderSetting,
  isRandomMode,
  playbackNativeRepeat,
  playbackTargetRepeat,
  playbackPauseSeconds,
  playSentenceRole,
  onPlayError,
}: UseCardModeParams) => {
  const [isCardMode, setIsCardMode] = React.useState(false)
  const [cardIndex, setCardIndex] = React.useState(0)
  const [cardFlipped, setCardFlipped] = React.useState(false)
  const [cardDragX, setCardDragX] = React.useState(0)
  const [cardDragging, setCardDragging] = React.useState(false)
  const cardPointerRef = React.useRef<{ id: number | null; x: number }>({
    id: null,
    x: 0,
  })
  const cardDragMovedRef = React.useRef(false)
  const cardPlayTokenRef = React.useRef(0)

  const cardSentences = React.useMemo(() => {
    return sentences.filter(
      (sentence) =>
        Boolean(sentence.targetText?.trim()) || Boolean(sentence.nativeText?.trim())
    )
  }, [sentences])

  const cardFrontRole =
    displayOrderSetting === "native_first" ? "native" : "target"
  const cardBackRole = cardFrontRole === "native" ? "target" : "native"

  React.useEffect(() => {
    if (!isRandomMode) {
      setIsCardMode(false)
      return
    }
    setIsCardMode(true)
    setCardIndex(0)
    setCardFlipped(false)
  }, [isRandomMode])

  React.useEffect(() => {
    if (!isRandomMode) return
    if (cardSentences.length === 0) return
    setCardIndex(0)
    setCardFlipped(false)
  }, [isRandomMode, cardSentences.length])

  React.useEffect(() => {
    if (!isCardMode) return
    setCardIndex(0)
    setCardFlipped(false)
  }, [isCardMode, sentences])

  const cardCount = cardSentences.length
  const activeCardSentence = cardSentences[cardIndex]

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
    [cardCount, cardIndex, isRandomMode]
  )

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
      setCardFlipped((prev) => !prev)
      return
    }
    if (Math.abs(deltaX) < 50) {
      cardDragMovedRef.current = false
      return
    }
    cardDragMovedRef.current = true
    if (deltaX > 0) {
      goCard(cardIndex - 1)
    } else {
      goCard(cardIndex + 1)
    }
  }

  const handlePointerCancel = () => {
    cardPointerRef.current = { id: null, x: 0 }
    setCardDragging(false)
    setCardDragX(0)
    cardDragMovedRef.current = false
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-card-nav]")) return
    if (cardPointerRef.current.id !== event.pointerId) return
    const deltaX = event.clientX - cardPointerRef.current.x
    if (Math.abs(deltaX) > 5) {
      cardDragMovedRef.current = true
    }
    setCardDragX(Math.max(-120, Math.min(120, deltaX)))
  }

  const waitMs = React.useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        if (!ms) return resolve()
        setTimeout(resolve, ms)
      }),
    []
  )

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
  }, [isCardMode, cardFlipped, cardIndex, activeCardSentence, cardBackRole, cardFrontRole, playCardAudio])

  const handleFlip = React.useCallback(() => {
    setCardFlipped((prev) => !prev)
  }, [])

  const handlePrev = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      goCard(cardIndex - 1)
    },
    [cardIndex, goCard]
  )

  const handleNext = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      goCard(cardIndex + 1)
    },
    [cardIndex, goCard]
  )

  const handlePlay = React.useCallback(() => {
    const sentence = activeCardSentence
    if (!sentence) return
    const role = cardFlipped ? cardBackRole : cardFrontRole
    playCardAudio(sentence.id, role)
  }, [activeCardSentence, cardBackRole, cardFlipped, cardFrontRole, playCardAudio])

  const cancelCardPlayback = React.useCallback(() => {
    cardPlayTokenRef.current += 1
  }, [])

  const cardFrontText =
    activeCardSentence?.[cardFrontRole === "native" ? "nativeText" : "targetText"] ??
    ""
  const cardBackText =
    activeCardSentence?.[cardBackRole === "native" ? "nativeText" : "targetText"] ??
    ""

  return {
    isCardMode,
    setIsCardMode,
    isRandomMode,
    cardIndex,
    cardCount,
    cardFlipped,
    cardDragX,
    cardDragging,
    cardFrontRole,
    cardBackRole,
    cardFrontText,
    cardBackText,
    handleFlip,
    handlePrev,
    handleNext,
    handlePlay,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    cancelCardPlayback,
  }
}

type CardModeContextValue = ReturnType<typeof useCardModeState>

const CardModeContext = React.createContext<CardModeContextValue | null>(null)

export const CardModeProvider = ({
  value,
  children,
}: {
  value: CardModeContextValue
  children: React.ReactNode
}) => {
  return <CardModeContext.Provider value={value}>{children}</CardModeContext.Provider>
}

export const useCardMode = (params?: UseCardModeParams) => {
  const context = React.useContext(CardModeContext)
  if (context) return context
  if (!params) {
    throw new Error("useCardMode requires params when no provider is set.")
  }
  return useCardModeState(params)
}

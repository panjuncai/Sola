import * as React from "react"
import { useTranslation } from "react-i18next"

import { Button, cn, toast } from "@sola/ui"

import { useCardModeActions, useCardModeState } from "@/atoms/cardMode"
import { useArticlesContext } from "@/hooks/useArticles"
import { useSettingsView } from "@/hooks/useSettingsView"
import { useArticleToolbar } from "@/hooks/useArticleToolbar"
import { usePlayback } from "@/hooks/usePlayback"

type CardSentence = {
  id: string
  nativeText: string | null
  targetText: string | null
}

const useCardInteraction = ({
  sentences,
  displayOrderSetting,
  isRandomMode,
  playbackNativeRepeat,
  playbackTargetRepeat,
  playbackPauseSeconds,
  playSentenceRole,
  onPlayError,
  isCardMode,
  cardIndex,
  cardFlipped,
  setIsCardMode,
  setCardIndex,
  setCardFlipped,
  setCardDragX,
  setCardDragging,
}: {
  sentences: CardSentence[]
  displayOrderSetting: "native_first" | "target_first"
  isRandomMode: boolean
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseSeconds: number
  playSentenceRole: (sentence: CardSentence, role: "native" | "target") => Promise<boolean>
  onPlayError: () => void
  isCardMode: boolean
  cardIndex: number
  cardFlipped: boolean
  setIsCardMode: (next: boolean) => void
  setCardIndex: (next: number) => void
  setCardFlipped: (next: boolean) => void
  setCardDragX: (next: number) => void
  setCardDragging: (next: boolean) => void
}) => {
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

  const handleFlip = React.useCallback(() => {
    setCardFlipped(!cardFlipped)
  }, [cardFlipped, setCardFlipped])

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

  const cardFrontText =
    activeCardSentence?.[cardFrontRole === "native" ? "nativeText" : "targetText"] ??
    ""
  const cardBackText =
    activeCardSentence?.[cardBackRole === "native" ? "nativeText" : "targetText"] ??
    ""

  return {
    cardCount,
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
  }
}

export const CardModeView = () => {
  const { t } = useTranslation()
  const { detailQuery } = useArticlesContext()
  const { displayOrderSetting, playbackNativeRepeat, playbackTargetRepeat, playbackPauseSeconds } =
    useSettingsView()
  const { isRandomMode } = useArticleToolbar()
  const { playSentenceRole } = usePlayback()
  const { isCardMode, cardIndex, cardFlipped, cardDragX, cardDragging } =
    useCardModeState()
  const { setIsCardMode, setCardIndex, setCardFlipped, setCardDragX, setCardDragging } =
    useCardModeActions()

  const sentences = detailQuery.data?.sentences ?? []

  const {
    cardCount,
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
  } = useCardInteraction({
    sentences,
    displayOrderSetting,
    isRandomMode,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    playSentenceRole,
    onPlayError: () => toast.error(t("tts.audioPlayFailed")),
    isCardMode,
    cardIndex,
    cardFlipped,
    setIsCardMode,
    setCardIndex,
    setCardFlipped,
    setCardDragX,
    setCardDragging,
  })

  if (!isCardMode) return null

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full max-w-xl"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              handleFlip()
            }
          }}
          onClick={handleFlip}
          className="group relative mx-auto h-56 w-full max-w-xl cursor-pointer select-none"
          style={{ perspective: "1200px" }}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-2xl border border-muted/30 bg-background shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-transform duration-500",
              "flex items-center justify-center px-6 text-center text-xl font-semibold"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: `${
                cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              } translateX(${cardDragX}px)`,
              transitionDuration: cardDragging ? "0ms" : "500ms",
            }}
          >
            {cardFrontText}
          </div>
          <div
            className={cn(
              "absolute inset-0 rounded-2xl border border-muted/30 bg-muted/30 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-transform duration-500",
              "flex items-center justify-center px-6 text-center text-xl font-semibold"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: `${
                cardFlipped ? "rotateY(0deg)" : "rotateY(-180deg)"
              } translateX(${cardDragX}px)`,
              transitionDuration: cardDragging ? "0ms" : "500ms",
            }}
          >
            {cardBackText}
          </div>
          <button
            type="button"
            data-card-nav
            aria-label={t("article.cardPrev")}
            onClick={handlePrev}
            className="absolute inset-y-0 left-0 flex items-center px-2 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ opacity: cardDragging ? 1 : undefined }}
          >
            ◀
          </button>
          <button
            type="button"
            data-card-nav
            aria-label={t("article.cardNext")}
            onClick={handleNext}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ opacity: cardDragging ? 1 : undefined }}
          >
            ▶
          </button>
        </div>
      </div>
      <Button
        type="button"
        className="h-11 w-20 rounded-full text-lg"
        aria-label={t("article.cardPlay")}
        onClick={handlePlay}
      >
        ▶
      </Button>
      {!isRandomMode ? (
        <div className="text-xs text-muted-foreground">
          {cardIndex + 1}/{cardCount}
        </div>
      ) : null}
    </div>
  )
}

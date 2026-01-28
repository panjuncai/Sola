import { useTranslation } from "react-i18next"

import { Button, cn } from "@sola/ui"

import { CardModeEmptyState } from "./CardModeStates"
import { useCardModeRequired } from "../hooks/init/useInitCardMode"
import { useArticleToolbarState } from "@/features/playback"

export const CardModeView = () => {
  const { t } = useTranslation()
  const {
    isCardMode,
    cardIndex,
    cardFlipped,
    cardDragX,
    cardDragging,
    cardCount,
    cardFrontRole,
    cardBackRole,
    activeCardSentence,
    setCardFlipped,
    setCardDragging,
    setCardDragX,
    goCard,
    playCardAudio,
    cancelCardPlayback,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCardModeRequired()
  const { isRandomMode } = useArticleToolbarState()
  const cardFrontText =
    cardFrontRole === "native"
      ? activeCardSentence?.nativeText ?? ""
      : activeCardSentence?.targetText ?? ""
  const cardBackText =
    cardBackRole === "native"
      ? activeCardSentence?.nativeText ?? ""
      : activeCardSentence?.targetText ?? ""

  const handleFlip = () => {
    setCardFlipped(!cardFlipped)
    cancelCardPlayback()
  }

  const handlePrev = () => {
    goCard(cardIndex - 1)
    cancelCardPlayback()
  }

  const handleNext = () => {
    goCard(cardIndex + 1)
    cancelCardPlayback()
  }

  const handlePlay = () => {
    if (!activeCardSentence) return
    const role = cardFlipped ? cardBackRole : cardFrontRole
    playCardAudio(activeCardSentence.id, role)
  }

  const handlePointerCancel = () => {
    setCardDragging(false)
    setCardDragX(0)
  }

  if (!isCardMode) return null
  if (cardCount === 0) {
    return (
      <div className="flex justify-center">
        <CardModeEmptyState />
      </div>
    )
  }

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

import * as React from "react"
import type { TFunction } from "i18next"

import { Button, cn } from "@sola/ui"

type TranslateFn = TFunction<"translation">

type CardModeViewProps = {
  t: TranslateFn
  isRandomMode: boolean
  cardIndex: number
  cardCount: number
  cardFlipped: boolean
  cardDragX: number
  cardDragging: boolean
  cardFrontText: string
  cardBackText: string
  onFlip: () => void
  onPrev: (event: React.MouseEvent<HTMLButtonElement>) => void
  onNext: (event: React.MouseEvent<HTMLButtonElement>) => void
  onPlay: () => void
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void
}

export const CardModeView: React.FC<CardModeViewProps> = ({
  t,
  isRandomMode,
  cardIndex,
  cardCount,
  cardFlipped,
  cardDragX,
  cardDragging,
  cardFrontText,
  cardBackText,
  onFlip,
  onPrev,
  onNext,
  onPlay,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full max-w-xl"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onFlip()
            }
          }}
          onClick={onFlip}
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
            onClick={onPrev}
            className="absolute inset-y-0 left-0 flex items-center px-2 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ opacity: cardDragging ? 1 : undefined }}
          >
            ◀
          </button>
          <button
            type="button"
            data-card-nav
            aria-label={t("article.cardNext")}
            onClick={onNext}
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
        onClick={onPlay}
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

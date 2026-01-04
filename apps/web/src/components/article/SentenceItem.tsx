import * as React from "react"
import type { TFunction } from "i18next"

import { Card, CardContent, cn } from "@sola/ui"

type SentenceRole = "native" | "target"

type ClozeResult = {
  correct: boolean
  segments: Array<{
    kind: "same" | "extra" | "missing" | "mismatch"
    text: string
    parts?: Array<{
      type: "same" | "extra" | "missing"
      text: string
    }>
  }>
}

type TranslateFn = TFunction<"translation">

type SentenceItemProps = {
  sentence: {
    id: string
    nativeText: string | null
    targetText: string | null
  }
  displayOrderSetting: "native_first" | "target_first"
  playingSentenceId: string | null
  playingRole: SentenceRole | null
  playingSpeed: number | null
  selectedSentenceId: string | null
  selectedSentenceRole: SentenceRole | null
  blurNative: boolean
  blurTarget: boolean
  isClozeEnabled: boolean
  clozeRevealed: Record<string, boolean>
  clozeInputs: Record<string, string>
  clozeResults: Record<string, ClozeResult>
  setClozeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setClozeResults: React.Dispatch<React.SetStateAction<Record<string, ClozeResult>>>
  onStopPlayback: () => void
  onSelectSentence: (
    sentenceId: string,
    role: SentenceRole,
    isTarget: boolean,
    isClozeEnabled: boolean,
    isRevealed: boolean
  ) => boolean
  onPlaySentence: (
    sentence: { id: string; nativeText: string | null; targetText: string | null },
    role: SentenceRole
  ) => Promise<boolean>
  onPlayError: () => void
  onEdit: (sentence: { id: string; nativeText: string | null; targetText: string | null }) => void
  onDelete: (sentenceId: string) => void
  onClozeCheck: (sentenceId: string) => void
  t: TranslateFn
}

export const SentenceItem: React.FC<SentenceItemProps> = ({
  sentence,
  displayOrderSetting,
  playingSentenceId,
  playingRole,
  playingSpeed,
  selectedSentenceId,
  selectedSentenceRole,
  blurNative,
  blurTarget,
  isClozeEnabled,
  clozeRevealed,
  clozeInputs,
  clozeResults,
  setClozeInputs,
  setClozeResults,
  onStopPlayback,
  onSelectSentence,
  onPlaySentence,
  onPlayError,
  onEdit,
  onDelete,
  onClozeCheck,
  t,
}) => {
  const nativeFirst = displayOrderSetting === "native_first"
  const items = [
    { role: "native" as const, text: sentence.nativeText ?? "" },
    { role: "target" as const, text: sentence.targetText ?? "" },
  ]
  const ordered = nativeFirst ? items : items.slice().reverse()

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="space-y-1.5 rounded-xl bg-muted/20 px-3 py-2 text-sm transition">
        <div className="flex items-center gap-2 text-muted-foreground">
          <button
            type="button"
            aria-label={t("article.editSentenceTitle")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition hover:bg-muted"
            onClick={() => {
              onStopPlayback()
              onEdit(sentence)
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t("article.deleteSentenceTitle")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition hover:bg-muted"
            onClick={() => {
              onStopPlayback()
              onDelete(sentence.id)
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </div>
        {ordered.map((item) => {
          if (!item.text) return null
          const isPlaying =
            sentence.id === playingSentenceId && playingRole === item.role
          const isSelected =
            sentence.id === selectedSentenceId && selectedSentenceRole === item.role
          const isTarget = item.role === "target"
          const isRevealed = clozeRevealed[sentence.id] === true
          const clozeResult = clozeResults[sentence.id]
          const shouldBlur =
            isTarget && isClozeEnabled
              ? !isRevealed
              : item.role === "target" && blurTarget

          return (
            <div key={item.role} className="space-y-1">
              <div
                className={cn(
                  "relative flex items-start gap-2 rounded-md border border-muted/20 px-2.5 py-1 text-base transition",
                  isPlaying && "font-medium",
                  isSelected &&
                    "border-white/30 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-1 ring-white/40"
                )}
                role="button"
                tabIndex={0}
                onClick={() => {
                  const skipPlay = onSelectSentence(
                    sentence.id,
                    item.role,
                    isTarget,
                    isClozeEnabled,
                    isRevealed
                  )
                  if (skipPlay) return
                  onPlaySentence(sentence, item.role)
                    .then((ok) => {
                      if (!ok) onPlayError()
                    })
                    .catch(() => {})
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    const skipPlay = onSelectSentence(
                      sentence.id,
                      item.role,
                      isTarget,
                      isClozeEnabled,
                      isRevealed
                    )
                    if (skipPlay) return
                    onPlaySentence(sentence, item.role)
                      .then((ok) => {
                        if (!ok) onPlayError()
                      })
                      .catch(() => {})
                  }
                }}
              >
                {isPlaying ? (
                  <span className="absolute right-2 top-1 text-[11px] text-muted-foreground/80">
                    {(playingSpeed ?? 1).toFixed(1)}×
                  </span>
                ) : null}
                <span
                  className={cn(
                    "mt-1 h-3 w-1.5 rounded-full",
                    item.role === "native" ? "bg-blue-500" : "bg-orange-500"
                  )}
                />
                <span
                  className={cn(
                    "leading-relaxed",
                    isPlaying &&
                      (item.role === "native" ? "text-blue-600" : "text-orange-500"),
                    item.role === "native" && blurNative && "blur-sm",
                    shouldBlur && "blur-sm"
                  )}
                >
                  {item.text}
                </span>
              </div>
              {isTarget && isClozeEnabled ? (
                <div className="space-y-1 pl-4">
                  <input
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    placeholder={t("article.clozePlaceholder")}
                    value={clozeInputs[sentence.id] ?? ""}
                    style={{
                      maxWidth: "100%",
                      width: `${Math.max(8, sentence.targetText?.length ?? 8)}ch`,
                    }}
                    onChange={(event) => {
                      const value = event.target.value
                      setClozeInputs((prev) => ({
                        ...prev,
                        [sentence.id]: value,
                      }))
                      setClozeResults((prev) => {
                        if (!prev[sentence.id]) return prev
                        const next = { ...prev }
                        delete next[sentence.id]
                        return next
                      })
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        onClozeCheck(sentence.id)
                      }
                    }}
                  />
                  {clozeResult ? (
                    <div className="text-xs">
                      {clozeResult.segments.map((segment, index) => {
                        const isLast = index === clozeResult.segments.length - 1
                        const suffix = isLast ? "" : " "
                        if (segment.kind === "same") {
                          return (
                            <span key={`same-${index}`} className="text-green-600">
                              {segment.text}
                              {suffix}
                            </span>
                          )
                        }
                        if (segment.kind === "extra") {
                          return (
                            <span
                              key={`extra-${index}`}
                              className="text-red-500 line-through"
                            >
                              {segment.text}
                              {suffix}
                            </span>
                          )
                        }
                        if (segment.kind === "missing") {
                          return (
                            <span key={`missing-${index}`} className="text-orange-500">
                              ({segment.text})
                              {suffix}
                            </span>
                          )
                        }
                        return (
                          <span key={`mismatch-${index}`} className="text-orange-500">
                            {segment.parts?.map((part, partIndex) => {
                              if (part.type === "same") {
                                return (
                                  <span
                                    key={`part-same-${partIndex}`}
                                    className="text-green-600"
                                  >
                                    {part.text}
                                  </span>
                                )
                              }
                              if (part.type === "extra") {
                                return (
                                  <span
                                    key={`part-extra-${partIndex}`}
                                    className="text-red-500 line-through"
                                  >
                                    {part.text}
                                  </span>
                                )
                              }
                              return (
                                <span
                                  key={`part-missing-${partIndex}`}
                                  className="text-orange-500"
                                >
                                  ({part.text})
                                </span>
                              )
                            })}
                            {suffix}
                          </span>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

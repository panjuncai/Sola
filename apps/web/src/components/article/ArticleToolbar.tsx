import * as React from "react"
import type { TFunction } from "i18next"

import { Button, cn } from "@sola/ui"

type InstructionGroup = [string, { id: string; name: string }[]]

type AiProgressState = {
  running: boolean
  instructionId: string | null
  completed: number
  total: number
}

type TranslateFn = TFunction<"translation">

type ArticleToolbarProps = {
  t: TranslateFn
  isLoopingAll: boolean
  isLoopingTarget: boolean
  isLoopingSingle: boolean
  isLoopingShadowing: boolean
  isRandomMode: boolean
  isCardMode: boolean
  isClozeEnabled: boolean
  blurTarget: boolean
  blurNative: boolean
  mobileToolbarOpen: boolean
  aiInstructionGroups: InstructionGroup[]
  aiProgress: AiProgressState | null
  missingNativeCount: number
  resolveInstructionLabel: (type: "translate" | "explain" | "custom") => string
  onStartLoopAll: () => void
  onStartLoopTarget: () => void
  onStartLoopSingle: () => void
  onStopLoopPlayback: () => void
  onToggleShadowing: () => void
  onToggleRandomMode: () => void
  onToggleCardMode: () => void
  onToggleCloze: () => void
  onToggleBlurTarget: () => void
  onToggleBlurNative: () => void
  onStartAiInstruction: (instructionId: string) => void
  onCancelAi: () => void
  onRetryMissing: () => void
  onToggleMobileToolbar: () => void
  onCloseMobileToolbar: () => void
}

export const ArticleToolbar: React.FC<ArticleToolbarProps> = ({
  t,
  isLoopingAll,
  isLoopingTarget,
  isLoopingSingle,
  isLoopingShadowing,
  isRandomMode,
  isCardMode,
  isClozeEnabled,
  blurTarget,
  blurNative,
  mobileToolbarOpen,
  aiInstructionGroups,
  aiProgress,
  missingNativeCount,
  resolveInstructionLabel,
  onStartLoopAll,
  onStartLoopTarget,
  onStartLoopSingle,
  onStopLoopPlayback,
  onToggleShadowing,
  onToggleRandomMode,
  onToggleCardMode,
  onToggleCloze,
  onToggleBlurTarget,
  onToggleBlurNative,
  onStartAiInstruction,
  onCancelAi,
  onRetryMissing,
  onToggleMobileToolbar,
  onCloseMobileToolbar,
}) => {
  return (
    <>
      <div className="hidden md:block">
        <div className="fixed top-0 left-0 right-0 md:left-72 z-40 border-b bg-background/95 px-4 md:px-12 py-2 backdrop-blur">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 rounded-full bg-muted/40 px-3 py-2 shadow-sm">
              <Button
                type="button"
                variant={isLoopingAll ? "secondary" : "outline"}
                aria-label={t("article.loopAll")}
                className={cn(
                  "relative h-9 w-9 rounded-full p-0 group",
                  isLoopingAll &&
                    "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                )}
                onClick={() => {
                  if (isLoopingAll) onStopLoopPlayback()
                  else onStartLoopAll()
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 15.5-6.4" />
                  <path d="M18.5 5.6H21V3" />
                  <path d="M21 12a9 9 0 0 1-15.5 6.4" />
                  <path d="M5.5 18.4H3V21" />
                </svg>
                <span className="pointer-events-none absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {t("article.loopAll")}
                </span>
              </Button>
              <Button
                type="button"
                variant={isLoopingTarget ? "secondary" : "outline"}
                aria-label={t("article.loopTarget")}
                className={cn(
                  "relative h-9 w-9 rounded-full p-0 group",
                  isLoopingTarget &&
                    "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                )}
                onClick={() => {
                  if (isLoopingTarget) onStopLoopPlayback()
                  else onStartLoopTarget()
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="7" />
                  <path d="M12 5v2" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                <span className="pointer-events-none absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {t("article.loopTarget")}
                </span>
              </Button>
              <Button
                type="button"
                variant={isLoopingSingle ? "secondary" : "outline"}
                aria-label={t("article.loopSingle")}
                className={cn(
                  "relative h-9 w-9 rounded-full p-0 group",
                  isLoopingSingle &&
                    "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                )}
                onClick={() => {
                  if (isLoopingSingle) onStopLoopPlayback()
                  else onStartLoopSingle()
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h9a4 4 0 0 1 4 4v6" />
                  <path d="M7 10 4 7l3-3" />
                  <path d="M20 17H11a4 4 0 0 1-4-4V7" />
                  <path d="M17 14l3 3-3 3" />
                </svg>
                <span className="pointer-events-none absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {t("article.loopSingle")}
                </span>
              </Button>
              <Button
                type="button"
                variant={isLoopingShadowing ? "secondary" : "outline"}
                aria-label={t("article.shadowing")}
                className={cn(
                  "relative h-9 w-9 rounded-full p-0 group",
                  isLoopingShadowing &&
                    "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                )}
                onClick={onToggleShadowing}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 16c3.5 0 3.5-4 7-4s3.5 4 7 4 3.5-4 7-4" />
                  <path d="M3 20c3.5 0 3.5-4 7-4s3.5 4 7 4 3.5-4 7-4" />
                </svg>
                <span className="pointer-events-none absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {t("article.shadowing")}
                </span>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
              <button
                type="button"
                className="flex items-center gap-2"
                aria-label={t("article.randomMode")}
                onClick={onToggleRandomMode}
              >
                <span
                  className={cn(
                    "relative h-7 w-12 rounded-full border transition",
                    isRandomMode ? "bg-primary/80" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                      isRandomMode ? "left-5" : "left-1"
                    )}
                  />
                </span>
                <span>{t("article.randomMode")}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2"
                aria-label={t("article.cardMode")}
                onClick={onToggleCardMode}
              >
                <span
                  className={cn(
                    "relative h-7 w-12 rounded-full border transition",
                    isCardMode ? "bg-primary/80" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                      isCardMode ? "left-5" : "left-1"
                    )}
                  />
                </span>
                <span>{t("article.cardMode")}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2"
                aria-label={t("article.clozePractice")}
                onClick={onToggleCloze}
              >
                <span
                  className={cn(
                    "relative h-7 w-12 rounded-full border transition",
                    isClozeEnabled ? "bg-primary/80" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                      isClozeEnabled ? "left-5" : "left-1"
                    )}
                  />
                </span>
                <span>{t("article.clozePractice")}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2"
                onClick={onToggleBlurTarget}
                aria-label={t("article.maskTarget")}
              >
                <span
                  className={cn(
                    "relative h-8 w-12 rounded-full border transition",
                    blurTarget ? "bg-primary/80" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                      blurTarget ? "left-5" : "left-1"
                    )}
                  />
                </span>
                <span>{t("article.maskTarget")}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2"
                onClick={onToggleBlurNative}
                aria-label={t("article.maskNative")}
              >
                <span
                  className={cn(
                    "relative h-8 w-12 rounded-full border transition",
                    blurNative ? "bg-primary/80" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                      blurNative ? "left-5" : "left-1"
                    )}
                  />
                </span>
                <span>{t("article.maskNative")}</span>
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {aiInstructionGroups.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                {t("ai.noInstructions")}
              </span>
            ) : (
              aiInstructionGroups.map(([type, items]) => (
                <div
                  key={type}
                  className="flex flex-wrap items-center gap-1.5 rounded-full bg-muted/40 px-2 py-1"
                >
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {resolveInstructionLabel(type as "translate" | "explain" | "custom")}
                  </span>
                  {items.map((instruction) => (
                    <Button
                      key={instruction.id}
                      type="button"
                      variant={
                        aiProgress?.running &&
                        aiProgress.instructionId === instruction.id
                          ? "secondary"
                          : "outline"
                      }
                      className="h-7 px-2 text-xs"
                      onClick={() => onStartAiInstruction(instruction.id)}
                    >
                      {instruction.name}
                    </Button>
                  ))}
                </div>
              ))
            )}
            {aiProgress ? (
              <span className="text-xs text-muted-foreground">
                {t("ai.translationProgress", {
                  completed: aiProgress.completed,
                  total: aiProgress.total,
                })}
              </span>
            ) : null}
            {aiProgress?.running ? (
              <Button
                type="button"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={onCancelAi}
              >
                {t("ai.cancel")}
              </Button>
            ) : null}
            {!aiProgress?.running && missingNativeCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={onRetryMissing}
              >
                {t("ai.retryMissing")}
              </Button>
            ) : null}
          </div>
        </div>
        <div className="h-28 md:h-24" />
      </div>

      <div className="md:hidden">
        <button
          type="button"
          className="fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg"
          onClick={onToggleMobileToolbar}
          aria-label={t("common.open")}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12h16" />
            <path d="M12 4v16" />
          </svg>
        </button>
        {mobileToolbarOpen ? (
          <div className="fixed bottom-20 right-4 z-50 w-[min(92vw,320px)] rounded-2xl border bg-background/95 p-3 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("article.loopAll")}
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
                  onClick={onCloseMobileToolbar}
                >
                  {t("common.close")}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-full bg-muted/40 px-3 py-2">
                <Button
                  type="button"
                  variant={isLoopingAll ? "secondary" : "outline"}
                  aria-label={t("article.loopAll")}
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    isLoopingAll &&
                      "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  )}
                  onClick={() => {
                    if (isLoopingAll) onStopLoopPlayback()
                    else onStartLoopAll()
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 15.5-6.4" />
                    <path d="M18.5 5.6H21V3" />
                    <path d="M21 12a9 9 0 0 1-15.5 6.4" />
                    <path d="M5.5 18.4H3V21" />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant={isLoopingTarget ? "secondary" : "outline"}
                  aria-label={t("article.loopTarget")}
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    isLoopingTarget &&
                      "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  )}
                  onClick={() => {
                    if (isLoopingTarget) onStopLoopPlayback()
                    else onStartLoopTarget()
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="7" />
                    <path d="M12 5v2" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant={isLoopingSingle ? "secondary" : "outline"}
                  aria-label={t("article.loopSingle")}
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    isLoopingSingle &&
                      "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  )}
                  onClick={() => {
                    if (isLoopingSingle) onStopLoopPlayback()
                    else onStartLoopSingle()
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h9a4 4 0 0 1 4 4v6" />
                    <path d="M7 10 4 7l3-3" />
                    <path d="M20 17H11a4 4 0 0 1-4-4V7" />
                    <path d="M17 14l3 3-3 3" />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant={isLoopingShadowing ? "secondary" : "outline"}
                  aria-label={t("article.shadowing")}
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    isLoopingShadowing &&
                      "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                  )}
                  onClick={onToggleShadowing}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 16c3.5 0 3.5-4 7-4s3.5 4 7 4 3.5-4 7-4" />
                    <path d="M3 20c3.5 0 3.5-4 7-4s3.5 4 7 4 3.5-4 7-4" />
                  </svg>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={onToggleRandomMode}
                >
                  <span
                    className={cn(
                      "relative h-7 w-12 rounded-full border transition",
                      isRandomMode ? "bg-primary/80" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                        isRandomMode ? "left-5" : "left-1"
                      )}
                    />
                  </span>
                  <span>{t("article.randomMode")}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={onToggleCardMode}
                >
                  <span
                    className={cn(
                      "relative h-7 w-12 rounded-full border transition",
                      isCardMode ? "bg-primary/80" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                        isCardMode ? "left-5" : "left-1"
                      )}
                    />
                  </span>
                  <span>{t("article.cardMode")}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={onToggleCloze}
                >
                  <span
                    className={cn(
                      "relative h-7 w-12 rounded-full border transition",
                      isClozeEnabled ? "bg-primary/80" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                        isClozeEnabled ? "left-5" : "left-1"
                      )}
                    />
                  </span>
                  <span>{t("article.clozePractice")}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={onToggleBlurTarget}
                >
                  <span
                    className={cn(
                      "relative h-8 w-12 rounded-full border transition",
                      blurTarget ? "bg-primary/80" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                        blurTarget ? "left-5" : "left-1"
                      )}
                    />
                  </span>
                  <span>{t("article.maskTarget")}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={onToggleBlurNative}
                >
                  <span
                    className={cn(
                      "relative h-8 w-12 rounded-full border transition",
                      blurNative ? "bg-primary/80" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                        blurNative ? "left-5" : "left-1"
                      )}
                    />
                  </span>
                  <span>{t("article.maskNative")}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {aiInstructionGroups.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {t("ai.noInstructions")}
                  </span>
                ) : (
                  aiInstructionGroups.map(([type, items]) => (
                    <div
                      key={type}
                      className="flex flex-wrap items-center gap-1.5 rounded-full bg-muted/40 px-2 py-1"
                    >
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {resolveInstructionLabel(
                          type as "translate" | "explain" | "custom"
                        )}
                      </span>
                      {items.map((instruction) => (
                        <Button
                          key={instruction.id}
                          type="button"
                          variant={
                            aiProgress?.running &&
                            aiProgress.instructionId === instruction.id
                              ? "secondary"
                              : "outline"
                          }
                          className="h-7 px-2 text-xs"
                          onClick={() => onStartAiInstruction(instruction.id)}
                        >
                          {instruction.name}
                        </Button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

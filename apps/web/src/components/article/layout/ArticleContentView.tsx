import * as React from "react"
import type { TFunction } from "i18next"

import { Card, CardContent } from "@sola/ui"

import { ArticleToolbar } from "@/components/article/ArticleToolbar"
import { SentenceItem } from "@/components/article/SentenceItem"
import { CardModeView } from "@/components/article/CardModeView"
import { CreateArticlePanel } from "@/components/article/CreateArticlePanel"
import type { ClozeResult } from "@/hooks/useClozePractice"

type ArticleSentence = {
  id: string
  targetText: string | null
  nativeText: string | null
}

type ArticleDetail = {
  sentences: ArticleSentence[]
}

type ArticleContentViewProps = {
  t: TFunction<"translation">
  showCreate: boolean
  isLoading: boolean
  detail: ArticleDetail | undefined
  isCardMode: boolean
  isRandomMode: boolean
  cardIndex: number
  cardCount: number
  cardFlipped: boolean
  cardDragX: number
  cardDragging: boolean
  cardFrontText: string
  cardBackText: string
  onCardFlip: () => void
  onCardPrev: (event: React.MouseEvent<HTMLButtonElement>) => void
  onCardNext: (event: React.MouseEvent<HTMLButtonElement>) => void
  onCardPlay: () => void
  onCardPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onCardPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void
  onCardPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void
  onCardPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void
  isLoopingAll: boolean
  isLoopingTarget: boolean
  isLoopingSingle: boolean
  isLoopingShadowing: boolean
  isClozeEnabled: boolean
  blurTarget: boolean
  blurNative: boolean
  mobileToolbarOpen: boolean
  aiInstructionGroups: [string, { id: string; name: string }[]][]
  aiProgress: {
    running: boolean
    instructionId: string | null
    completed: number
    total: number
  } | null
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
  displayOrderSetting: "native_first" | "target_first"
  playingSentenceId: string | null
  playingRole: "native" | "target" | null
  playingSpeed: number | null
  selectedSentenceId: string | null
  selectedSentenceRole: "native" | "target" | null
  clozeRevealed: Record<string, boolean>
  clozeInputs: Record<string, string>
  clozeResults: Record<string, ClozeResult>
  setClozeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setClozeResults: React.Dispatch<React.SetStateAction<Record<string, ClozeResult>>>
  onSelectSentence: (
    sentenceId: string,
    role: "native" | "target",
    isTarget: boolean,
    clozeEnabled: boolean,
    isRevealed: boolean
  ) => boolean
  onPlaySentence: (sentence: ArticleSentence, role: "native" | "target") => Promise<boolean>
  onPlayError: () => void
  onEditSentence: (sentence: ArticleSentence) => void
  onDeleteSentence: (sentenceId: string) => void
  onClozeCheck: (sentenceId: string) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  content: string
  onChangeContent: (value: string) => void
  onSubmitContent: () => void
  isSubmitting: boolean
  isError: boolean
}

export const ArticleContentView = ({
  t,
  showCreate,
  isLoading,
  detail,
  isCardMode,
  isRandomMode,
  cardIndex,
  cardCount,
  cardFlipped,
  cardDragX,
  cardDragging,
  cardFrontText,
  cardBackText,
  onCardFlip,
  onCardPrev,
  onCardNext,
  onCardPlay,
  onCardPointerDown,
  onCardPointerMove,
  onCardPointerUp,
  onCardPointerCancel,
  isLoopingAll,
  isLoopingTarget,
  isLoopingSingle,
  isLoopingShadowing,
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
  displayOrderSetting,
  playingSentenceId,
  playingRole,
  playingSpeed,
  selectedSentenceId,
  selectedSentenceRole,
  clozeRevealed,
  clozeInputs,
  clozeResults,
  setClozeInputs,
  setClozeResults,
  onSelectSentence,
  onPlaySentence,
  onPlayError,
  onEditSentence,
  onDeleteSentence,
  onClozeCheck,
  inputRef,
  content,
  onChangeContent,
  onSubmitContent,
  isSubmitting,
  isError,
}: ArticleContentViewProps) => {
  return (
    <>
      {showCreate ? (
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">{t("article.heroTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("article.heroSubtitle")}</p>
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">{t("article.loading")}</div>
      ) : detail ? (
        <div className="space-y-4">
          <ArticleToolbar
            t={t}
            isLoopingAll={isLoopingAll}
            isLoopingTarget={isLoopingTarget}
            isLoopingSingle={isLoopingSingle}
            isLoopingShadowing={isLoopingShadowing}
            isRandomMode={isRandomMode}
            isCardMode={isCardMode}
            isClozeEnabled={isClozeEnabled}
            blurTarget={blurTarget}
            blurNative={blurNative}
            mobileToolbarOpen={mobileToolbarOpen}
            aiInstructionGroups={aiInstructionGroups}
            aiProgress={aiProgress}
            missingNativeCount={missingNativeCount}
            resolveInstructionLabel={resolveInstructionLabel}
            onStartLoopAll={onStartLoopAll}
            onStartLoopTarget={onStartLoopTarget}
            onStartLoopSingle={onStartLoopSingle}
            onStopLoopPlayback={onStopLoopPlayback}
            onToggleShadowing={onToggleShadowing}
            onToggleRandomMode={onToggleRandomMode}
            onToggleCardMode={onToggleCardMode}
            onToggleCloze={onToggleCloze}
            onToggleBlurTarget={onToggleBlurTarget}
            onToggleBlurNative={onToggleBlurNative}
            onStartAiInstruction={onStartAiInstruction}
            onCancelAi={onCancelAi}
            onRetryMissing={onRetryMissing}
            onToggleMobileToolbar={onToggleMobileToolbar}
            onCloseMobileToolbar={onCloseMobileToolbar}
          />
          <div className="space-y-4">
            {detail.sentences.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  {t("article.noSentences")}
                </CardContent>
              </Card>
            ) : isCardMode ? (
              <CardModeView
                t={t}
                isRandomMode={isRandomMode}
                cardIndex={cardIndex}
                cardCount={cardCount}
                cardFlipped={cardFlipped}
                cardDragX={cardDragX}
                cardDragging={cardDragging}
                cardFrontText={cardFrontText}
                cardBackText={cardBackText}
                onFlip={onCardFlip}
                onPrev={onCardPrev}
                onNext={onCardNext}
                onPlay={onCardPlay}
                onPointerDown={onCardPointerDown}
                onPointerMove={onCardPointerMove}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerCancel}
              />
            ) : (
              detail.sentences.map((sentence) => (
                <SentenceItem
                  key={sentence.id}
                  sentence={sentence}
                  displayOrderSetting={displayOrderSetting}
                  playingSentenceId={playingSentenceId}
                  playingRole={playingRole}
                  playingSpeed={playingSpeed}
                  selectedSentenceId={selectedSentenceId}
                  selectedSentenceRole={selectedSentenceRole}
                  blurNative={blurNative}
                  blurTarget={blurTarget}
                  isClozeEnabled={isClozeEnabled}
                  clozeRevealed={clozeRevealed}
                  clozeInputs={clozeInputs}
                  clozeResults={clozeResults}
                  setClozeInputs={setClozeInputs}
                  setClozeResults={setClozeResults}
                  onStopPlayback={onStopLoopPlayback}
                  onSelectSentence={onSelectSentence}
                  onPlaySentence={onPlaySentence}
                  onPlayError={onPlayError}
                  onEdit={onEditSentence}
                  onDelete={onDeleteSentence}
                  onClozeCheck={onClozeCheck}
                  t={t}
                />
              ))
            )}
          </div>
        </div>
      ) : null}

      {showCreate ? (
        <CreateArticlePanel
          t={t}
          inputRef={inputRef}
          value={content}
          onChange={onChangeContent}
          onSubmit={onSubmitContent}
          isSubmitting={isSubmitting}
          isError={isError}
        />
      ) : null}
    </>
  )
}

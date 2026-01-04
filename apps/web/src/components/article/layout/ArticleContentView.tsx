import * as React from "react"
import type { TFunction } from "i18next"

import { Card, CardContent } from "@sola/ui"

import { ArticleToolbar } from "@/components/article/ArticleToolbar"
import { SentenceItem, SentenceItemProvider } from "@/components/article/SentenceItem"
import { CardModeView } from "@/components/article/CardModeView"
import { CreateArticlePanel } from "@/components/article/CreateArticlePanel"
import type { ClozeResult } from "@/hooks/useClozePractice"
import { useAiManagement } from "@/hooks/useAiManagement"
import { useSentenceOperations } from "@/hooks/useSentenceOperations"
import { usePlayback } from "@/hooks/usePlayback"
import { useArticlesContext } from "@/hooks/useArticles"
import { useArticleToolbar } from "@/hooks/useArticleToolbar"
import { useSettingsView } from "@/hooks/useSettingsView"
import { useCardMode } from "@/hooks/useCardMode"

type ArticleContentViewProps = {
  t: TFunction<"translation">
  mobileToolbarOpen: boolean
  onToggleCardMode: () => void
  onToggleMobileToolbar: () => void
  onCloseMobileToolbar: () => void
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
  onPlayError: () => void
  onClozeCheck: (sentenceId: string) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export const ArticleContentView = ({
  t,
  mobileToolbarOpen,
  onToggleCardMode,
  onToggleMobileToolbar,
  onCloseMobileToolbar,
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
  onPlayError,
  onClozeCheck,
  inputRef,
}: ArticleContentViewProps) => {
  const { detailQuery, showCreate, content, setContent, handleCreate, createMutation } =
    useArticlesContext()
  const {
    aiInstructionGroups,
    aiProgress,
    missingNativeCount,
    resolveInstructionLabel,
    startAiTranslation,
    cancelAiTranslation,
    retryMissingTranslations,
  } = useAiManagement()
  const { handleSentenceEdit, handleSentenceDelete } = useSentenceOperations()
  const { playSentenceRole } = usePlayback()
  const {
    displayOrderSetting,
    blurTarget,
    blurNative,
    handleToggleBlurTarget,
    handleToggleBlurNative,
  } = useSettingsView()
  const { isCardMode } = useCardMode()
  const {
    isLoopingAll,
    isLoopingTarget,
    isLoopingSingle,
    isLoopingShadowing,
    isRandomMode,
    isClozeEnabled,
    stopLoopPlayback,
    startLoopAll,
    startLoopTarget,
    startLoopSingle,
    handleToggleShadowing,
    toggleRandomMode,
    toggleCloze,
  } = useArticleToolbar()
  const sentenceItemContext = React.useMemo(
    () => ({
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
      onStopPlayback: stopLoopPlayback,
      onSelectSentence,
      onPlaySentence: playSentenceRole,
      onPlayError,
      onEdit: handleSentenceEdit,
      onDelete: handleSentenceDelete,
      onClozeCheck,
    }),
    [
      blurNative,
      blurTarget,
      clozeInputs,
      clozeResults,
      clozeRevealed,
      displayOrderSetting,
      handleSentenceDelete,
      handleSentenceEdit,
      isClozeEnabled,
      onClozeCheck,
      onPlayError,
      onSelectSentence,
      playSentenceRole,
      playingRole,
      playingSentenceId,
      playingSpeed,
      selectedSentenceId,
      selectedSentenceRole,
      setClozeInputs,
      setClozeResults,
      stopLoopPlayback,
    ]
  )

  const isLoading = detailQuery.isLoading
  const detail = detailQuery.data
  const isSubmitting = createMutation.isLoading
  const isError = createMutation.isError

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
            onStartLoopAll={startLoopAll}
            onStartLoopTarget={startLoopTarget}
            onStartLoopSingle={startLoopSingle}
            onStopLoopPlayback={stopLoopPlayback}
            onToggleShadowing={handleToggleShadowing}
            onToggleRandomMode={toggleRandomMode}
            onToggleCardMode={onToggleCardMode}
            onToggleCloze={toggleCloze}
            onToggleBlurTarget={handleToggleBlurTarget}
            onToggleBlurNative={handleToggleBlurNative}
            onStartAiInstruction={(instructionId) =>
              startAiTranslation(instructionId, false)
            }
            onCancelAi={cancelAiTranslation}
            onRetryMissing={retryMissingTranslations}
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
              <CardModeView />
            ) : (
              <SentenceItemProvider value={sentenceItemContext}>
                {detail.sentences.map((sentence) => (
                  <SentenceItem key={sentence.id} sentence={sentence} />
                ))}
              </SentenceItemProvider>
            )}
          </div>
        </div>
      ) : null}

      {showCreate ? (
        <CreateArticlePanel
          t={t}
          inputRef={inputRef}
          value={content}
          onChange={setContent}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          isError={isError}
        />
      ) : null}
    </>
  )
}

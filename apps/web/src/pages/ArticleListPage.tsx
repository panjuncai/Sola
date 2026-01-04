import * as React from "react"
import { useTranslation } from "react-i18next"

import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"
import { ArticleSidebarPanel } from "@/components/article/layout/ArticleSidebarPanel"
import { ArticleContentView } from "@/components/article/layout/ArticleContentView"
import { ArticleSidebar } from "@/components/article/layout/ArticleSidebar"
import { ArticleMain } from "@/components/article/layout/ArticleMain"
import { MobileHeader } from "@/components/article/layout/MobileHeader"
import { useClozePractice } from "@/hooks/useClozePractice"
import { useCardMode } from "@/hooks/useCardMode"
import { useArticleToolbar } from "@/hooks/useArticleToolbar"
import { useAiManagement } from "@/hooks/useAiManagement"
import { useSentenceOperations } from "@/hooks/useSentenceOperations"
import { useArticles } from "@/hooks/useArticles"
import { useSettingsView } from "@/hooks/useSettingsView"
import { useToolbarView } from "@/hooks/useToolbarView"
import { useSettingsPanelView } from "@/hooks/useSettingsPanelView"
import { useSidebarView } from "@/hooks/useSidebarView"
import { DialogsContainer } from "@/components/article/DialogsContainer"
import { usePlayback } from "@/hooks/usePlayback"
import { useSettingsDialogs } from "@/hooks/useSettingsDialogs"
import { ArticleProviders } from "@/components/article/ArticleProviders"

function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}

export function ArticleListPage() {
  const { t } = useTranslation()

  const languageOptions = ["zh-CN", "en-US", "fr-FR"] as const
  type LanguageOption = (typeof languageOptions)[number]
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const articlesState = useArticles({ deriveTitle })
  const {
    articles,
    content,
    setContent,
    listQuery,
    detailQuery,
    activeArticleId,
    setActiveArticleId,
    setIsCreating,
    selectedIds,
    showCreate,
    deleteTargets,
    handleCreate,
    toggleSelected,
    createMutation,
    deleteMutation,
    setConfirmOpen,
  } = articlesState
  const {
    uiLanguage,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    nativeVoiceId,
    targetVoiceId,
    useAiUserKey,
    blurTarget,
    blurNative,
    shadowingSpeeds,
    darkMode,
    handleUiLanguageChange,
    handleDisplayOrderChange,
    handlePlaybackNativeRepeatChange,
    handlePlaybackTargetRepeatChange,
    handlePlaybackPauseSecondsChange,
    handleToggleDarkMode,
    handleToggleBlurTarget,
    handleToggleBlurNative,
    handleSetBlurTarget,
  } = useSettingsView()
  const [selectedSentenceId, setSelectedSentenceId] = React.useState<string | null>(
    null
  )
  const [selectedSentenceRole, setSelectedSentenceRole] = React.useState<
    "native" | "target" | null
  >(null)
  const [playingSpeed, setPlayingSpeed] = React.useState<number | null>(null)
  const [playingSentenceId, setPlayingSentenceId] = React.useState<string | null>(null)
  const [playingRole, setPlayingRole] = React.useState<"native" | "target" | null>(null)
  const apiBaseUrl = React.useMemo(() => {
    const envBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
    if (envBase) return envBase
    if (import.meta.env.DEV) return "http://localhost:6001"
    return window.location.origin
  }, [])
  const settingsDialogs = useSettingsDialogs({
    onDeleteAccountSuccess: () => {
      window.location.href = "/auth/login"
    },
  })
  const {
    languageDialogOpen,
    setLanguageDialogOpen,
    deleteAccountOpen,
    setDeleteAccountOpen,
    clearCacheOpen,
    setClearCacheOpen,
    shadowingDialogOpen,
    setShadowingDialogOpen,
    ttsOptionsQuery,
  } = settingsDialogs
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const userEmail = useAuthStore((state) => state.user?.email ?? "")
  const aiManagement = useAiManagement({
    t,
    detail: detailQuery.data,
    useAiUserKey,
  })
  const {
    aiDialogOpen,
    setAiDialogOpen,
    aiInstructionDialogOpen,
    setAiInstructionDialogOpen,
    aiInstructionEditOpen,
    aiInstructionAddOpen,
    aiInstructionDeleteOpen,
    aiProgress,
    aiInstructionGroups,
    missingNativeCount,
    resolveInstructionLabel,
    startAiTranslation,
    cancelAiTranslation,
    retryMissingTranslations,
  } = aiManagement

  const signOutMutation = trpc.auth.signOut.useMutation()
  const sentenceAudioMutation = trpc.tts.getSentenceAudio.useMutation()

  const handlePlayError = React.useCallback(() => {
    toast.error(t("tts.audioPlayFailed"))
  }, [t])

  const anySettingsDialogOpen =
    aiDialogOpen ||
    aiInstructionDialogOpen ||
    aiInstructionEditOpen ||
    aiInstructionAddOpen ||
    aiInstructionDeleteOpen ||
    languageDialogOpen ||
    shadowingDialogOpen ||
    deleteAccountOpen ||
    clearCacheOpen

  const {
    settingsOpen,
    toggleSettings,
    settingsPanelRef,
    settingsButtonRef,
    mobileSettingsPanelRef,
    mobileSettingsButtonRef,
    languages,
  } = useSettingsPanelView({
    t,
    anySettingsDialogOpen,
  })

  const clearSentenceSelection = React.useCallback(
    (sentenceId: string) => {
      if (selectedSentenceId === sentenceId) {
        setSelectedSentenceId(null)
        setSelectedSentenceRole(null)
      }
      if (playingSentenceId === sentenceId) {
        setPlayingSentenceId(null)
        setPlayingRole(null)
        setPlayingSpeed(null)
      }
    },
    [
      playingSentenceId,
      selectedSentenceId,
      setPlayingRole,
      setPlayingSentenceId,
      setPlayingSpeed,
      setSelectedSentenceId,
      setSelectedSentenceRole,
    ]
  )

  const playback = usePlayback({
    userId,
    apiBaseUrl,
    detail: detailQuery.data,
    ttsOptions: ttsOptionsQuery.data,
    nativeVoiceId,
    targetVoiceId,
    sentenceAudioMutation,
    setPlayingSentenceId,
    setPlayingRole,
    setPlayingSpeed,
    onCacheCleared: () => toast.success(t("settings.cacheCleared")),
  })
  const {
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    playSentenceRole,
    stopAudioPlayback,
    clearSentenceCache,
  } = playback

  const requestSentenceAudio = React.useCallback(
    (input: { sentenceId: string; role: "native" | "target" }) =>
      sentenceAudioMutation.mutateAsync(input),
    [sentenceAudioMutation]
  )

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
    markUserSelected,
  } = useArticleToolbar({
    detail: detailQuery.data,
    activeArticleId,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    shadowingSpeeds,
    selectedSentenceId,
    selectedSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    playSentenceRole,
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    requestSentenceAudio,
    onPlayError: handlePlayError,
    onSelectSentenceRequired: () => toast.error(t("tts.selectSentenceFirst")),
    onStopAudio: stopAudioPlayback,
  })

  const { handleCreateClick, handleDeleteClick, handleSelectArticle } =
    useSidebarView({
      inputRef,
      setIsCreating,
      setMobileMenuOpen,
      setActiveArticleId,
      setConfirmOpen,
      deleteTargetsLength: deleteTargets.length,
      deleteLoading: deleteMutation.isLoading,
    })

  const {
    isCardMode,
    setIsCardMode,
    cardIndex,
    cardCount,
    cardFlipped,
    cardDragX,
    cardDragging,
    cardFrontText,
    cardBackText,
    handleFlip: handleCardFlip,
    handlePrev: handleCardPrev,
    handleNext: handleCardNext,
    handlePlay: handleCardPlay,
    handlePointerDown: handleCardPointerDown,
    handlePointerMove: handleCardPointerMove,
    handlePointerUp: handleCardPointerUp,
    handlePointerCancel: handleCardPointerCancel,
    cancelCardPlayback,
  } = useCardMode({
    sentences: detailQuery.data?.sentences ?? [],
    displayOrderSetting,
    isRandomMode,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    playSentenceRole,
    onPlayError: handlePlayError,
  })
  const { mobileToolbarOpen, toggleCardMode, toggleMobileToolbar, closeMobileToolbar } =
    useToolbarView({ setIsCardMode })

  const {
    clozeInputs,
    setClozeInputs,
    clozeRevealed,
    setClozeRevealed,
    clozeResults,
    setClozeResults,
    handleSentenceSelect: handleClozeSentenceSelect,
    handleClozeCheck,
  } = useClozePractice({
    isClozeEnabled,
    blurTarget,
    setBlurTarget: handleSetBlurTarget,
    activeArticleId,
    detail: detailQuery.data,
    stopLoopPlayback,
    playSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    onPlayError: handlePlayError,
  })

  const sentenceOperations = useSentenceOperations({
    t,
    detail: detailQuery.data,
    stopLoopPlayback,
    clearSentenceSelection,
    clearSentenceCache,
    setClozeInputs,
    setClozeResults,
    setClozeRevealed,
  })
  const { handleSentenceEdit, handleSentenceDelete } = sentenceOperations

  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        stopLoopPlayback()
        cancelCardPlayback()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [cancelCardPlayback, stopLoopPlayback])

  React.useEffect(() => {
    stopLoopPlayback()
  }, [activeArticleId, showCreate, stopLoopPlayback])

  const handleSentenceSelect = React.useCallback(
    (
      sentenceId: string,
      role: "native" | "target",
      isTarget: boolean,
      clozeEnabled: boolean,
      isRevealed: boolean
  ) => {
      markUserSelected()
      return handleClozeSentenceSelect(
        sentenceId,
        role,
        isTarget,
        clozeEnabled,
        isRevealed
      )
    },
    [handleClozeSentenceSelect, markUserSelected]
  )

  const sidebarCore = (
    <ArticleSidebarPanel
      t={t}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      articles={articles}
      activeArticleId={activeArticleId}
      selectedIds={selectedIds}
      deleteDisabled={deleteTargets.length === 0 || deleteMutation.isLoading}
      onToggleSelected={toggleSelected}
      onSelectArticle={handleSelectArticle}
      onCreate={handleCreateClick}
      onDelete={handleDeleteClick}
      settingsOpen={settingsOpen}
      onToggleSettings={() => {
        toggleSettings()
        setMobileMenuOpen(false)
      }}
      settingsPanelRef={settingsPanelRef}
      settingsButtonRef={settingsButtonRef}
      darkMode={darkMode}
      onToggleDarkMode={handleToggleDarkMode}
      onOpenAiSettings={() => setAiDialogOpen(true)}
      onOpenAiInstructions={() => setAiInstructionDialogOpen(true)}
      uiLanguage={uiLanguage}
      languages={languages}
      onUiLanguageChange={(value) => handleUiLanguageChange(value as LanguageOption)}
      displayOrderSetting={displayOrderSetting}
      onDisplayOrderChange={handleDisplayOrderChange}
      onOpenLanguageSettings={() => setLanguageDialogOpen(true)}
      onOpenShadowing={() => setShadowingDialogOpen(true)}
      playbackNativeRepeat={playbackNativeRepeat}
      onPlaybackNativeRepeatChange={handlePlaybackNativeRepeatChange}
      playbackTargetRepeat={playbackTargetRepeat}
      onPlaybackTargetRepeatChange={handlePlaybackTargetRepeatChange}
      playbackPauseSeconds={playbackPauseSeconds}
      onPlaybackPauseSecondsChange={handlePlaybackPauseSecondsChange}
      onClearCache={() => setClearCacheOpen(true)}
      onDeleteAccount={() => setDeleteAccountOpen(true)}
      onSignOut={() => {
        signOutMutation
          .mutateAsync()
          .catch(() => {})
          .finally(() => {
            window.location.href = "/auth/login"
          })
      }}
      userEmail={userEmail}
    />
  )

  return (
    <ArticleProviders
      aiManagement={aiManagement}
      articles={articlesState}
      playback={playback}
      settingsDialogs={settingsDialogs}
      sentenceOperations={sentenceOperations}
    >
      <div className="w-full">
      <MobileHeader
        t={t}
        settingsOpen={settingsOpen}
        onToggleSettings={() => {
          toggleSettings()
          setMobileMenuOpen(false)
        }}
        onOpenMenu={() => setMobileMenuOpen(true)}
        settingsButtonRef={mobileSettingsButtonRef}
        settingsPanelRef={mobileSettingsPanelRef}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAiSettings={() => setAiDialogOpen(true)}
        onOpenAiInstructions={() => setAiInstructionDialogOpen(true)}
        uiLanguage={uiLanguage}
        languages={languages}
        onUiLanguageChange={(value) => handleUiLanguageChange(value as LanguageOption)}
        displayOrderSetting={displayOrderSetting}
        onDisplayOrderChange={handleDisplayOrderChange}
        onOpenLanguageSettings={() => setLanguageDialogOpen(true)}
        onOpenShadowing={() => setShadowingDialogOpen(true)}
        playbackNativeRepeat={playbackNativeRepeat}
        onPlaybackNativeRepeatChange={handlePlaybackNativeRepeatChange}
        playbackTargetRepeat={playbackTargetRepeat}
        onPlaybackTargetRepeatChange={handlePlaybackTargetRepeatChange}
        playbackPauseSeconds={playbackPauseSeconds}
        onPlaybackPauseSecondsChange={handlePlaybackPauseSecondsChange}
        onClearCache={() => setClearCacheOpen(true)}
        onDeleteAccount={() => setDeleteAccountOpen(true)}
        onSignOut={() => {
          signOutMutation
            .mutateAsync()
            .catch(() => {})
            .finally(() => {
              window.location.href = "/auth/login"
            })
        }}
      />

      <div className="md:flex">
        <ArticleSidebar
          sidebarCore={sidebarCore}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        <ArticleMain>
          <ArticleContentView
            t={t}
            showCreate={showCreate}
            isLoading={detailQuery.isLoading}
            detail={detailQuery.data}
            isCardMode={isCardMode}
            isRandomMode={isRandomMode}
            cardIndex={cardIndex}
            cardCount={cardCount}
            cardFlipped={cardFlipped}
            cardDragX={cardDragX}
            cardDragging={cardDragging}
            cardFrontText={cardFrontText}
            cardBackText={cardBackText}
            onCardFlip={handleCardFlip}
            onCardPrev={handleCardPrev}
            onCardNext={handleCardNext}
            onCardPlay={handleCardPlay}
            onCardPointerDown={handleCardPointerDown}
            onCardPointerMove={handleCardPointerMove}
            onCardPointerUp={handleCardPointerUp}
            onCardPointerCancel={handleCardPointerCancel}
            isLoopingAll={isLoopingAll}
            isLoopingTarget={isLoopingTarget}
            isLoopingSingle={isLoopingSingle}
            isLoopingShadowing={isLoopingShadowing}
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
            onToggleCardMode={toggleCardMode}
            onToggleCloze={toggleCloze}
            onToggleBlurTarget={handleToggleBlurTarget}
            onToggleBlurNative={handleToggleBlurNative}
            onStartAiInstruction={(instructionId) =>
              startAiTranslation(instructionId, false)
            }
            onCancelAi={cancelAiTranslation}
            onRetryMissing={retryMissingTranslations}
            onToggleMobileToolbar={toggleMobileToolbar}
            onCloseMobileToolbar={closeMobileToolbar}
            displayOrderSetting={displayOrderSetting}
            playingSentenceId={playingSentenceId}
            playingRole={playingRole}
            playingSpeed={playingSpeed}
            selectedSentenceId={selectedSentenceId}
            selectedSentenceRole={selectedSentenceRole}
            clozeRevealed={clozeRevealed}
            clozeInputs={clozeInputs}
            clozeResults={clozeResults}
            setClozeInputs={setClozeInputs}
            setClozeResults={setClozeResults}
            onSelectSentence={handleSentenceSelect}
            onPlaySentence={playSentenceRole}
            onPlayError={handlePlayError}
            onEditSentence={handleSentenceEdit}
            onDeleteSentence={handleSentenceDelete}
            onClozeCheck={handleClozeCheck}
            inputRef={inputRef}
            content={content}
            onChangeContent={setContent}
            onSubmitContent={handleCreate}
            isSubmitting={createMutation.isLoading}
            isError={createMutation.isError}
          />
        </ArticleMain>
      </div>

      <DialogsContainer />
      </div>
    </ArticleProviders>
  )
}

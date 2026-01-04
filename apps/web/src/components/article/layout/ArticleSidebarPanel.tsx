import type { TFunction } from "i18next"

import { Button } from "@sola/ui"

import { ArticleSidebarContent } from "@/components/article/layout/ArticleSidebarContent"
import { SettingsPanelTrigger } from "@/components/article/layout/SettingsPanelTrigger"

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"
type DisplayOrder = "native_first" | "target_first"

type ArticleListItem = {
  id: string
  title: string | null
}

type ArticleSidebarPanelProps = {
  t: TFunction<"translation">
  isLoading: boolean
  isError: boolean
  articles: ArticleListItem[]
  activeArticleId: string | null
  selectedIds: string[]
  deleteDisabled: boolean
  onToggleSelected: (id: string) => void
  onSelectArticle: (id: string) => void
  onCreate: () => void
  onDelete: () => void
  settingsOpen: boolean
  onToggleSettings: () => void
  settingsPanelRef: React.RefObject<HTMLDivElement | null>
  settingsButtonRef: React.RefObject<HTMLButtonElement | null>
  darkMode: boolean
  onToggleDarkMode: () => void
  onOpenAiSettings: () => void
  onOpenAiInstructions: () => void
  uiLanguage: LanguageOption
  languages: { value: LanguageOption; label: string }[]
  onUiLanguageChange: (value: string) => void
  displayOrderSetting: DisplayOrder
  onDisplayOrderChange: (value: DisplayOrder) => void
  onOpenLanguageSettings: () => void
  onOpenShadowing: () => void
  playbackNativeRepeat: number
  onPlaybackNativeRepeatChange: (value: number) => void
  playbackTargetRepeat: number
  onPlaybackTargetRepeatChange: (value: number) => void
  playbackPauseSeconds: number
  onPlaybackPauseSecondsChange: (value: number) => void
  onClearCache: () => void
  onDeleteAccount: () => void
  onSignOut: () => void
  userEmail: string
}

export const ArticleSidebarPanel = ({
  t,
  isLoading,
  isError,
  articles,
  activeArticleId,
  selectedIds,
  deleteDisabled,
  onToggleSelected,
  onSelectArticle,
  onCreate,
  onDelete,
  settingsOpen,
  onToggleSettings,
  settingsPanelRef,
  settingsButtonRef,
  darkMode,
  onToggleDarkMode,
  onOpenAiSettings,
  onOpenAiInstructions,
  uiLanguage,
  languages,
  onUiLanguageChange,
  displayOrderSetting,
  onDisplayOrderChange,
  onOpenLanguageSettings,
  onOpenShadowing,
  playbackNativeRepeat,
  onPlaybackNativeRepeatChange,
  playbackTargetRepeat,
  onPlaybackTargetRepeatChange,
  playbackPauseSeconds,
  onPlaybackPauseSecondsChange,
  onClearCache,
  onDeleteAccount,
  onSignOut,
  userEmail,
}: ArticleSidebarPanelProps) => {
  return (
    <>
      <div className="flex-none border-b p-4 space-y-2">
        <Button type="button" className="w-full justify-start" onClick={onCreate}>
          + {t("article.add")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          {t("article.bulkDelete")}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <ArticleSidebarContent
          t={t}
          isLoading={isLoading}
          isError={isError}
          articles={articles}
          activeArticleId={activeArticleId}
          selectedIds={selectedIds}
          onToggleSelected={onToggleSelected}
          onSelectArticle={onSelectArticle}
        />
      </div>

      <SettingsPanelTrigger
        t={t}
        settingsOpen={settingsOpen}
        onToggleSettings={onToggleSettings}
        settingsPanelRef={settingsPanelRef}
        settingsButtonRef={settingsButtonRef}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onOpenAiSettings={onOpenAiSettings}
        onOpenAiInstructions={onOpenAiInstructions}
        uiLanguage={uiLanguage}
        languages={languages}
        onUiLanguageChange={onUiLanguageChange}
        displayOrderSetting={displayOrderSetting}
        onDisplayOrderChange={onDisplayOrderChange}
        onOpenLanguageSettings={onOpenLanguageSettings}
        onOpenShadowing={onOpenShadowing}
        playbackNativeRepeat={playbackNativeRepeat}
        onPlaybackNativeRepeatChange={onPlaybackNativeRepeatChange}
        playbackTargetRepeat={playbackTargetRepeat}
        onPlaybackTargetRepeatChange={onPlaybackTargetRepeatChange}
        playbackPauseSeconds={playbackPauseSeconds}
        onPlaybackPauseSecondsChange={onPlaybackPauseSecondsChange}
        onClearCache={onClearCache}
        onDeleteAccount={onDeleteAccount}
        onSignOut={onSignOut}
        userEmail={userEmail}
      />
    </>
  )
}

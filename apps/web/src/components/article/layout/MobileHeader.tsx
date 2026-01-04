import * as React from "react"
import type { TFunction } from "i18next"

import { SettingsPanel } from "@/components/article/SettingsPanel"

type MobileHeaderProps = {
  t: TFunction<"translation">
  settingsOpen: boolean
  onToggleSettings: () => void
  onOpenMenu: () => void
  settingsButtonRef: React.Ref<HTMLButtonElement>
  settingsPanelRef: React.Ref<HTMLDivElement>
  darkMode: boolean
  onToggleDarkMode: () => void
  onOpenAiSettings: () => void
  onOpenAiInstructions: () => void
  uiLanguage: string
  languages: { value: string; label: string }[]
  onUiLanguageChange: (value: string) => void
  displayOrderSetting: "native_first" | "target_first"
  onDisplayOrderChange: (value: "native_first" | "target_first") => void
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
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  t,
  settingsOpen,
  onToggleSettings,
  onOpenMenu,
  settingsButtonRef,
  settingsPanelRef,
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
}) => {
  return (
    <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center text-muted-foreground"
        onClick={onOpenMenu}
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
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>
      <div className="text-sm font-semibold">Sola</div>
      <div className="relative">
        <button
          ref={settingsButtonRef}
          type="button"
          className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          onClick={onToggleSettings}
          aria-label={t("common.settings")}
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
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
        </button>
        {settingsOpen ? (
          <SettingsPanel
            t={t}
            panelRef={settingsPanelRef}
            className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-xs z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
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
          />
        ) : null}
      </div>
    </div>
  )
}

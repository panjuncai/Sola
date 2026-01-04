import * as React from "react"
import type { TFunction } from "i18next"

import { SettingsPanel } from "@/components/article/SettingsPanel"

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"

type SettingsPanelTriggerProps = {
  t: TFunction<"translation">
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
  userEmail: string
}

export const SettingsPanelTrigger = ({
  t,
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
}: SettingsPanelTriggerProps) => {
  return (
    <div className="flex-none border-t p-4">
      <div className="relative">
        {settingsOpen ? (
          <SettingsPanel
            t={t}
            panelRef={settingsPanelRef}
            className="absolute bottom-12 left-0 right-0 z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
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

        <button
          ref={settingsButtonRef}
          type="button"
          className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground"
          onClick={onToggleSettings}
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
          <span className="truncate">{userEmail || "Settings"}</span>
        </button>
      </div>
    </div>
  )
}

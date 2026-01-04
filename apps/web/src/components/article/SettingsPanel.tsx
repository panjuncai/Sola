import * as React from "react"
import type { TFunction } from "i18next"

import { Button, cn } from "@sola/ui"

type TranslateFn = TFunction<"translation">

type SettingsPanelProps = {
  t: TranslateFn
  panelRef?: React.Ref<HTMLDivElement>
  className?: string
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

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  t,
  panelRef,
  className,
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
    <div ref={panelRef} className={className}>
      <div className="px-4 py-3 text-sm font-semibold">{t("settings.title")}</div>
      <div className="space-y-3 border-t px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span>{t("settings.darkMode")}</span>
          <button
            type="button"
            className={cn(
              "relative h-5 w-10 rounded-full transition",
              darkMode ? "bg-primary" : "bg-muted"
            )}
            onClick={onToggleDarkMode}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition",
                darkMode ? "left-5" : "left-1"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.aiSettings")}</span>
          <Button type="button" variant="outline" className="h-8" onClick={onOpenAiSettings}>
            {t("settings.aiSettings")}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.aiInstructions")}</span>
          <Button
            type="button"
            variant="outline"
            className="h-8"
            onClick={onOpenAiInstructions}
          >
            {t("settings.aiInstructions")}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.uiLanguage")}</span>
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={uiLanguage}
            onChange={(event) => onUiLanguageChange(event.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.languageSettings")}</span>
          <Button
            type="button"
            variant="outline"
            className="h-8"
            onClick={onOpenLanguageSettings}
          >
            {t("settings.languageSettings")}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.languagePriority")}</span>
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={displayOrderSetting}
            onChange={(event) =>
              onDisplayOrderChange(event.target.value as "native_first" | "target_first")
            }
          >
            <option value="native_first">{t("settings.nativeFirst")}</option>
            <option value="target_first">{t("settings.targetFirst")}</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.shadowingConfig")}</span>
          <Button type="button" variant="outline" className="h-8" onClick={onOpenShadowing}>
            {t("settings.shadowing")}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.playbackNativeRepeat")}</span>
          <input
            type="number"
            min={0}
            className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
            value={playbackNativeRepeat}
            onChange={(event) => {
              const value = Number(event.target.value)
              onPlaybackNativeRepeatChange(Number.isFinite(value) ? value : 0)
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.playbackTargetRepeat")}</span>
          <input
            type="number"
            min={0}
            className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
            value={playbackTargetRepeat}
            onChange={(event) => {
              const value = Number(event.target.value)
              onPlaybackTargetRepeatChange(Number.isFinite(value) ? value : 0)
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span>{t("settings.playbackPauseSeconds")}</span>
          <input
            type="number"
            min={0}
            step={1}
            className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
            value={playbackPauseSeconds}
            onChange={(event) => {
              const value = Number(event.target.value)
              onPlaybackPauseSecondsChange(Number.isFinite(value) ? value : 0)
            }}
          />
        </div>

        <div className="pt-1">
          <Button type="button" variant="outline" className="w-full" onClick={onClearCache}>
            {t("settings.clearCache")}
          </Button>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={onDeleteAccount}
          >
            {t("settings.deleteAccount")}
          </Button>
        </div>

        <div className="pt-2">
          <Button type="button" variant="outline" className="w-full" onClick={onSignOut}>
            {t("settings.signOut")}
          </Button>
        </div>
      </div>
    </div>
  )
}

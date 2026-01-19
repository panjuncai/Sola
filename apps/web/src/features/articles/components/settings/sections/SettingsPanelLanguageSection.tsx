import type { DisplayOrder, LanguageOption } from "@sola/shared"

import { Button } from "@sola/ui"

import { useSidebarPanelView } from "@/features/articles"
import { SettingsPanelRow } from "../SettingsPanelRow"

export const SettingsPanelLanguageSection = () => {
  const {
    t,
    uiLanguage,
    languages,
    onUiLanguageChange,
    onOpenLanguageSettings,
    displayOrderSetting,
    onDisplayOrderChange,
  } = useSidebarPanelView()

  return (
    <>
      <SettingsPanelRow label={t("settings.uiLanguage")}>
        <select
          className="h-8 rounded-md border bg-background px-2 text-sm"
          value={uiLanguage}
          onChange={(event) =>
            onUiLanguageChange(event.target.value as LanguageOption)
          }
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </SettingsPanelRow>

      <SettingsPanelRow label={t("settings.languageSettings")}>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={onOpenLanguageSettings}
        >
          {t("settings.languageSettings")}
        </Button>
      </SettingsPanelRow>

      <SettingsPanelRow label={t("settings.languagePriority")}>
        <select
          className="h-8 rounded-md border bg-background px-2 text-sm"
          value={displayOrderSetting}
          onChange={(event) =>
            onDisplayOrderChange(event.target.value as DisplayOrder)
          }
        >
          <option value="native_first">{t("settings.nativeFirst")}</option>
          <option value="target_first">{t("settings.targetFirst")}</option>
        </select>
      </SettingsPanelRow>
    </>
  )
}

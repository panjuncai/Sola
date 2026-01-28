import { cn } from "@sola/ui"

import { useSidebarPanelView } from "../../../hooks/view/useSidebarPanelView"
import { SettingsPanelRow } from "../SettingsPanelRow"

export const SettingsPanelAppearanceSection = () => {
  const { t, darkMode, onToggleDarkMode } = useSidebarPanelView()

  return (
    <SettingsPanelRow label={t("settings.darkMode")}>
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
    </SettingsPanelRow>
  )
}

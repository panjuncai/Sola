import { Button } from "@sola/ui"

import { useSidebarPanelView } from "../../../../articles/hooks/view/useSidebarPanelView"
import { SettingsPanelRow } from "../SettingsPanelRow"

export const SettingsPanelAiSection = () => {
  const { t, onOpenAiSettings, onOpenAiInstructions } = useSidebarPanelView()

  return (
    <>
      <SettingsPanelRow label={t("settings.aiSettings")}>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={onOpenAiSettings}
        >
          {t("settings.aiSettings")}
        </Button>
      </SettingsPanelRow>

      <SettingsPanelRow label={t("settings.aiInstructions")}>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={onOpenAiInstructions}
        >
          {t("settings.aiInstructions")}
        </Button>
      </SettingsPanelRow>
    </>
  )
}

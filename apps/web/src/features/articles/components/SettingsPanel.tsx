import { useSidebarPanelView } from "@/features/articles"

import { SettingsPanelActionsSection } from "./settings/sections/SettingsPanelActionsSection"
import { SettingsPanelAiSection } from "./settings/sections/SettingsPanelAiSection"
import { SettingsPanelAppearanceSection } from "./settings/sections/SettingsPanelAppearanceSection"
import { SettingsPanelLanguageSection } from "./settings/sections/SettingsPanelLanguageSection"
import { SettingsPanelPlaybackSection } from "./settings/sections/SettingsPanelPlaybackSection"

type SettingsPanelProps = {
  className?: string
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ className }) => {
  const {
    t,
    settingsPanelRef,
  } = useSidebarPanelView()

  return (
    <div ref={settingsPanelRef} className={className}>
      <div className="px-4 py-3 text-sm font-semibold">{t("settings.title")}</div>
      <div className="space-y-3 border-t px-4 py-3 text-sm">
        <SettingsPanelAppearanceSection />
        <SettingsPanelAiSection />
        <SettingsPanelLanguageSection />
        <SettingsPanelPlaybackSection />
        <SettingsPanelActionsSection />
      </div>
    </div>
  )
}

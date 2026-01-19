import { useSidebarPanelView } from "@/features/articles"

import { SettingsPanelPopover } from "./SettingsPanelPopover"
import { SettingsTriggerButton } from "./SettingsTriggerButton"

export const SettingsPanelTrigger = () => {
  const {
    settingsOpen,
    toggleSettings,
    settingsButtonRef,
    settingsTriggerLabel,
  } = useSidebarPanelView()

  return (
    <div className="flex-none border-t p-4">
      <div className="relative">
        <SettingsPanelPopover open={settingsOpen} />
        <SettingsTriggerButton
          ref={settingsButtonRef}
          label={settingsTriggerLabel}
          onClick={toggleSettings}
        />
      </div>
    </div>
  )
}

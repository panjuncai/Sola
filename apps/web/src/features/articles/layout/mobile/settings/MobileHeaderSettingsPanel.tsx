import { SettingsPanel } from "../../../components/SettingsPanel"
import { useSidebarPanelView } from "../../../hooks/view/useSidebarPanelView"

export const MobileHeaderSettingsPanel = () => {
  const { settingsOpen } = useSidebarPanelView()

  if (!settingsOpen) return null

  return (
    <SettingsPanel className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-xs z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]" />
  )
}

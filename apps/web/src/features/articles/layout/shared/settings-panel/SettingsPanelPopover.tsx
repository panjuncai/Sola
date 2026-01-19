import { SettingsPanel } from "@/features/articles"

type SettingsPanelPopoverProps = {
  open: boolean
}

export const SettingsPanelPopover = ({ open }: SettingsPanelPopoverProps) => {
  if (!open) return null

  return (
    <SettingsPanel className="absolute bottom-12 left-0 right-0 z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]" />
  )
}

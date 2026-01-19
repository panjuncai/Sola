import { useSidebarPanelView } from "@/features/articles"
import { SettingsPanelActions } from "../SettingsPanelActions"

export const SettingsPanelActionsSection = () => {
  const { t, onClearCache, onDeleteAccount, onSignOut } = useSidebarPanelView()

  return (
    <SettingsPanelActions
      clearLabel={t("settings.clearCache")}
      deleteLabel={t("settings.deleteAccount")}
      signOutLabel={t("settings.signOut")}
      onClear={onClearCache}
      onDelete={onDeleteAccount}
      onSignOut={onSignOut}
    />
  )
}

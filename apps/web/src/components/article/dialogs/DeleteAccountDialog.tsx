import { useTranslation } from "react-i18next"

import { DeleteAccountDialog as DeleteAccountDialogView } from "@/components/article/DeleteAccountDialog"
import { useSettingsDialogs } from "@/hooks/useSettingsDialogs"

export const DeleteAccountDialog = () => {
  const { t } = useTranslation()
  const {
    deleteAccountOpen,
    setDeleteAccountOpen,
    deleteAccountMutation,
    handleDeleteAccount,
  } = useSettingsDialogs()

  return (
    <DeleteAccountDialogView
      t={t}
      open={deleteAccountOpen}
      onOpenChange={setDeleteAccountOpen}
      isLoading={deleteAccountMutation.isLoading}
      onConfirm={handleDeleteAccount}
    />
  )
}

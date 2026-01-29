import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

import { DialogCancelButton } from "@sola/ui"
import { DeleteAccountConfirmButton } from "../../articles/components/ArticleDialogActions"
const DeleteAccountDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("settings.deleteAccountTitle")}</>
}

const DeleteAccountDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("settings.deleteAccountDesc")}</>
}
import { useSettingsDialogs } from "../../articles/hooks/init/useInitSettingsDialogs"

export const DeleteAccountDialog = () => {
  const { t } = useTranslation()
  const {
    deleteAccountOpen,
    setDeleteAccountOpen,
    deleteAccountMutation,
    handleDeleteAccount,
  } = useSettingsDialogs()

  return (
    <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <DeleteAccountDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <DeleteAccountDialogDescription />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <DeleteAccountConfirmButton
            disabled={deleteAccountMutation.isLoading}
            onClick={handleDeleteAccount}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

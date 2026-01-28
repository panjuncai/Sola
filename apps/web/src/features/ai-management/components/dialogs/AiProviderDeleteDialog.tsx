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

import {
  DialogCancelButton,
  DialogDeleteButton,
} from "@sola/ui"
import {
  AiProviderDeleteDialogDescription,
  AiProviderDeleteDialogTitle,
} from "../AiDialogStates"
import { useAiManagementRequired } from "../../hooks/init/useInitAiManagement"

export const AiProviderDeleteDialog = () => {
  const { t } = useTranslation()
  const { aiProviderDeleteId, setAiProviderDeleteId, removeAiProvider } =
    useAiManagementRequired()

  const open = Boolean(aiProviderDeleteId)
  return (
    <Dialog open={open} onOpenChange={() => setAiProviderDeleteId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <AiProviderDeleteDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <AiProviderDeleteDialogDescription />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <DialogDeleteButton label={t("common.delete")} onClick={removeAiProvider} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

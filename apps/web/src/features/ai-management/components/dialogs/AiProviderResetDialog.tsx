import { useTranslation } from "react-i18next"

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

import { DialogCancelButton } from "@sola/ui"
import {
  AiProviderResetDialogDescription,
  AiProviderResetDialogTitle,
} from "../AiDialogStates"
import { useAiManagementRequired } from "../../hooks/init/useInitAiManagement"

export const AiProviderResetDialog = () => {
  const { t } = useTranslation()
  const { aiProviderResetOpen, setAiProviderResetOpen, resetAiProviders } =
    useAiManagementRequired()
  return (
    <Dialog open={aiProviderResetOpen} onOpenChange={setAiProviderResetOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <AiProviderResetDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <AiProviderResetDialogDescription />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <Button type="button" onClick={resetAiProviders}>
            {t("ai.resetConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

import { useAiManagement } from "@/hooks/useAiManagement"

export const AiProviderResetDialog = () => {
  const { t } = useTranslation()
  const { aiProviderResetOpen, setAiProviderResetOpen, resetAiProviders } =
    useAiManagement()
  return (
    <Dialog open={aiProviderResetOpen} onOpenChange={setAiProviderResetOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.resetTitle")}</DialogTitle>
          <DialogDescription>{t("ai.resetDesc")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" onClick={resetAiProviders}>
            {t("ai.resetConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

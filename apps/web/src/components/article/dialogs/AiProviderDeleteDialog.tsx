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

export const AiProviderDeleteDialog = () => {
  const { t } = useTranslation()
  const { aiProviderDeleteId, setAiProviderDeleteId, removeAiProvider } =
    useAiManagement()

  const open = Boolean(aiProviderDeleteId)
  return (
    <Dialog open={open} onOpenChange={() => setAiProviderDeleteId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.deleteProviderTitle")}</DialogTitle>
          <DialogDescription>{t("ai.deleteProviderDesc")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={removeAiProvider}>
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

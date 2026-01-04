import * as React from "react"
import type { TFunction } from "i18next"

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

type TranslateFn = TFunction<"translation">

type AiProviderDeleteDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const AiProviderDeleteDialog: React.FC<AiProviderDeleteDialogProps> = ({
  t,
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

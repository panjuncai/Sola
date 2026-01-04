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

type AiProviderResetDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const AiProviderResetDialog: React.FC<AiProviderResetDialogProps> = ({
  t,
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button type="button" onClick={onConfirm}>
            {t("ai.resetConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

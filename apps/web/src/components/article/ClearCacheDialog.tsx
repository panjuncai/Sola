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

type ClearCacheDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const ClearCacheDialog: React.FC<ClearCacheDialogProps> = ({
  t,
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.clearCacheTitle")}</DialogTitle>
          <DialogDescription>{t("settings.clearCacheDesc")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={onConfirm}>
              {t("common.confirm")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

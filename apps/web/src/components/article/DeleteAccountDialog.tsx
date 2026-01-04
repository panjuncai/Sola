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

type DeleteAccountDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  onConfirm: () => void
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  t,
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.deleteAccountTitle")}</DialogTitle>
          <DialogDescription>{t("settings.deleteAccountDesc")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {t("settings.deleteAccountConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

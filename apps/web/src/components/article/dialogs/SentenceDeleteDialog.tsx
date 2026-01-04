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

type SentenceDeleteDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  isDisabled: boolean
  onConfirm: () => void
}

export const SentenceDeleteDialog: React.FC<SentenceDeleteDialogProps> = ({
  t,
  open,
  onOpenChange,
  isLoading,
  isDisabled,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("article.deleteSentenceTitle")}</DialogTitle>
          <DialogDescription>{t("article.deleteSentenceDesc")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isDisabled || isLoading}
            onClick={onConfirm}
          >
            {t("article.deleteSentenceConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

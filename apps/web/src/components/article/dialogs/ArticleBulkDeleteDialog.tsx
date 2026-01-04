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

type ArticleBulkDeleteDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  deleteCount: number
  isLoading: boolean
  onConfirm: () => void
}

export const ArticleBulkDeleteDialog: React.FC<ArticleBulkDeleteDialogProps> = ({
  t,
  open,
  onOpenChange,
  deleteCount,
  isLoading,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("article.confirmDeleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("article.confirmDeleteDesc", { count: deleteCount })}
          </DialogDescription>
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
            {t("article.confirmDeleteAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

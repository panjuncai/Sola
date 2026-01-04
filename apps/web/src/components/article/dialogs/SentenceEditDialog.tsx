import * as React from "react"
import type { TFunction } from "i18next"

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

type TranslateFn = TFunction<"translation">

type SentenceEditDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  nativeText: string
  targetText: string
  onChangeNative: (value: string) => void
  onChangeTarget: (value: string) => void
  onSave: () => void
  isSaving: boolean
  isDisabled: boolean
}

export const SentenceEditDialog: React.FC<SentenceEditDialogProps> = ({
  t,
  open,
  onOpenChange,
  nativeText,
  targetText,
  onChangeNative,
  onChangeTarget,
  onSave,
  isSaving,
  isDisabled,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("article.editSentenceTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("article.editSentenceNative")}
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={nativeText}
              onChange={(event) => onChangeNative(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("article.editSentenceTarget")}
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={targetText}
              onChange={(event) => onChangeTarget(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <Button disabled={isDisabled || isSaving} onClick={onSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

import { DialogCancelButton } from "@sola/ui"
import {
  SentenceEditSaveButton,
  SentenceEditDialogTitle,
  useSentenceOperations,
} from "@/features/articles"

export const SentenceEditDialog = () => {
  const { t } = useTranslation()
  const {
    sentenceEditOpen,
    setSentenceEditOpen,
    sentenceEditing,
    setSentenceEditing,
    isSaving,
    handleEditSave,
  } = useSentenceOperations()

  return (
    <Dialog
      open={sentenceEditOpen}
      onOpenChange={(open) => {
        setSentenceEditOpen(open)
        if (!open) {
          setSentenceEditing(null)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <SentenceEditDialogTitle />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("article.editSentenceNative")}
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={sentenceEditing?.nativeText ?? ""}
              onChange={(event) =>
                setSentenceEditing((prev) =>
                  prev ? { ...prev, nativeText: event.target.value } : prev
                )
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("article.editSentenceTarget")}
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={sentenceEditing?.targetText ?? ""}
              onChange={(event) =>
                setSentenceEditing((prev) =>
                  prev ? { ...prev, targetText: event.target.value } : prev
                )
              }
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <SentenceEditSaveButton
            disabled={!sentenceEditing || isSaving}
            onClick={handleEditSave}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

import { DialogCancelButton } from "@sola/ui"
import { SentenceDeleteConfirmButton } from "../ArticleDialogActions"
import {
  SentenceDeleteDialogDescription,
  SentenceDeleteDialogTitle,
} from "../ArticleDialogStates"
import { useSentenceOperations } from "../../hooks/init/useInitSentenceOperations"

export const SentenceDeleteDialog = () => {
  const { t } = useTranslation()
  const {
    sentenceDeleteOpen,
    setSentenceDeleteOpen,
    sentenceDeleteId,
    setSentenceDeleteId,
    isDeleting,
    handleDeleteConfirm,
  } = useSentenceOperations()

  return (
    <Dialog
      open={sentenceDeleteOpen}
      onOpenChange={(open) => {
        setSentenceDeleteOpen(open)
        if (!open) {
          setSentenceDeleteId(null)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <SentenceDeleteDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <SentenceDeleteDialogDescription />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <SentenceDeleteConfirmButton
            disabled={!sentenceDeleteId || isDeleting}
            onClick={handleDeleteConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { ArticleBulkDeleteConfirmButton } from "../ArticleDialogActions"
import {
  ArticleBulkDeleteDialogDescription,
  ArticleBulkDeleteDialogTitle,
} from "../ArticleDialogStates"
import { useArticleBulkDeleteDialogView } from "../../hooks/view/useArticleBulkDeleteDialogView"

export const ArticleBulkDeleteDialog = () => {
  const { t } = useTranslation()
  const {
    bulkDeleteOpen,
    setBulkDeleteOpen,
    deleteTargetsLength,
    isDeleting,
    handleConfirm,
  } = useArticleBulkDeleteDialogView()

  return (
    <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <ArticleBulkDeleteDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <ArticleBulkDeleteDialogDescription count={deleteTargetsLength} />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <ArticleBulkDeleteConfirmButton
            disabled={isDeleting}
            onClick={handleConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useTranslation } from "react-i18next"

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

import { useSentenceOperations } from "@/hooks/useSentenceOperations"

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
          <DialogTitle>{t("article.deleteSentenceTitle")}</DialogTitle>
          <DialogDescription>{t("article.deleteSentenceDesc")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={!sentenceDeleteId || isDeleting}
            onClick={handleDeleteConfirm}
          >
            {t("article.deleteSentenceConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

import { useArticleDialogsActions, useArticleDialogsState } from "@/atoms/articleDialogs"
import { useArticlesContext } from "@/hooks/useArticles"

export const ArticleBulkDeleteDialog = () => {
  const { t } = useTranslation()
  const { bulkDeleteOpen } = useArticleDialogsState()
  const { setBulkDeleteOpen } = useArticleDialogsActions()
  const { deleteTargets, deleteMutation } = useArticlesContext()

  return (
    <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("article.confirmDeleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("article.confirmDeleteDesc", { count: deleteTargets.length })}
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
            disabled={deleteMutation.isLoading}
            onClick={() => {
              if (deleteTargets.length === 0) {
                setBulkDeleteOpen(false)
                return
              }
              deleteMutation
                .mutateAsync({ articleIds: deleteTargets })
                .finally(() => {
                  setBulkDeleteOpen(false)
                })
            }}
          >
            {t("article.confirmDeleteAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

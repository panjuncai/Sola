import * as React from "react"

import { useArticleDialogsActions, useArticleDialogsState } from "../../atoms/articleDialogs"
import { useArticlesContext } from "../init/useInitArticles"

export const useArticleBulkDeleteDialogView = () => {
  const { bulkDeleteOpen } = useArticleDialogsState()
  const { setBulkDeleteOpen } = useArticleDialogsActions()
  const { deleteTargets, deleteMutation } = useArticlesContext()

  const handleConfirm = React.useCallback(() => {
    if (deleteTargets.length === 0) {
      setBulkDeleteOpen(false)
      return Promise.resolve()
    }
    return deleteMutation.mutateAsync({ articleIds: deleteTargets }).finally(() => {
      setBulkDeleteOpen(false)
    })
  }, [deleteTargets, deleteMutation, setBulkDeleteOpen])

  return {
    bulkDeleteOpen,
    setBulkDeleteOpen,
    deleteTargetsLength: deleteTargets.length,
    isDeleting: deleteMutation.isLoading,
    handleConfirm,
  }
}

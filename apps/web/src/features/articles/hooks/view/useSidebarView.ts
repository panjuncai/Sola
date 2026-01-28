import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useMobileMenuActions } from "../../atoms/mobileMenu"
import { useArticleDialogsActions } from "../../atoms/articleDialogs"
import { useArticlesContext } from "../init/useInitArticles"
import { useArticleCreateInputRef } from "../state/useArticleCreateInputState"

export const useSidebarView = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setMobileMenuOpen } = useMobileMenuActions()
  const { setBulkDeleteOpen } = useArticleDialogsActions()
  const { deleteTargets, deleteMutation, setIsCreating } = useArticlesContext()
  const inputRef = useArticleCreateInputRef()
  const deleteDisabled = deleteTargets.length === 0 || deleteMutation.isLoading

  const handleCreateClick = React.useCallback(() => {
    setIsCreating(true)
    inputRef?.current?.focus()
    setMobileMenuOpen(false)
  }, [inputRef, setIsCreating, setMobileMenuOpen])

  const handleDeleteClick = React.useCallback(() => {
    if (deleteDisabled) return
    setBulkDeleteOpen(true)
  }, [deleteDisabled, setBulkDeleteOpen])

  const handleSelectArticle = React.useCallback(
    (articleId: string) => {
      setIsCreating(false)
      navigate(`/articles/${articleId}`)
      setMobileMenuOpen(false)
    },
    [navigate, setIsCreating, setMobileMenuOpen]
  )

  return {
    handleCreateClick,
    handleDeleteClick,
    handleSelectArticle,
    deleteDisabled,
    deleteTargetsLength: deleteTargets.length,
    addLabel: t("article.add"),
    bulkDeleteLabel: t("article.bulkDelete"),
    closeLabel: t("common.close"),
  }
}

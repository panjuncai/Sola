import * as React from "react"

type UseSidebarViewParams = {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  setIsCreating: (value: boolean) => void
  setMobileMenuOpen: (value: boolean) => void
  setActiveArticleId: (value: string | null) => void
  setConfirmOpen: (value: boolean) => void
  deleteTargetsLength: number
  deleteLoading: boolean
}

export const useSidebarView = ({
  inputRef,
  setIsCreating,
  setMobileMenuOpen,
  setActiveArticleId,
  setConfirmOpen,
  deleteTargetsLength,
  deleteLoading,
}: UseSidebarViewParams) => {
  const handleCreateClick = React.useCallback(() => {
    setIsCreating(true)
    inputRef.current?.focus()
    setMobileMenuOpen(false)
  }, [inputRef, setIsCreating, setMobileMenuOpen])

  const handleDeleteClick = React.useCallback(() => {
    if (deleteTargetsLength === 0 || deleteLoading) return
    setConfirmOpen(true)
  }, [deleteLoading, deleteTargetsLength, setConfirmOpen])

  const handleSelectArticle = React.useCallback(
    (articleId: string) => {
      setIsCreating(false)
      setActiveArticleId(articleId)
      setMobileMenuOpen(false)
    },
    [setActiveArticleId, setIsCreating, setMobileMenuOpen]
  )

  return {
    handleCreateClick,
    handleDeleteClick,
    handleSelectArticle,
  }
}

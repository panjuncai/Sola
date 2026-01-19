import { useArticlesContext, useSidebarView } from "@/features/articles"
import { ArticleSidebarContentStates } from "./sidebar-content/ArticleSidebarContentStates"
import { ArticleSidebarContentBody } from "./sidebar-content/ArticleSidebarContentBody"

export const ArticleSidebarContent = () => {
  const {
    list,
    isLoading,
    isError,
    activeArticleId,
    selectedIds,
    toggleSelected,
  } = useArticlesContext()
  const { handleSelectArticle } = useSidebarView()
  const isEmpty = list.length === 0

  return (
    <>
      <ArticleSidebarContentStates
        isLoading={isLoading}
        isError={isError}
        isEmpty={isEmpty}
      />
      <ArticleSidebarContentBody
        list={list}
        isLoading={isLoading}
        isError={isError}
        activeArticleId={activeArticleId}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onSelectArticle={handleSelectArticle}
      />
    </>
  )
}

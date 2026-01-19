import type { ArticleListItem } from "@sola/shared"
import { ArticleSidebarContentList } from "./ArticleSidebarContentList"

type ArticleSidebarContentBodyProps = {
  list: ArticleListItem[]
  isLoading: boolean
  isError: boolean
  activeArticleId: string | null
  selectedIds: string[]
  onToggleSelected: (id: string) => void
  onSelectArticle: (id: string) => void
}

export const ArticleSidebarContentBody = ({
  list,
  isLoading,
  isError,
  activeArticleId,
  selectedIds,
  onToggleSelected,
  onSelectArticle,
}: ArticleSidebarContentBodyProps) => {
  if (isLoading || isError || list.length === 0) {
    return null
  }

  return (
    <ArticleSidebarContentList
      list={list}
      activeArticleId={activeArticleId}
      selectedIds={selectedIds}
      onToggleSelected={onToggleSelected}
      onSelectArticle={onSelectArticle}
    />
  )
}

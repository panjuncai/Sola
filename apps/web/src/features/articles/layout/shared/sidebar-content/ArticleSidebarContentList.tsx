import { ArticleSidebarContentListBody } from "./ArticleSidebarContentListBody"

type ArticleSidebarContentListProps = {
  list: Array<{
    id: string
    title: string | null
  }>
  activeArticleId: string | null
  selectedIds: string[]
  onToggleSelected: (articleId: string) => void
  onSelectArticle: (articleId: string) => void
}

export const ArticleSidebarContentList = ({
  list,
  activeArticleId,
  selectedIds,
  onToggleSelected,
  onSelectArticle,
}: ArticleSidebarContentListProps) => {
  if (list.length === 0) {
    return null
  }

  return (
    <ArticleSidebarContentListBody
      list={list}
      activeArticleId={activeArticleId}
      selectedIds={selectedIds}
      onToggleSelected={onToggleSelected}
      onSelectArticle={onSelectArticle}
    />
  )
}

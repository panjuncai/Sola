import { ArticleSidebarListItemRow } from "./ArticleSidebarListItemRow"

type ArticleSidebarContentListBodyProps = {
  list: Array<{
    id: string
    title: string | null
  }>
  activeArticleId: string | null
  selectedIds: string[]
  onToggleSelected: (articleId: string) => void
  onSelectArticle: (articleId: string) => void
}

export const ArticleSidebarContentListBody = ({
  list,
  activeArticleId,
  selectedIds,
  onToggleSelected,
  onSelectArticle,
}: ArticleSidebarContentListBodyProps) => {
  return (
    <>
      {list.map((article) => (
        <ArticleSidebarListItemRow
          key={article.id}
          article={article}
          activeArticleId={activeArticleId}
          selectedIds={selectedIds}
          onToggleSelected={onToggleSelected}
          onSelectArticle={onSelectArticle}
        />
      ))}
    </>
  )
}

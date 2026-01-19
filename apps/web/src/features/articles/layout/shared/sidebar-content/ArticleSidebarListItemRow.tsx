import { ArticleSidebarListItem } from "./ArticleSidebarListItem"

type ArticleSidebarListItemRowProps = {
  article: {
    id: string
    title: string | null
  }
  activeArticleId: string | null
  selectedIds: string[]
  onToggleSelected: (articleId: string) => void
  onSelectArticle: (articleId: string) => void
}

export const ArticleSidebarListItemRow = ({
  article,
  activeArticleId,
  selectedIds,
  onToggleSelected,
  onSelectArticle,
}: ArticleSidebarListItemRowProps) => {
  return (
    <ArticleSidebarListItem
      article={article}
      active={activeArticleId === article.id}
      checked={selectedIds.includes(article.id)}
      onToggle={() => onToggleSelected(article.id)}
      onSelect={() => onSelectArticle(article.id)}
    />
  )
}

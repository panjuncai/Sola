import type { TFunction } from "i18next"

import { cn } from "@sola/ui"

type ArticleListItem = {
  id: string
  title: string | null
}

type ArticleSidebarContentProps = {
  t: TFunction<"translation">
  isLoading: boolean
  isError: boolean
  articles: ArticleListItem[]
  activeArticleId: string | null
  selectedIds: string[]
  onToggleSelected: (id: string) => void
  onSelectArticle: (id: string) => void
}

export const ArticleSidebarContent = ({
  t,
  isLoading,
  isError,
  articles,
  activeArticleId,
  selectedIds,
  onToggleSelected,
  onSelectArticle,
}: ArticleSidebarContentProps) => {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
  }

  if (isError) {
    return <div className="text-sm text-muted-foreground">{t("common.loadFailed")}</div>
  }

  if (articles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">{t("article.noArticles")}</div>
    )
  }

  return (
    <>
      {articles.map((article) => (
        <div
          key={article.id}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2 py-2 text-sm",
            activeArticleId === article.id && "border-primary/60 bg-primary/5"
          )}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(article.id)}
            onChange={() => onToggleSelected(article.id)}
            aria-label="Select article"
          />
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left font-medium"
            onClick={() => onSelectArticle(article.id)}
          >
            {article.title ?? t("article.untitled")}
          </button>
        </div>
      ))}
    </>
  )
}

import { ArticleEntity } from "@sola/logic"
import { useTranslation } from "react-i18next"

type ArticleSidebarListItemTitleProps = {
  title: string | null
  onSelect: () => void
}

export const ArticleSidebarListItemTitle = ({
  title,
  onSelect,
}: ArticleSidebarListItemTitleProps) => {
  const { t } = useTranslation()
  const displayTitle = new ArticleEntity({ id: "sidebar", title }).getTitle()

  return (
    <button
      type="button"
      className="min-w-0 flex-1 truncate text-left font-medium"
      onClick={onSelect}
    >
      {displayTitle ?? t("article.untitled")}
    </button>
  )
}

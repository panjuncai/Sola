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

  return (
    <button
      type="button"
      className="min-w-0 flex-1 truncate text-left font-medium"
      onClick={onSelect}
    >
      {title ?? t("article.untitled")}
    </button>
  )
}

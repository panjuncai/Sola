import { useTranslation } from "react-i18next"

export const ArticleListLoadingState = () => {
  const { t } = useTranslation()
  return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
}

export const ArticleListErrorState = () => {
  const { t } = useTranslation()
  return <div className="text-sm text-muted-foreground">{t("common.loadFailed")}</div>
}

export const ArticleListEmptyState = () => {
  const { t } = useTranslation()
  return <div className="text-sm text-muted-foreground">{t("article.noArticles")}</div>
}

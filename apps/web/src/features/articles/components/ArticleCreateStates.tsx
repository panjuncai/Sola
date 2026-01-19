import { useTranslation } from "react-i18next"

export const ArticleCreateErrorState = () => {
  const { t } = useTranslation()
  return (
    <div className="text-center text-sm text-destructive">
      {t("article.submitFailed")}
    </div>
  )
}

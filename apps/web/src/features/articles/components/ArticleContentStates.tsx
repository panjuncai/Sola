import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@sola/ui"

export const ArticleContentHero = () => {
  const { t } = useTranslation()

  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-semibold">{t("article.heroTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("article.heroSubtitle")}</p>
    </div>
  )
}

export const ArticleContentLoadingState = () => {
  const { t } = useTranslation()
  return <div className="text-sm text-muted-foreground">{t("article.loading")}</div>
}

export const ArticleContentEmptySentences = () => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="py-6 text-sm text-muted-foreground">
        {t("article.noSentences")}
      </CardContent>
    </Card>
  )
}

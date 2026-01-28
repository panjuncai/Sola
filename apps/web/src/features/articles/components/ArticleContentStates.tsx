import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@sola/ui"

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

import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@sola/ui"

export const CardModeEmptyState = () => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="py-6 text-center text-sm text-muted-foreground">
        {t("article.noSentences")}
      </CardContent>
    </Card>
  )
}

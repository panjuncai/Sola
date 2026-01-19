import { Button } from "@sola/ui"

import { useArticleToolbarView } from "../../../hooks/view/useArticleToolbarView"

export const ToolbarProgress = () => {
  const { t, ai } = useArticleToolbarView()
  const { aiProgress, missingNativeCount, cancelAiTranslation, retryMissingTranslations } =
    ai

  if (aiProgress?.running) {
    return (
      <div className="space-y-2 text-xs text-muted-foreground">
        <div>
          {t("ai.translationProgress", {
            completed: aiProgress.completed,
            total: aiProgress.total,
          })}
        </div>
        <Button type="button" variant="outline" onClick={cancelAiTranslation}>
          {t("ai.cancel")}
        </Button>
      </div>
    )
  }

  if (!aiProgress?.running && aiProgress?.completed && missingNativeCount > 0) {
    return (
      <div className="space-y-2 text-xs text-muted-foreground">
        <div>{t("ai.translationMissing", { count: missingNativeCount })}</div>
        <Button type="button" variant="outline" onClick={retryMissingTranslations}>
          {t("ai.retryMissing")}
        </Button>
      </div>
    )
  }

  return null
}

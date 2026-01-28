import { useTranslation } from "react-i18next"
import { Button } from "@sola/ui"

import { useAiManagementRequired } from "@/features/ai-management"

export const ToolbarProgress = () => {
  const { t } = useTranslation()
  const ai = useAiManagementRequired()
  const { aiProgress, missingNativeCount, cancelAiTranslation, retryMissingTranslations } =
    ai

  if (aiProgress?.running) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>
          {t("ai.translationProgress", {
            completed: aiProgress.completed,
            total: aiProgress.total,
          })}
        </span>
        <Button type="button" variant="outline" onClick={cancelAiTranslation}>
          {t("ai.cancel")}
        </Button>
      </div>
    )
  }

  if (!aiProgress?.running && aiProgress?.completed && missingNativeCount > 0) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>{t("ai.translationMissing", { count: missingNativeCount })}</span>
        <Button type="button" variant="outline" onClick={retryMissingTranslations}>
          {t("ai.retryMissing")}
        </Button>
      </div>
    )
  }

  return null
}

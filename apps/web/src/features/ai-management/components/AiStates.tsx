import { useTranslation } from "react-i18next"

export const AiNoProvidersState = () => {
  const { t } = useTranslation()
  return <div className="text-sm text-muted-foreground">{t("ai.noProviders")}</div>
}

export const AiNoInstructionsState = () => {
  const { t } = useTranslation()
  return <div className="text-muted-foreground">{t("ai.noInstructions")}</div>
}

export const AiNoPublicInstructionsState = () => {
  const { t } = useTranslation()
  return <div className="text-muted-foreground">{t("ai.noPublicInstructions")}</div>
}

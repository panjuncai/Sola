import { useTranslation } from "react-i18next"

export const AiProviderDeleteDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.deleteProviderTitle")}</>
}

export const AiProviderDeleteDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.deleteProviderDesc")}</>
}

export const AiProviderResetDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.resetTitle")}</>
}

export const AiProviderResetDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.resetDesc")}</>
}

export const AiProviderAddDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.addCustomTitle")}</>
}

export const AiProviderAddDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.addCustomDesc")}</>
}

export const AiProviderEditDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.editProviderTitle")}</>
}

export const AiProviderEditDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.editProviderDesc")}</>
}

export const AiInstructionsDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.instructionsTitle")}</>
}

export const AiInstructionsDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.instructionsDesc")}</>
}

export const AiInstructionEditDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.editInstructionTitle")}</>
}

export const AiInstructionAddDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.addInstructionTitle")}</>
}

export const AiInstructionAddDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.addInstructionDesc")}</>
}

export const AiInstructionDeleteDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("ai.deleteInstructionTitle")}</>
}

export const AiInstructionDeleteDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("ai.deleteInstructionDesc")}</>
}

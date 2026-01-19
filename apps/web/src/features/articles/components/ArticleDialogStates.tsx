import { useTranslation } from "react-i18next"

export const DeleteAccountDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("settings.deleteAccountTitle")}</>
}

export const DeleteAccountDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("settings.deleteAccountDesc")}</>
}

export const ArticleBulkDeleteDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("article.confirmDeleteTitle")}</>
}

export const ArticleBulkDeleteDialogDescription = ({ count }: { count: number }) => {
  const { t } = useTranslation()
  return <>{t("article.confirmDeleteDesc", { count })}</>
}

export const SentenceDeleteDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("article.deleteSentenceTitle")}</>
}

export const SentenceDeleteDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("article.deleteSentenceDesc")}</>
}

export const SentenceEditDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("article.editSentenceTitle")}</>
}

export const ClearCacheDialogTitle = () => {
  const { t } = useTranslation()
  return <>{t("settings.clearCacheTitle")}</>
}

export const ClearCacheDialogDescription = () => {
  const { t } = useTranslation()
  return <>{t("settings.clearCacheDesc")}</>
}

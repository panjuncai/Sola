import { useTranslation } from "react-i18next"

import { Button } from "@sola/ui"

type ActionButtonProps = {
  disabled?: boolean
  onClick: () => void
}

export const DeleteAccountConfirmButton = ({ disabled, onClick }: ActionButtonProps) => {
  const { t } = useTranslation()
  return (
    <Button type="button" variant="destructive" disabled={disabled} onClick={onClick}>
      {t("settings.deleteAccountConfirm")}
    </Button>
  )
}

export const ArticleBulkDeleteConfirmButton = ({ disabled, onClick }: ActionButtonProps) => {
  const { t } = useTranslation()
  return (
    <Button type="button" variant="destructive" disabled={disabled} onClick={onClick}>
      {t("article.confirmDeleteAction")}
    </Button>
  )
}

export const SentenceDeleteConfirmButton = ({ disabled, onClick }: ActionButtonProps) => {
  const { t } = useTranslation()
  return (
    <Button type="button" variant="destructive" disabled={disabled} onClick={onClick}>
      {t("article.deleteSentenceConfirm")}
    </Button>
  )
}

export const SentenceEditSaveButton = ({ disabled, onClick }: ActionButtonProps) => {
  const { t } = useTranslation()
  return (
    <Button type="button" disabled={disabled} onClick={onClick}>
      {t("common.save")}
    </Button>
  )
}

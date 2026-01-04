import { useTranslation } from "react-i18next"

import { ClearCacheDialog as ClearCacheDialogView } from "@/components/article/ClearCacheDialog"
import { usePlayback } from "@/hooks/usePlayback"
import { useSettingsDialogs } from "@/hooks/useSettingsDialogs"

export const ClearCacheDialog = () => {
  const { t } = useTranslation()
  const { clearCacheOpen, setClearCacheOpen } = useSettingsDialogs()
  const { clearTtsCache } = usePlayback()

  return (
    <ClearCacheDialogView
      t={t}
      open={clearCacheOpen}
      onOpenChange={setClearCacheOpen}
      onConfirm={() => {
        clearTtsCache().catch(() => {})
      }}
    />
  )
}

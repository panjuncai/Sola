import { useTranslation } from "react-i18next"

import { ArticleBulkDeleteDialog } from "@/components/article/dialogs/ArticleBulkDeleteDialog"
import { SentenceEditDialog } from "@/components/article/dialogs/SentenceEditDialog"
import { SentenceDeleteDialog } from "@/components/article/dialogs/SentenceDeleteDialog"
import { DeleteAccountDialog } from "@/components/article/dialogs/DeleteAccountDialog"
import { LanguageSettingsDialog } from "@/components/article/dialogs/LanguageSettingsDialog"
import { AiSettingsDialog } from "@/components/article/dialogs/AiSettingsDialog"
import { AiProviderAddDialog } from "@/components/article/dialogs/AiProviderAddDialog"
import { AiProviderEditDialog } from "@/components/article/dialogs/AiProviderEditDialog"
import { AiProviderDeleteDialog } from "@/components/article/dialogs/AiProviderDeleteDialog"
import { AiProviderResetDialog } from "@/components/article/dialogs/AiProviderResetDialog"
import { AiInstructionPanelDialog } from "@/components/article/dialogs/AiInstructionPanelDialog"
import { ShadowingDialog } from "@/components/article/ShadowingDialog"
import { ClearCacheDialog } from "@/components/article/dialogs/ClearCacheDialog"
import { useArticlesContext } from "@/hooks/useArticles"

export const DialogsContainer: React.FC = () => {
  const { t } = useTranslation()
  const {
    deleteTargets,
    deleteMutation,
    confirmOpen,
    setConfirmOpen,
  } = useArticlesContext()

  return (
    <>
      <ArticleBulkDeleteDialog
        t={t}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        deleteCount={deleteTargets.length}
        isLoading={deleteMutation.isLoading}
        onConfirm={() => {
          if (deleteTargets.length === 0) {
            setConfirmOpen(false)
            return
          }
          deleteMutation.mutateAsync({ articleIds: deleteTargets }).finally(() => {
            setConfirmOpen(false)
          })
        }}
      />

      <SentenceEditDialog />

      <SentenceDeleteDialog />

      <DeleteAccountDialog />

      <LanguageSettingsDialog />

      <AiSettingsDialog />

      <AiProviderAddDialog />

      <AiProviderEditDialog />

      <AiProviderDeleteDialog />

      <AiProviderResetDialog />

      <AiInstructionPanelDialog />

      <ShadowingDialog />

      <ClearCacheDialog />
    </>
  )
}

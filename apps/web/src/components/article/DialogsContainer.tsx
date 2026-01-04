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
export const DialogsContainer: React.FC = () => {
  return (
    <>
      <ArticleBulkDeleteDialog />

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

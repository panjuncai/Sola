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
import { useAiManagement } from "@/hooks/useAiManagement"
import { useArticlesContext } from "@/hooks/useArticles"
import { useSettings } from "@/hooks/useSettings"
import { useSettingsDialogs } from "@/hooks/useSettingsDialogs"

export const DialogsContainer: React.FC = () => {
  const { t } = useTranslation()
  const { useAiUserKey } = useSettings()
  const {
    deleteTargets,
    deleteMutation,
    confirmOpen,
    setConfirmOpen,
  } = useArticlesContext()
  const {
    newAiProviderName,
    setNewAiProviderName,
    newAiProviderType,
    setNewAiProviderType,
    newAiProviderApiUrl,
    setNewAiProviderApiUrl,
    newAiProviderModels,
    setNewAiProviderModels,
    newAiProviderEnabled,
    setNewAiProviderEnabled,
    newAiProviderApiKey,
    setNewAiProviderApiKey,
    newAiProviderKeyVisible,
    setNewAiProviderKeyVisible,
    aiProviderAddOpen,
    setAiProviderAddOpen,
    aiProviderEditOpen,
    setAiProviderEditOpen,
    aiProviderEditing,
    setAiProviderEditing,
    aiProviderDeleteId,
    setAiProviderDeleteId,
    aiProviderEditKeyVisible,
    setAiProviderEditKeyVisible,
    aiProviderEditModels,
    setAiProviderEditModels,
    aiProviderResetOpen,
    setAiProviderResetOpen,
    addAiProvider,
    updateAiProvider,
    removeAiProvider,
    resetAiProviders,
  } = useAiManagement()
  const {
    shadowingDialogOpen,
    setShadowingDialogOpen,
    shadowingDraftEnabled,
    setShadowingDraftEnabled,
    shadowingDraftSpeeds,
    setShadowingDraftSpeeds,
    confirmShadowingDraft,
  } = useSettingsDialogs()

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

      <AiProviderAddDialog
        t={t}
        open={aiProviderAddOpen}
        onOpenChange={setAiProviderAddOpen}
        useAiUserKey={useAiUserKey}
        name={newAiProviderName}
        onNameChange={setNewAiProviderName}
        providerType={newAiProviderType}
        onProviderTypeChange={setNewAiProviderType}
        apiUrl={newAiProviderApiUrl}
        onApiUrlChange={setNewAiProviderApiUrl}
        apiKey={newAiProviderApiKey}
        onApiKeyChange={setNewAiProviderApiKey}
        apiKeyVisible={newAiProviderKeyVisible}
        onToggleApiKeyVisible={() => setNewAiProviderKeyVisible((prev) => !prev)}
        models={newAiProviderModels}
        onModelsChange={setNewAiProviderModels}
        enabled={newAiProviderEnabled}
        onEnabledChange={setNewAiProviderEnabled}
        onSave={addAiProvider}
      />

      <AiProviderEditDialog
        t={t}
        open={aiProviderEditOpen}
        onOpenChange={setAiProviderEditOpen}
        useAiUserKey={useAiUserKey}
        provider={aiProviderEditing}
        apiKeyVisible={aiProviderEditKeyVisible}
        onToggleApiKeyVisible={() => setAiProviderEditKeyVisible((prev) => !prev)}
        modelsValue={aiProviderEditModels}
        onModelsChange={setAiProviderEditModels}
        onChangeProvider={(provider) => setAiProviderEditing(provider)}
        onSave={updateAiProvider}
      />

      <AiProviderDeleteDialog
        t={t}
        open={Boolean(aiProviderDeleteId)}
        onOpenChange={() => setAiProviderDeleteId(null)}
        onConfirm={removeAiProvider}
      />

      <AiProviderResetDialog
        t={t}
        open={aiProviderResetOpen}
        onOpenChange={setAiProviderResetOpen}
        onConfirm={resetAiProviders}
      />

      <AiInstructionPanelDialog />

      <ShadowingDialog
        t={t}
        open={shadowingDialogOpen}
        onOpenChange={setShadowingDialogOpen}
        shadowingDraftEnabled={shadowingDraftEnabled}
        setShadowingDraftEnabled={setShadowingDraftEnabled}
        shadowingDraftSpeeds={shadowingDraftSpeeds}
        setShadowingDraftSpeeds={setShadowingDraftSpeeds}
        onConfirm={confirmShadowingDraft}
      />

      <ClearCacheDialog />
    </>
  )
}

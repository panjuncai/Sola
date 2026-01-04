import * as React from "react"
import type { TFunction } from "i18next"

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

type DialogsContainerProps = {
  t: TFunction<"translation">
  deleteConfirm: {
    open: boolean
    onOpenChange: (open: boolean) => void
    deleteCount: number
    isLoading: boolean
    onConfirm: () => void
  }
  aiProviderAdd: {
    open: boolean
    onOpenChange: (open: boolean) => void
    useAiUserKey: boolean
    name: string
    onNameChange: (value: string) => void
    providerType: "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix"
    onProviderTypeChange: (value: "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix") => void
    apiUrl: string
    onApiUrlChange: (value: string) => void
    apiKey: string
    onApiKeyChange: (value: string) => void
    apiKeyVisible: boolean
    onToggleApiKeyVisible: () => void
    models: string
    onModelsChange: (value: string) => void
    enabled: boolean
    onEnabledChange: (value: boolean) => void
    onSave: () => void | Promise<void>
  }
  aiProviderEdit: {
    open: boolean
    onOpenChange: (open: boolean) => void
    useAiUserKey: boolean
    provider: any
    apiKeyVisible: boolean
    onToggleApiKeyVisible: () => void
    modelsValue: string
    onModelsChange: (value: string) => void
    onChangeProvider: (provider: any) => void
    onSave: () => void | Promise<void>
  }
  aiProviderDelete: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void | Promise<any>
  }
  aiProviderReset: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void | Promise<any>
  }
  shadowing: {
    open: boolean
    onOpenChange: (open: boolean) => void
    shadowingDraftEnabled: boolean
    setShadowingDraftEnabled: React.Dispatch<React.SetStateAction<boolean>>
    shadowingDraftSpeeds: number[]
    setShadowingDraftSpeeds: React.Dispatch<React.SetStateAction<number[]>>
    onConfirm: () => void
  }
}

export const DialogsContainer: React.FC<DialogsContainerProps> = ({
  t,
  deleteConfirm,
  aiProviderAdd,
  aiProviderEdit,
  aiProviderDelete,
  aiProviderReset,
  shadowing,
}) => {
  return (
    <>
      <ArticleBulkDeleteDialog
        t={t}
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        deleteCount={deleteConfirm.deleteCount}
        isLoading={deleteConfirm.isLoading}
        onConfirm={deleteConfirm.onConfirm}
      />

      <SentenceEditDialog />

      <SentenceDeleteDialog />

      <DeleteAccountDialog />

      <LanguageSettingsDialog />

      <AiSettingsDialog />

      <AiProviderAddDialog
        t={t}
        open={aiProviderAdd.open}
        onOpenChange={aiProviderAdd.onOpenChange}
        useAiUserKey={aiProviderAdd.useAiUserKey}
        name={aiProviderAdd.name}
        onNameChange={aiProviderAdd.onNameChange}
        providerType={aiProviderAdd.providerType}
        onProviderTypeChange={aiProviderAdd.onProviderTypeChange}
        apiUrl={aiProviderAdd.apiUrl}
        onApiUrlChange={aiProviderAdd.onApiUrlChange}
        apiKey={aiProviderAdd.apiKey}
        onApiKeyChange={aiProviderAdd.onApiKeyChange}
        apiKeyVisible={aiProviderAdd.apiKeyVisible}
        onToggleApiKeyVisible={aiProviderAdd.onToggleApiKeyVisible}
        models={aiProviderAdd.models}
        onModelsChange={aiProviderAdd.onModelsChange}
        enabled={aiProviderAdd.enabled}
        onEnabledChange={aiProviderAdd.onEnabledChange}
        onSave={aiProviderAdd.onSave}
      />

      <AiProviderEditDialog
        t={t}
        open={aiProviderEdit.open}
        onOpenChange={aiProviderEdit.onOpenChange}
        useAiUserKey={aiProviderEdit.useAiUserKey}
        provider={aiProviderEdit.provider}
        apiKeyVisible={aiProviderEdit.apiKeyVisible}
        onToggleApiKeyVisible={aiProviderEdit.onToggleApiKeyVisible}
        modelsValue={aiProviderEdit.modelsValue}
        onModelsChange={aiProviderEdit.onModelsChange}
        onChangeProvider={aiProviderEdit.onChangeProvider}
        onSave={aiProviderEdit.onSave}
      />

      <AiProviderDeleteDialog
        t={t}
        open={aiProviderDelete.open}
        onOpenChange={aiProviderDelete.onOpenChange}
        onConfirm={aiProviderDelete.onConfirm}
      />

      <AiProviderResetDialog
        t={t}
        open={aiProviderReset.open}
        onOpenChange={aiProviderReset.onOpenChange}
        onConfirm={aiProviderReset.onConfirm}
      />

      <AiInstructionPanelDialog />

      <ShadowingDialog
        t={t}
        open={shadowing.open}
        onOpenChange={shadowing.onOpenChange}
        shadowingDraftEnabled={shadowing.shadowingDraftEnabled}
        setShadowingDraftEnabled={shadowing.setShadowingDraftEnabled}
        shadowingDraftSpeeds={shadowing.shadowingDraftSpeeds}
        setShadowingDraftSpeeds={shadowing.setShadowingDraftSpeeds}
        onConfirm={shadowing.onConfirm}
      />

      <ClearCacheDialog />
    </>
  )
}

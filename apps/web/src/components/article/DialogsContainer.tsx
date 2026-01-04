import * as React from "react"
import type { TFunction } from "i18next"

import { ArticleBulkDeleteDialog } from "@/components/article/dialogs/ArticleBulkDeleteDialog"
import { SentenceEditDialog } from "@/components/article/dialogs/SentenceEditDialog"
import { SentenceDeleteDialog } from "@/components/article/dialogs/SentenceDeleteDialog"
import { DeleteAccountDialog } from "@/components/article/DeleteAccountDialog"
import { LanguageSettingsDialog } from "@/components/article/LanguageSettingsDialog"
import { AiSettingsDialog } from "@/components/article/AiSettingsDialog"
import { AiProviderAddDialog } from "@/components/article/dialogs/AiProviderAddDialog"
import { AiProviderEditDialog } from "@/components/article/dialogs/AiProviderEditDialog"
import { AiProviderDeleteDialog } from "@/components/article/dialogs/AiProviderDeleteDialog"
import { AiProviderResetDialog } from "@/components/article/dialogs/AiProviderResetDialog"
import { AiInstructionPanel } from "@/components/article/AiInstructionPanel"
import { ShadowingDialog } from "@/components/article/ShadowingDialog"
import { ClearCacheDialog } from "@/components/article/ClearCacheDialog"

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"

type VoiceOption = { id: string; voiceId: string; gender?: string | null }

type DialogsContainerProps = {
  t: TFunction<"translation">
  deleteConfirm: {
    open: boolean
    onOpenChange: (open: boolean) => void
    deleteCount: number
    isLoading: boolean
    onConfirm: () => void
  }
  sentenceEdit: {
    open: boolean
    onOpenChange: (open: boolean) => void
    nativeText: string
    targetText: string
    onChangeNative: (value: string) => void
    onChangeTarget: (value: string) => void
    isSaving: boolean
    isDisabled: boolean
    onSave: () => void | Promise<any>
  }
  sentenceDelete: {
    open: boolean
    onOpenChange: (open: boolean) => void
    isLoading: boolean
    isDisabled: boolean
    onConfirm: () => void | Promise<void>
  }
  accountDelete: {
    open: boolean
    onOpenChange: (open: boolean) => void
    isLoading: boolean
    onConfirm: () => void
  }
  languageSettings: {
    open: boolean
    onOpenChange: (open: boolean) => void
    languages: Array<{ value: LanguageOption; label: string }>
    nativeLanguageSetting: LanguageOption
    targetLanguageSetting: LanguageOption
    onNativeLanguageChange: (value: LanguageOption | string) => void
    onTargetLanguageChange: (value: LanguageOption | string) => void
    nativeVoiceId: string | null
    targetVoiceId: string | null
    nativeVoiceOptions: VoiceOption[]
    targetVoiceOptions: VoiceOption[]
    onNativeVoiceChange: (value: string | null) => void
    onTargetVoiceChange: (value: string | null) => void
    voiceLabel: (voice: VoiceOption) => string
  }
  aiSettings: {
    open: boolean
    onOpenChange: (open: boolean) => void
    useAiUserKey: boolean
    onUsePublic: () => void
    onUsePrivate: () => void
    aiProvidersDraft: any[]
    onSetDefault: (id: string) => void
    onEdit: (provider: any) => void
    onDelete: (id: string) => void
    onReset: () => void
    onAddCustom: () => void
    onSave: () => void | Promise<any>
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
  aiInstructionPanel: {
    aiInstructionDialogOpen: boolean
    setAiInstructionDialogOpen: (open: boolean) => void
    aiInstructionDrafts: any[]
    setAiInstructionEditOpen: (open: boolean) => void
    setAiInstructionEditing: (payload: any) => void
    setAiInstructionDeleteId: (id: string | null) => void
    setAiInstructionDeleteOpen: (open: boolean) => void
    setAiInstructionAddOpen: (open: boolean) => void
    aiInstructionEditOpen: boolean
    aiInstructionEditing: any
    updateInstruction: (payload: any) => Promise<any>
    refetchInstructions: () => Promise<any>
    aiInstructionAddOpen: boolean
    publicAiInstructions: any[]
    aiInstructionAddProviderId: string | null
    setAiInstructionAddProviderId: (value: string | null) => void
    aiInstructionAddModel: string | null
    setAiInstructionAddModel: (value: string | null) => void
    aiProviders: any[]
    resolveProviderModels: (providerId: string | null) => string[]
    createFromPublic: (payload: any) => Promise<any>
    aiInstructionDeleteOpen: boolean
    aiInstructionDeleteId: string | null
    deleteInstruction: (payload: any) => Promise<any>
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
  clearCache: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
  }
}

export const DialogsContainer: React.FC<DialogsContainerProps> = ({
  t,
  deleteConfirm,
  sentenceEdit,
  sentenceDelete,
  accountDelete,
  languageSettings,
  aiSettings,
  aiProviderAdd,
  aiProviderEdit,
  aiProviderDelete,
  aiProviderReset,
  aiInstructionPanel,
  shadowing,
  clearCache,
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

      <SentenceEditDialog
        t={t}
        open={sentenceEdit.open}
        onOpenChange={sentenceEdit.onOpenChange}
        nativeText={sentenceEdit.nativeText}
        targetText={sentenceEdit.targetText}
        onChangeNative={sentenceEdit.onChangeNative}
        onChangeTarget={sentenceEdit.onChangeTarget}
        isSaving={sentenceEdit.isSaving}
        isDisabled={sentenceEdit.isDisabled}
        onSave={sentenceEdit.onSave}
      />

      <SentenceDeleteDialog
        t={t}
        open={sentenceDelete.open}
        onOpenChange={sentenceDelete.onOpenChange}
        isLoading={sentenceDelete.isLoading}
        isDisabled={sentenceDelete.isDisabled}
        onConfirm={sentenceDelete.onConfirm}
      />

      <DeleteAccountDialog
        t={t}
        open={accountDelete.open}
        onOpenChange={accountDelete.onOpenChange}
        isLoading={accountDelete.isLoading}
        onConfirm={accountDelete.onConfirm}
      />

      <LanguageSettingsDialog
        t={t}
        open={languageSettings.open}
        onOpenChange={languageSettings.onOpenChange}
        languages={languageSettings.languages}
        nativeLanguageSetting={languageSettings.nativeLanguageSetting}
        targetLanguageSetting={languageSettings.targetLanguageSetting}
        onNativeLanguageChange={languageSettings.onNativeLanguageChange}
        onTargetLanguageChange={languageSettings.onTargetLanguageChange}
        nativeVoiceId={languageSettings.nativeVoiceId}
        targetVoiceId={languageSettings.targetVoiceId}
        nativeVoiceOptions={languageSettings.nativeVoiceOptions}
        targetVoiceOptions={languageSettings.targetVoiceOptions}
        onNativeVoiceChange={languageSettings.onNativeVoiceChange}
        onTargetVoiceChange={languageSettings.onTargetVoiceChange}
        voiceLabel={languageSettings.voiceLabel}
      />

      <AiSettingsDialog
        t={t}
        open={aiSettings.open}
        onOpenChange={aiSettings.onOpenChange}
        useAiUserKey={aiSettings.useAiUserKey}
        onUsePublic={aiSettings.onUsePublic}
        onUsePrivate={aiSettings.onUsePrivate}
        aiProvidersDraft={aiSettings.aiProvidersDraft}
        onSetDefault={aiSettings.onSetDefault}
        onEdit={aiSettings.onEdit}
        onDelete={aiSettings.onDelete}
        onReset={aiSettings.onReset}
        onAddCustom={aiSettings.onAddCustom}
        onSave={async () => {
          await aiSettings.onSave?.()
        }}
      />

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

      <AiInstructionPanel
        t={t}
        aiInstructionDialogOpen={aiInstructionPanel.aiInstructionDialogOpen}
        setAiInstructionDialogOpen={aiInstructionPanel.setAiInstructionDialogOpen}
        aiInstructionDrafts={aiInstructionPanel.aiInstructionDrafts}
        setAiInstructionEditOpen={aiInstructionPanel.setAiInstructionEditOpen}
        setAiInstructionEditing={aiInstructionPanel.setAiInstructionEditing}
        setAiInstructionDeleteId={aiInstructionPanel.setAiInstructionDeleteId}
        setAiInstructionDeleteOpen={aiInstructionPanel.setAiInstructionDeleteOpen}
        setAiInstructionAddOpen={aiInstructionPanel.setAiInstructionAddOpen}
        aiInstructionEditOpen={aiInstructionPanel.aiInstructionEditOpen}
        setAiInstructionEditOpenState={aiInstructionPanel.setAiInstructionEditOpen}
        aiInstructionEditing={aiInstructionPanel.aiInstructionEditing}
        updateInstruction={aiInstructionPanel.updateInstruction}
        refetchInstructions={aiInstructionPanel.refetchInstructions}
        aiInstructionAddOpen={aiInstructionPanel.aiInstructionAddOpen}
        publicAiInstructions={aiInstructionPanel.publicAiInstructions}
        aiInstructionAddProviderId={aiInstructionPanel.aiInstructionAddProviderId}
        setAiInstructionAddProviderId={aiInstructionPanel.setAiInstructionAddProviderId}
        aiInstructionAddModel={aiInstructionPanel.aiInstructionAddModel}
        setAiInstructionAddModel={aiInstructionPanel.setAiInstructionAddModel}
        aiProviders={aiInstructionPanel.aiProviders}
        resolveProviderModels={aiInstructionPanel.resolveProviderModels}
        createFromPublic={aiInstructionPanel.createFromPublic}
        aiInstructionDeleteOpen={aiInstructionPanel.aiInstructionDeleteOpen}
        setAiInstructionDeleteOpenState={aiInstructionPanel.setAiInstructionDeleteOpen}
        aiInstructionDeleteId={aiInstructionPanel.aiInstructionDeleteId}
        deleteInstruction={aiInstructionPanel.deleteInstruction}
      />

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

      <ClearCacheDialog
        t={t}
        open={clearCache.open}
        onOpenChange={clearCache.onOpenChange}
        onConfirm={clearCache.onConfirm}
      />
    </>
  )
}

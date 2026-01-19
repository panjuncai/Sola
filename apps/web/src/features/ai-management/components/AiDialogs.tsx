import {
  AiSettingsDialog,
  AiProviderAddDialog,
  AiProviderEditDialog,
  AiProviderDeleteDialog,
  AiProviderResetDialog,
  AiInstructionPanelDialog,
} from "@/features/ai-management"

export const AiDialogs = () => {
  return (
    <>
      <AiSettingsDialog />
      <AiProviderAddDialog />
      <AiProviderEditDialog />
      <AiProviderDeleteDialog />
      <AiProviderResetDialog />
      <AiInstructionPanelDialog />
    </>
  )
}

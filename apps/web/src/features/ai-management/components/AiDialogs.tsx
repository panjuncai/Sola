import { AiSettingsDialog } from "./AiSettingsDialog"
import { AiInstructionPanelDialog } from "./dialogs/AiInstructionPanelDialog"
import { AiProviderAddDialog } from "./dialogs/AiProviderAddDialog"
import { AiProviderDeleteDialog } from "./dialogs/AiProviderDeleteDialog"
import { AiProviderEditDialog } from "./dialogs/AiProviderEditDialog"
import { AiProviderResetDialog } from "./dialogs/AiProviderResetDialog"

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

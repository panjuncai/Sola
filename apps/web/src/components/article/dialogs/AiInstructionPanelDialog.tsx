import { useTranslation } from "react-i18next"

import { AiInstructionPanel } from "@/components/article/AiInstructionPanel"
import { useAiManagement } from "@/hooks/useAiManagement"
export const AiInstructionPanelDialog = () => {
  const { t } = useTranslation()
  const {
    aiInstructionDialogOpen,
    setAiInstructionDialogOpen,
    aiInstructionDrafts,
    setAiInstructionEditOpen,
    setAiInstructionEditing,
    setAiInstructionDeleteId,
    setAiInstructionDeleteOpen,
    setAiInstructionAddOpen,
    aiInstructionEditOpen,
    aiInstructionEditing,
    updateInstruction,
    aiInstructionQuery,
    aiInstructionAddOpen,
    publicAiInstructions,
    aiInstructionAddProviderId,
    setAiInstructionAddProviderId,
    aiInstructionAddModel,
    setAiInstructionAddModel,
    aiProvidersQuery,
    resolveProviderModels,
    createInstructionFromPublic,
    aiInstructionDeleteOpen,
    aiInstructionDeleteId,
    deleteInstruction,
  } = useAiManagement()

  return (
    <AiInstructionPanel
      t={t}
      aiInstructionDialogOpen={aiInstructionDialogOpen}
      setAiInstructionDialogOpen={setAiInstructionDialogOpen}
      aiInstructionDrafts={aiInstructionDrafts}
      setAiInstructionEditOpen={setAiInstructionEditOpen}
      setAiInstructionEditing={setAiInstructionEditing}
      setAiInstructionDeleteId={setAiInstructionDeleteId}
      setAiInstructionDeleteOpen={setAiInstructionDeleteOpen}
      setAiInstructionAddOpen={setAiInstructionAddOpen}
      aiInstructionEditOpen={aiInstructionEditOpen}
      setAiInstructionEditOpenState={setAiInstructionEditOpen}
      aiInstructionEditing={aiInstructionEditing}
      updateInstruction={updateInstruction}
      refetchInstructions={aiInstructionQuery.refetch}
      aiInstructionAddOpen={aiInstructionAddOpen}
      publicAiInstructions={publicAiInstructions}
      aiInstructionAddProviderId={aiInstructionAddProviderId}
      setAiInstructionAddProviderId={setAiInstructionAddProviderId}
      aiInstructionAddModel={aiInstructionAddModel}
      setAiInstructionAddModel={setAiInstructionAddModel}
      aiProviders={aiProvidersQuery.data ?? []}
      resolveProviderModels={resolveProviderModels}
      createFromPublic={createInstructionFromPublic}
      aiInstructionDeleteOpen={aiInstructionDeleteOpen}
      setAiInstructionDeleteOpenState={setAiInstructionDeleteOpen}
      aiInstructionDeleteId={aiInstructionDeleteId}
      deleteInstruction={deleteInstruction}
    />
  )
}

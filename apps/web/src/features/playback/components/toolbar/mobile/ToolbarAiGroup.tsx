import { useTranslation } from "react-i18next"

import { type InstructionType, useAiManagementRequired } from "@/features/ai-management"
import { InstructionGroup } from "./InstructionGroup"

type ToolbarAiGroupProps = {
  closeMobileToolbar: () => void
}

export const ToolbarAiGroup = ({ closeMobileToolbar }: ToolbarAiGroupProps) => {
  const { t } = useTranslation()
  const ai = useAiManagementRequired()
  const { aiInstructionGroups, resolveInstructionLabel, startAiTranslation } = ai

  if (aiInstructionGroups.length === 0) {
    return <div className="text-xs text-muted-foreground">{t("ai.instructionsEmpty")}</div>
  }

  return (
    <div className="flex flex-col gap-2">
      {aiInstructionGroups.map(([type, instructions]) => (
        <InstructionGroup
          key={type}
          label={resolveInstructionLabel(type as InstructionType)}
          instructions={instructions}
          onInstructionClick={(instructionId) => {
            startAiTranslation(instructionId, true)
            closeMobileToolbar()
          }}
        />
      ))}
    </div>
  )
}

import { useArticleToolbarView } from "../../../hooks/view/useArticleToolbarView"
import { type InstructionType } from "@/features/ai-management"
import { InstructionGroup } from "./InstructionGroup"

export const ToolbarAiGroup = () => {
  const { t, ai } = useArticleToolbarView()
  const { aiInstructionGroups, resolveInstructionLabel, startAiTranslation } = ai

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
      {aiInstructionGroups.length > 0 ? (
        aiInstructionGroups.map(([type, instructions]) => (
          <InstructionGroup
            key={type}
            label={resolveInstructionLabel(type as InstructionType)}
            instructions={instructions}
            onInstructionClick={(instructionId) =>
              startAiTranslation(instructionId, true)
            }
          />
        ))
      ) : (
        <span>{t("ai.instructionsEmpty")}</span>
      )}
    </div>
  )
}

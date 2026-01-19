import { InstructionButton } from "./InstructionButton"

type InstructionGroupProps = {
  label: string
  instructions: Array<{
    id: string
    name: string
  }>
  onInstructionClick: (instructionId: string) => void
}

export const InstructionGroup = ({
  label,
  instructions,
  onInstructionClick,
}: InstructionGroupProps) => {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-2">
        {instructions.map((instruction) => (
          <InstructionButton
            key={instruction.id}
            label={instruction.name}
            onClick={() => onInstructionClick(instruction.id)}
          />
        ))}
      </div>
    </div>
  )
}

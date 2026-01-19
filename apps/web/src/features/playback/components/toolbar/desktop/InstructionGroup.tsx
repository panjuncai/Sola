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
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {instructions.map((instruction) => (
        <InstructionButton
          key={instruction.id}
          label={instruction.name}
          onClick={() => onInstructionClick(instruction.id)}
        />
      ))}
    </div>
  )
}

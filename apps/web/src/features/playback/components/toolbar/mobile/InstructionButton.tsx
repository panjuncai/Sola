import { Button } from "@sola/ui"

type InstructionButtonProps = {
  label: string
  onClick: () => void
}

export const InstructionButton = ({ label, onClick }: InstructionButtonProps) => {
  return (
    <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={onClick}>
      {label}
    </Button>
  )
}

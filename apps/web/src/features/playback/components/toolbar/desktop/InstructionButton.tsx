type InstructionButtonProps = {
  label: string
  onClick: () => void
}

export const InstructionButton = ({ label, onClick }: InstructionButtonProps) => {
  return (
    <button
      type="button"
      className="rounded-full border px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary/60 hover:text-primary"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

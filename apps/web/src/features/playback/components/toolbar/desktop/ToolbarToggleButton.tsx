import { cn } from "@sola/ui"

type ToolbarToggleButtonProps = {
  label: string
  active: boolean
  onClick: () => void
}

export const ToolbarToggleButton = ({
  label,
  active,
  onClick,
}: ToolbarToggleButtonProps) => {
  return (
    <button type="button" className="flex items-center gap-2" onClick={onClick}>
      <span
        className={cn(
          "relative h-7 w-12 rounded-full border transition",
          active ? "bg-primary/80" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
            active ? "left-5" : "left-1"
          )}
        />
      </span>
      <span>{label}</span>
    </button>
  )
}

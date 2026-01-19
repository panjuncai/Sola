import { cn } from "@sola/ui"

type ToolbarToggleRowProps = {
  label: string
  active: boolean
  onClick: () => void
}

export const ToolbarToggleRow = ({
  label,
  active,
  onClick,
}: ToolbarToggleRowProps) => {
  return (
    <button
      type="button"
      className="flex items-center justify-between rounded-md border px-2 py-1"
      onClick={onClick}
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full border transition",
          active ? "bg-primary/80" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition",
            active ? "left-4.5" : "left-1"
          )}
        />
      </span>
    </button>
  )
}

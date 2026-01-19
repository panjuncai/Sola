import { Button, cn } from "@sola/ui"

type ToolbarIconButtonProps = {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}

export const ToolbarIconButton = ({
  active,
  label,
  onClick,
  children,
}: ToolbarIconButtonProps) => {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      aria-label={label}
      className={cn(
        "relative h-9 w-9 rounded-full p-0 group",
        active && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
      )}
      onClick={onClick}
    >
      {children}
      <span className="pointer-events-none absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </Button>
  )
}

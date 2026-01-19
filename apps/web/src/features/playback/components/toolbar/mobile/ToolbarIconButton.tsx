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
        "h-9 w-9 rounded-full p-0",
        active && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

import * as React from "react"

type SettingsTriggerButtonProps = {
  label: string
  onClick: () => void
}

export const SettingsTriggerButton = React.forwardRef<
  HTMLButtonElement,
  SettingsTriggerButtonProps
>(({ label, onClick }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground"
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
      <span className="truncate">{label}</span>
    </button>
  )
})

SettingsTriggerButton.displayName = "SettingsTriggerButton"

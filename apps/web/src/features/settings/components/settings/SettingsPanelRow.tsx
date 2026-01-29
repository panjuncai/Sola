import * as React from "react"

import { cn } from "@sola/ui"

type SettingsPanelRowProps = {
  label: string
  children: React.ReactNode
  className?: string
  labelClassName?: string
}

export const SettingsPanelRow = ({
  label,
  children,
  className,
  labelClassName,
}: SettingsPanelRowProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className={labelClassName}>{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

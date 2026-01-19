import * as React from "react"

type SidebarListContainerProps = {
  children: React.ReactNode
}

export const SidebarListContainer = ({ children }: SidebarListContainerProps) => {
  return <div className="flex-1 overflow-y-auto p-4 space-y-2">{children}</div>
}

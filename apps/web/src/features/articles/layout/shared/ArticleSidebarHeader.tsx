import { ArticleSidebarCreateButton } from "./ArticleSidebarCreateButton"
import { ArticleSidebarBulkDeleteButton } from "./ArticleSidebarBulkDeleteButton"

export const ArticleSidebarHeader = () => {
  return (
    <div className="flex-none border-b p-4 space-y-2">
      <ArticleSidebarCreateButton />
      <ArticleSidebarBulkDeleteButton />
    </div>
  )
}

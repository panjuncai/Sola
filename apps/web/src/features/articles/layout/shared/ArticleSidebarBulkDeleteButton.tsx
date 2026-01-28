import { Button } from "@sola/ui"

import { useSidebarView } from "../../hooks/view/useSidebarView"

export const ArticleSidebarBulkDeleteButton = () => {
  const { handleDeleteClick, deleteDisabled, bulkDeleteLabel } = useSidebarView()

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-start"
      disabled={deleteDisabled}
      onClick={handleDeleteClick}
    >
      {bulkDeleteLabel}
    </Button>
  )
}

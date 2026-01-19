import { Button } from "@sola/ui"

import { useSidebarView } from "@/features/articles"

export const ArticleSidebarCreateButton = () => {
  const { handleCreateClick, addLabel } = useSidebarView()

  return (
    <Button
      type="button"
      className="w-full justify-start"
      onClick={handleCreateClick}
    >
      + {addLabel}
    </Button>
  )
}

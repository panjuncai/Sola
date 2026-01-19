import { cn } from "@sola/ui"

import { ArticleSidebarListItemCheckbox } from "./ArticleSidebarListItemCheckbox"
import { ArticleSidebarListItemTitle } from "./ArticleSidebarListItemTitle"

type ArticleSidebarListItemProps = {
  article: {
    id: string
    title: string | null
  }
  active: boolean
  checked: boolean
  onToggle: () => void
  onSelect: () => void
}

export const ArticleSidebarListItem = ({
  article,
  active,
  checked,
  onToggle,
  onSelect,
}: ArticleSidebarListItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2 py-2 text-sm",
        active && "border-primary/60 bg-primary/5"
      )}
    >
      <ArticleSidebarListItemCheckbox checked={checked} onToggle={onToggle} />
      <ArticleSidebarListItemTitle title={article.title} onSelect={onSelect} />
    </div>
  )
}

type ArticleSidebarListItemCheckboxProps = {
  checked: boolean
  onToggle: () => void
}

export const ArticleSidebarListItemCheckbox = ({
  checked,
  onToggle,
}: ArticleSidebarListItemCheckboxProps) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      aria-label="Select article"
    />
  )
}

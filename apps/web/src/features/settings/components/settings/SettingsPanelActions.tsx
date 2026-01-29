import { Button } from "@sola/ui"

type SettingsPanelActionsProps = {
  clearLabel: string
  deleteLabel: string
  signOutLabel: string
  onClear: () => void
  onDelete: () => void
  onSignOut: () => void
}

export const SettingsPanelActions = ({
  clearLabel,
  deleteLabel,
  signOutLabel,
  onClear,
  onDelete,
  onSignOut,
}: SettingsPanelActionsProps) => {
  return (
    <>
      <div className="pt-1">
        <Button type="button" variant="outline" className="w-full" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={onDelete}
        >
          {deleteLabel}
        </Button>
      </div>

      <div className="pt-2">
        <Button type="button" variant="outline" className="w-full" onClick={onSignOut}>
          {signOutLabel}
        </Button>
      </div>
    </>
  )
}

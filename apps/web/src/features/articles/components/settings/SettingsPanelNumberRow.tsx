import { SettingsPanelRow } from "./SettingsPanelRow"

type SettingsPanelNumberRowProps = {
  label: string
  value: number
  min?: number
  step?: number
  onChange: (value: number) => void
}

export const SettingsPanelNumberRow = ({
  label,
  value,
  min = 0,
  step,
  onChange,
}: SettingsPanelNumberRowProps) => {
  return (
    <SettingsPanelRow label={label}>
      <input
        type="number"
        min={min}
        step={step}
        className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value)
          onChange(Number.isFinite(next) ? next : 0)
        }}
      />
    </SettingsPanelRow>
  )
}

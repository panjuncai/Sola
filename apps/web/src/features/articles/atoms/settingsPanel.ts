import { atom, useAtomValue, useSetAtom } from "jotai"

const settingsPanelOpenAtom = atom(false)

export const useSettingsPanelState = () => ({
  settingsOpen: useAtomValue(settingsPanelOpenAtom),
})

export const useSettingsPanelActions = () => ({
  setSettingsOpen: useSetAtom(settingsPanelOpenAtom),
})

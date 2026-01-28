import { atom, useAtomValue, useSetAtom } from "jotai"

const uiSettingsPanelOpenAtom = atom(false)

export const useSettingsPanelState = () => ({
  settingsOpen: useAtomValue(uiSettingsPanelOpenAtom),
})

export const useSettingsPanelActions = () => ({
  setSettingsOpen: useSetAtom(uiSettingsPanelOpenAtom),
})

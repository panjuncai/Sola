import { atom, useAtomValue, useSetAtom } from "jotai"

const uiLanguageDialogOpenAtom = atom(false)
const uiDeleteAccountOpenAtom = atom(false)
const uiClearCacheOpenAtom = atom(false)
const uiShadowingDialogOpenAtom = atom(false)
const uiShadowingDraftEnabledAtom = atom(false)
const uiShadowingDraftSpeedsAtom = atom<number[]>([])

export const useSettingsDialogsState = () => ({
  languageDialogOpen: useAtomValue(uiLanguageDialogOpenAtom),
  deleteAccountOpen: useAtomValue(uiDeleteAccountOpenAtom),
  clearCacheOpen: useAtomValue(uiClearCacheOpenAtom),
  shadowingDialogOpen: useAtomValue(uiShadowingDialogOpenAtom),
})

export const useSettingsDialogsActions = () => ({
  setLanguageDialogOpen: useSetAtom(uiLanguageDialogOpenAtom),
  setDeleteAccountOpen: useSetAtom(uiDeleteAccountOpenAtom),
  setClearCacheOpen: useSetAtom(uiClearCacheOpenAtom),
  setShadowingDialogOpen: useSetAtom(uiShadowingDialogOpenAtom),
})

export const useShadowingDraftState = () => ({
  shadowingDraftEnabled: useAtomValue(uiShadowingDraftEnabledAtom),
  setShadowingDraftEnabled: useSetAtom(uiShadowingDraftEnabledAtom),
  shadowingDraftSpeeds: useAtomValue(uiShadowingDraftSpeedsAtom),
  setShadowingDraftSpeeds: useSetAtom(uiShadowingDraftSpeedsAtom),
})

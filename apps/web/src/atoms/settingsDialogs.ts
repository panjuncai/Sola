import { atom, useAtomValue, useSetAtom } from "jotai"

export const languageDialogOpenAtom = atom(false)
export const deleteAccountOpenAtom = atom(false)
export const clearCacheOpenAtom = atom(false)
export const shadowingDialogOpenAtom = atom(false)
export const shadowingDraftEnabledAtom = atom(false)
export const shadowingDraftSpeedsAtom = atom<number[]>([])

export const useSettingsDialogsState = () => ({
  languageDialogOpen: useAtomValue(languageDialogOpenAtom),
  deleteAccountOpen: useAtomValue(deleteAccountOpenAtom),
  clearCacheOpen: useAtomValue(clearCacheOpenAtom),
  shadowingDialogOpen: useAtomValue(shadowingDialogOpenAtom),
})

export const useSettingsDialogsActions = () => ({
  setLanguageDialogOpen: useSetAtom(languageDialogOpenAtom),
  setDeleteAccountOpen: useSetAtom(deleteAccountOpenAtom),
  setClearCacheOpen: useSetAtom(clearCacheOpenAtom),
  setShadowingDialogOpen: useSetAtom(shadowingDialogOpenAtom),
})

export const useShadowingDraftState = () => ({
  shadowingDraftEnabled: useAtomValue(shadowingDraftEnabledAtom),
  setShadowingDraftEnabled: useSetAtom(shadowingDraftEnabledAtom),
  shadowingDraftSpeeds: useAtomValue(shadowingDraftSpeedsAtom),
  setShadowingDraftSpeeds: useSetAtom(shadowingDraftSpeedsAtom),
})

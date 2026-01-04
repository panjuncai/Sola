import { atom, useAtomValue, useSetAtom } from "jotai"

export const languageDialogOpenAtom = atom(false)
export const deleteAccountOpenAtom = atom(false)
export const clearCacheOpenAtom = atom(false)
export const shadowingDialogOpenAtom = atom(false)

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

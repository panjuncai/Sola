import { atom, useAtomValue, useSetAtom } from "jotai"

const languageDialogOpenAtom = atom(false)
const deleteAccountOpenAtom = atom(false)
const clearCacheOpenAtom = atom(false)
const shadowingDialogOpenAtom = atom(false)
const shadowingDraftEnabledAtom = atom(false)
const shadowingDraftSpeedsAtom = atom<number[]>([])

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

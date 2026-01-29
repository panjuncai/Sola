import { atom, useAtomValue, useSetAtom } from "jotai"

const mobileMenuOpenAtom = atom<boolean>(false)

const useMobileMenuState = () => ({
  mobileMenuOpen: useAtomValue(mobileMenuOpenAtom),
})

export const useMobileMenuActions = () => ({
  setMobileMenuOpen: useSetAtom(mobileMenuOpenAtom),
})

export const useMobileMenuApi = () => ({
  ...useMobileMenuState(),
  ...useMobileMenuActions(),
})

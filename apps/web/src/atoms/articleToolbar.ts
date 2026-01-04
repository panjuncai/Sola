import { atom, useAtomValue, useSetAtom } from "jotai"

export const isLoopingAllAtom = atom(false)
export const isLoopingTargetAtom = atom(false)
export const isLoopingSingleAtom = atom(false)
export const isLoopingShadowingAtom = atom(false)
export const isRandomModeAtom = atom(false)
export const isClozeEnabledAtom = atom(false)

export const useArticleToolbarState = () => ({
  isLoopingAll: useAtomValue(isLoopingAllAtom),
  isLoopingTarget: useAtomValue(isLoopingTargetAtom),
  isLoopingSingle: useAtomValue(isLoopingSingleAtom),
  isLoopingShadowing: useAtomValue(isLoopingShadowingAtom),
  isRandomMode: useAtomValue(isRandomModeAtom),
  isClozeEnabled: useAtomValue(isClozeEnabledAtom),
})

export const useArticleToolbarActions = () => ({
  setIsLoopingAll: useSetAtom(isLoopingAllAtom),
  setIsLoopingTarget: useSetAtom(isLoopingTargetAtom),
  setIsLoopingSingle: useSetAtom(isLoopingSingleAtom),
  setIsLoopingShadowing: useSetAtom(isLoopingShadowingAtom),
  setIsRandomMode: useSetAtom(isRandomModeAtom),
  setIsClozeEnabled: useSetAtom(isClozeEnabledAtom),
})

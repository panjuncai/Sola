import { atom, useAtomValue, useSetAtom } from "jotai"

const uiIsLoopingAllAtom = atom(false)
const uiIsLoopingTargetAtom = atom(false)
const uiIsLoopingSingleAtom = atom(false)
const uiIsLoopingShadowingAtom = atom(false)
const uiIsRandomModeAtom = atom(false)
const uiIsClozeEnabledAtom = atom(false)

export const useArticleToolbarState = () => ({
  isLoopingAll: useAtomValue(uiIsLoopingAllAtom),
  isLoopingTarget: useAtomValue(uiIsLoopingTargetAtom),
  isLoopingSingle: useAtomValue(uiIsLoopingSingleAtom),
  isLoopingShadowing: useAtomValue(uiIsLoopingShadowingAtom),
  isRandomMode: useAtomValue(uiIsRandomModeAtom),
  isClozeEnabled: useAtomValue(uiIsClozeEnabledAtom),
})

export const useArticleToolbarActions = () => ({
  setIsLoopingAll: useSetAtom(uiIsLoopingAllAtom),
  setIsLoopingTarget: useSetAtom(uiIsLoopingTargetAtom),
  setIsLoopingSingle: useSetAtom(uiIsLoopingSingleAtom),
  setIsLoopingShadowing: useSetAtom(uiIsLoopingShadowingAtom),
  setIsRandomMode: useSetAtom(uiIsRandomModeAtom),
  setIsClozeEnabled: useSetAtom(uiIsClozeEnabledAtom),
})

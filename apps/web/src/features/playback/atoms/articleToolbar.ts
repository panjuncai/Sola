import { atom, useAtomValue, useSetAtom } from "jotai"

const isLoopingAllAtom = atom(false)
const isLoopingTargetAtom = atom(false)
const isLoopingSingleAtom = atom(false)
const isLoopingShadowingAtom = atom(false)
const isRandomModeAtom = atom(false)
const isClozeEnabledAtom = atom(false)

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

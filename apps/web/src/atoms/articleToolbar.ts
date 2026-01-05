import { atom, useAtomValue, useSetAtom } from "jotai"

export const isLoopingAllAtom = atom(false)
export const isLoopingTargetAtom = atom(false)
export const isLoopingSingleAtom = atom(false)
export const isLoopingShadowingAtom = atom(false)
export const isRandomModeAtom = atom(false)
export const isClozeEnabledAtom = atom(false)

type ArticleToolbarApi = {
  stopLoopPlayback: () => void
  startLoopAll: () => void
  startLoopTarget: () => void
  startLoopSingle: () => void
  handleToggleShadowing: () => void
  toggleRandomMode: () => void
  toggleCloze: () => void
  markUserSelected: () => void
  isLoopingAll: boolean
  isLoopingTarget: boolean
  isLoopingSingle: boolean
  isLoopingShadowing: boolean
  isRandomMode: boolean
  isClozeEnabled: boolean
}

export const articleToolbarApiAtom = atom<ArticleToolbarApi | null>(null)

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

export const useArticleToolbarApi = () => useAtomValue(articleToolbarApiAtom)

export const useSetArticleToolbarApi = () => useSetAtom(articleToolbarApiAtom)

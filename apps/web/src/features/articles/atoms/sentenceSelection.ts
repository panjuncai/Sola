import { atom, useAtomValue, useSetAtom } from "jotai"

const uiSelectedSentenceIdAtom = atom<string | null>(null)
const uiSelectedSentenceRoleAtom = atom<"native" | "target" | null>(null)

export const useSentenceSelectionState = () => ({
  selectedSentenceId: useAtomValue(uiSelectedSentenceIdAtom),
  selectedSentenceRole: useAtomValue(uiSelectedSentenceRoleAtom),
})

export const useSentenceSelectionActions = () => ({
  setSelectedSentenceId: useSetAtom(uiSelectedSentenceIdAtom),
  setSelectedSentenceRole: useSetAtom(uiSelectedSentenceRoleAtom),
})

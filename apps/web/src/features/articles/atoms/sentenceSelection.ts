import { atom, useAtomValue, useSetAtom } from "jotai"

const selectedSentenceIdAtom = atom<string | null>(null)
const selectedSentenceRoleAtom = atom<"native" | "target" | null>(null)

export const useSentenceSelectionState = () => ({
  selectedSentenceId: useAtomValue(selectedSentenceIdAtom),
  selectedSentenceRole: useAtomValue(selectedSentenceRoleAtom),
})

export const useSentenceSelectionActions = () => ({
  setSelectedSentenceId: useSetAtom(selectedSentenceIdAtom),
  setSelectedSentenceRole: useSetAtom(selectedSentenceRoleAtom),
})

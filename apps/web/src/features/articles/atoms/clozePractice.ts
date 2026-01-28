import type { ClozeResult } from "../hooks/init/useInitClozePractice"
import { atom, useAtomValue, useSetAtom } from "jotai"

const uiClozeInputsAtom = atom<Record<string, string>>({})
const uiClozeRevealedAtom = atom<Record<string, boolean>>({})
const uiClozeResultsAtom = atom<Record<string, ClozeResult>>({})

export const useClozePracticeState = () => ({
  clozeInputs: useAtomValue(uiClozeInputsAtom),
  clozeRevealed: useAtomValue(uiClozeRevealedAtom),
  clozeResults: useAtomValue(uiClozeResultsAtom),
})

export const useClozePracticeActions = () => ({
  setClozeInputs: useSetAtom(uiClozeInputsAtom),
  setClozeRevealed: useSetAtom(uiClozeRevealedAtom),
  setClozeResults: useSetAtom(uiClozeResultsAtom),
})

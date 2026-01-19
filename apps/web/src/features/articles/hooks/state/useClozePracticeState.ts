import {
  useClozePracticeActions as useClozePracticeActionsAtom,
  useClozePracticeState as useClozePracticeStateAtom,
} from "../../atoms/clozePractice"

export const useClozePracticeState = () => useClozePracticeStateAtom()

export const useClozePracticeActions = () => useClozePracticeActionsAtom()

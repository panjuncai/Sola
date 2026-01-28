import { useAtomValue, useSetAtom } from "jotai"

import type { User } from "@/lib/auth-types"
import {
  globalAuthIsAuthenticatedAtom,
  globalAuthLoadingAtom,
  globalAuthUserAtom,
} from "../../atoms/globalAuthAtoms"

export const useGlobalAuthState = () => ({
  user: useAtomValue(globalAuthUserAtom),
  isAuthenticated: useAtomValue(globalAuthIsAuthenticatedAtom),
  isLoading: useAtomValue(globalAuthLoadingAtom),
})

export const useGlobalAuthActions = () => {
  const setUserAtom = useSetAtom(globalAuthUserAtom)
  const setLoadingAtom = useSetAtom(globalAuthLoadingAtom)

  return {
    setUser: (user: User | null) => setUserAtom(user),
    setLoading: (value: boolean) => setLoadingAtom(value),
    reset: () => {
      setUserAtom(null)
      setLoadingAtom(false)
    },
  }
}

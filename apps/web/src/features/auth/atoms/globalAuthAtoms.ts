import { atom } from "jotai"

import type { User } from "@/lib/auth-types"

export const globalAuthUserAtom = atom<User | null>(null)
export const globalAuthLoadingAtom = atom(true)
export const globalAuthIsAuthenticatedAtom = atom((get) =>
  Boolean(get(globalAuthUserAtom))
)

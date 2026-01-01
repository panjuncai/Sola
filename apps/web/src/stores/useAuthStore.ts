import { create } from "zustand"

import type { User } from "@/lib/auth-types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  checkSession: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  checkSession: async () => {
    set({ isLoading: false })
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false })
  },
}))


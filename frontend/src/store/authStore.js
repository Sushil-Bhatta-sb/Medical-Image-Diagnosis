import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      setSession: (session) => set((state) => {
        console.log('setSession called with:', session?.user?.email)
        return {
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
          isInitialized: true,
        }
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: () => set({ 
        isInitialized: true, 
        isLoading: false 
      }),

      logout: () => set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
)

export default useAuthStore

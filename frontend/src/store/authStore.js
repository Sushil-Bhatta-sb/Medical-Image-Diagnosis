import { create } from 'zustand'

const useAuthStore = create((set) => ({
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
}))

export default useAuthStore

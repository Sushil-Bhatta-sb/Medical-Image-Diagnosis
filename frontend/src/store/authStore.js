import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setSession: (session) => set({ 
    session, 
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isLoading: false,
    isInitialized: true
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ 
    user: null, 
    session: null, 
    isAuthenticated: false,
    isLoading: false,
    isInitialized: true
  }),
}))

export default useAuthStore

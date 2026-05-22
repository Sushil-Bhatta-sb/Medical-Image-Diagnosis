import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSession: (session) => set({ 
    session, 
    isAuthenticated: !!session,
    isLoading: false
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ 
    user: null, 
    session: null, 
    isAuthenticated: false,
    isLoading: false
  }),
}))

export default useAuthStore

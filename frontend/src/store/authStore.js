import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  
  logout: () => set({ 
    user: null, 
    session: null, 
    isAuthenticated: false 
  }),
  
  initialize: (user, session) => set({
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading: false,
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;

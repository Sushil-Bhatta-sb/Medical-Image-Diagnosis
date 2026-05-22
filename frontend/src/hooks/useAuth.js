import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import useAuthStore from '../store/authStore'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const navigate = useNavigate()
  const { user, session, isLoading, isAuthenticated, setUser, setSession, setLoading, logout: logoutFromStore } = useAuthStore()
  const [error, setError] = useState(null)

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          // Call Django backend to create/get user profile
          try {
            await apiClient.get('/auth/profile/')
          } catch (e) {
            console.log('Profile fetch error:', e)
          }
          navigate('/dashboard')
        }

        if (event === 'SIGNED_OUT') {
          navigate('/auth')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setSession, setUser, setLoading, navigate])

  const login = async (email, password) => {
    setLoading(true)
    try {
      setError(null)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (authError) throw authError
      return { data }
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      toast.error(message)
      setLoading(false)
      throw err
    }
  }

  const signup = async (email, password) => {
    setLoading(true)
    try {
      setError(null)
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) throw authError
      toast.success('Signup successful! Check your email to confirm.')
      return { data }
    } catch (err) {
      const message = err.message || 'Signup failed'
      setError(message)
      toast.error(message)
      setLoading(false)
      throw err
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      setError(null)
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (authError) throw authError
      return { data }
    } catch (err) {
      const message = err.message || 'Google login failed'
      setError(message)
      toast.error(message)
      setLoading(false)
      throw err
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      logoutFromStore()
      toast.success('Logged out successfully')
      navigate('/auth')
    } catch (err) {
      const message = err.message || 'Logout failed'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    loginWithGoogle,
  }
};

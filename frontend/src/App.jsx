import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import ModelComparePage from './pages/ModelComparePage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const { setSession, setInitialized } = useAuthStore()
  const initDone = useRef(false)

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    console.log('🚀 App mounted - initializing auth...')

    // STEP 1: Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ getSession error:', error)
        setInitialized()
        return
      }
      console.log('✅ Initial session:', session ? `${session.user?.email}` : 'none (not logged in)')
      setSession(session)
    })

    // STEP 2: Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('📡 Auth event:', event, '→', session?.user?.email || 'no user')

        if (event === 'SIGNED_IN') {
          console.log('✅ SIGNED_IN event - user logged in')
          setSession(session)
        } else if (event === 'SIGNED_OUT') {
          console.log('✅ SIGNED_OUT event - user logged out')
          setSession(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('✅ TOKEN_REFRESHED - refreshing session')
          setSession(session)
        } else if (event === 'USER_UPDATED') {
          console.log('✅ USER_UPDATED - updating user')
          setSession(session)
        }
      }
    )

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [setSession, setInitialized])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/models"
        element={
          <ProtectedRoute>
            <ModelComparePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}



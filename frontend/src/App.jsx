import { useEffect } from 'react'
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
  const { setUser, setSession, setLoading, isLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth state when app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f1117',
        color: '#6366f1',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

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
}

export default App



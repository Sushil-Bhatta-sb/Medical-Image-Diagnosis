import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import ModelComparePage from './pages/ModelComparePage'
import ProfilePage from './pages/ProfilePage'

// Simple loading screen
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0f1117',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #2d3148',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}/>
      <p style={{ color: '#94a3b8' }}>Loading...</p>
      <style>{
        `@keyframes spin { to { transform: rotate(360deg); } }`
      }</style>
    </div>
  )
}

// Protected route - simple version
function ProtectedRoute({ session, loading, children }) {
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)
  // undefined = not checked yet
  // null = checked, not logged in  
  // object = checked, logged in

  useEffect(() => {
    // Get current session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session loaded:', session ? 'YES' : 'NO')
      setSession(session ?? null)
    })

    // Listen for changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth change:', event, session?.user?.email)
    if (event === 'INITIAL_SESSION') setSession(session ?? null)
    if (event === 'SIGNED_IN') setSession(session)
    if (event === 'SIGNED_OUT') setSession(null)
    if (event === 'TOKEN_REFRESHED') setSession(session)
  }
)
    return () => subscription.unsubscribe()
  }, [])

  // Still checking - show nothing
  const loading = session === undefined

  return (
    <Routes>
      <Route path="/" element={<LandingPage session={session} />} />
      
      <Route
        path="/auth"
        element={
          loading ? <LoadingScreen /> :
          session ? <Navigate to="/dashboard" replace /> :
          <AuthPage setSession={setSession} />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session} loading={loading}>
            <DashboardPage session={session} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute session={session} loading={loading}>
            <HistoryPage session={session} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/models"
        element={
          <ProtectedRoute session={session} loading={loading}>
            <ModelComparePage session={session} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute session={session} loading={loading}>
            <ProfilePage session={session} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}



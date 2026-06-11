import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import ModelComparePage from './pages/ModelComparePage'
import ProfilePage from './pages/ProfilePage'

function Spinner() {
  return (
    <div style={{
      height: '100vh',
      background: '#060b14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid #1e293b',
        borderTop: '3px solid #00d4ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#475569', fontSize: '14px' }}>
        Loading MediAI...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function Guard({ session, loading, children }) {
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const initialized = useRef(false)
  const currentUserId = useRef(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUserId.current = session?.user?.id ?? null
      setSession(session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Guard: Only update if user actually changed to prevent state disruption
        const newUserId = newSession?.user?.id ?? null
        
        if (event === 'SIGNED_IN') {
          if (currentUserId.current !== newUserId) {
            currentUserId.current = newUserId
            setSession(newSession)
          }
          // Ignore duplicate SIGNED_IN for same user
        } else if (event === 'SIGNED_OUT') {
          currentUserId.current = null
          setSession(null)
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refresh should not trigger re-render if same user
          if (currentUserId.current === newUserId) {
            // Silently update session object without state change
            // Only update if session reference actually needs refresh
          } else {
            currentUserId.current = newUserId
            setSession(newSession)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loading = session === undefined

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          loading ? <Spinner /> :
          session ? <Navigate to="/dashboard" replace /> :
          <LandingPage />
        }
      />
      <Route
        path="/auth"
        element={
          loading ? <Spinner /> :
          session ? <Navigate to="/dashboard" replace /> :
          <AuthPage setSession={setSession} />
        }
      />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <Guard session={session} loading={loading}>
          <DashboardPage session={session} />
        </Guard>
      } />
      <Route path="/history" element={
        <Guard session={session} loading={loading}>
          <HistoryPage session={session} />
        </Guard>
      } />
      <Route path="/models" element={
        <Guard session={session} loading={loading}>
          <ModelComparePage session={session} />
        </Guard>
      } />
      <Route path="/profile" element={
        <Guard session={session} loading={loading}>
          <ProfilePage session={session} />
        </Guard>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore()

  // CRITICAL: Wait until auth is fully initialized
  // Do not redirect until we know for sure if user is logged in
  if (isLoading || !isInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f1117',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #2d3148',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          letterSpacing: '0.05em'
        }}>
          Checking authentication...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Only redirect after we know auth state for certain
  if (!isAuthenticated) {
    console.log('Not authenticated - redirecting to /auth')
    return <Navigate to="/auth" replace />
  }

  console.log('Authenticated - rendering protected page')
  return children
}

import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore()

  console.log('ProtectedRoute:', { isAuthenticated, isInitialized })

  // CRITICAL: Show spinner until initialization is complete
  if (!isInitialized) {
    console.log('Auth not initialized yet - showing spinner')
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
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Checking login...
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

  // After initialization, check if authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated - redirecting to /auth')
    return <Navigate to="/auth" replace />
  }

  console.log('Authenticated - rendering dashboard')
  return children
}

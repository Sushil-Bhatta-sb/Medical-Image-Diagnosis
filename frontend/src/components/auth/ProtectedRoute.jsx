import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return children
}

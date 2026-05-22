import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'
import useAuthStore from '../store/authStore'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()

  // If already logged in redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1d2e',
        border: '1px solid #2d3148',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>
            MediAI
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {isLogin 
          ? <LoginForm onSwitch={() => setIsLogin(false)} />
          : <SignupForm onSwitch={() => setIsLogin(true)} />
        }
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, isInitialized } = useAuthStore()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log('Already logged in - redirecting to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isInitialized, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          if (error.message.includes('Invalid login credentials') || error.status === 400) {
            throw new Error('Invalid email or password. If you just signed up, please check your email to confirm your account.')
          }
          throw error
        }
        
        toast.success('Welcome back!')
        navigate('/dashboard', { replace: true })
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        
        // Check if email confirmation is required
        if (data?.user && !data.session) {
          toast.success('Account created! Check your email to confirm your account.')
        } else {
          toast.success('Account created and logged in!')
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) toast.error(error.message)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: '#0f1117',
    border: '1px solid #2d3148',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: '6px'
  }

  const labelStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    display: 'block',
    marginBottom: '16px'
  }

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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: '#6366f1',
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            MediAI
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
          </label>

          {!isLogin && (
            <label style={labelStyle}>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? 'Please wait...'
              : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #2d3148',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            Continue with Google
          </button>

          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{
                color: '#6366f1',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

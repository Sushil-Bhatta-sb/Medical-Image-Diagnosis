import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function AuthPage({ setSession }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        // Set session directly then navigate
        setSession(data.session)
        toast.success('Welcome back!')
        navigate('/dashboard', { replace: true })
        
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        
        if (data.session) {
          setSession(data.session)
          navigate('/dashboard', { replace: true })
        } else {
          toast.success('Check your email to confirm your account!')
          setIsLogin(true)
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('Account created! You can now sign in.')
        setIsLogin(true)
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
    } catch (error) {
      toast.error(error.message)
    }
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

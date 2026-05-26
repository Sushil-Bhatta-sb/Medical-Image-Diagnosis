import { useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginForm({ onLogin, onGoogleLogin, onSwitch, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localLoading, setLocalLoading] = useState(false)

  // Use the parent's loading prop if provided, otherwise fallback to local state
  const isComponentLoading = loading !== undefined ? loading : localLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalLoading(true)
    try {
      await onLogin(email, password)
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleGoogleSubmit = async (e) => {
    e.preventDefault()
    if (!onGoogleLogin) return
    
    setLocalLoading(true)
    try {
      await onGoogleLogin()
    } catch (error) {
      toast.error(error.message || 'Google login failed')
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          color: '#94a3b8',
          fontSize: '14px',
          display: 'block',
          marginBottom: '6px'
        }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#0f1117',
            border: '1px solid #2d3148',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Password Input */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          color: '#94a3b8',
          fontSize: '14px',
          display: 'block',
          marginBottom: '6px'
        }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#0f1117',
            border: '1px solid #2d3148',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Standard Email/Password Submit Button */}
      <button
        type="submit"
        disabled={isComponentLoading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#6366f1',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: isComponentLoading ? 'not-allowed' : 'pointer',
          marginBottom: '12px',
          opacity: isComponentLoading ? 0.7 : 1
        }}
      >
        {isComponentLoading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* "Continue with Google" Button */}
      <button
        type="button"
        onClick={handleGoogleSubmit}
        disabled={isComponentLoading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: isComponentLoading ? 'not-allowed' : 'pointer',
          marginBottom: '24px',
          opacity: isComponentLoading ? 0.7 : 1
        }}
      >
        Continue with Google
      </button>

      {/* Toggle Link */}
      <p style={{
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '14px'
      }}>
        No account?{' '}
        <span
          onClick={onSwitch}
          style={{
            color: '#6366f1',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Sign up
        </span>
      </p>
    </form>
  )
}
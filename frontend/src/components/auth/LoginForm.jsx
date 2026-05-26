import { useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginForm({ onLogin, onSwitch, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onLogin(email, password)
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#6366f1',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '12px',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

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
        }}
      >
        Continue with Google
      </button>

      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        No account?{' '}
        <span
          onClick={onSwitch}
          style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
        >
          Sign up
        </span>
      </p>
    </form>
  )
}

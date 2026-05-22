import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) toast.error(error.message)
  }

  return (
    <form onSubmit={handleLogin}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
          placeholder="you@example.com"
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? '#4f46e5' : '#6366f1',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '12px'
        }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
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
          marginBottom: '20px'
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

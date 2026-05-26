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

  const input = {
    width: '100%',
    padding: '10px 14px',
    background: '#0f1117',
    border: '1px solid #2d3148',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    display: 'block',
    marginTop: '6px',
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
        maxWidth: '400px'
      }}>
        <h1 style={{
          color: '#6366f1',
          textAlign: 'center',
          fontSize: '28px',
          marginBottom: '8px'
        }}>
          MediAI
        </h1>
        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          {isLogin ? 'Sign in to continue' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ color: '#94a3b8', fontSize: '13px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={input}
          />

          <label style={{ color: '#94a3b8', fontSize: '13px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={input}
          />

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
              cursor: 'pointer',
              marginBottom: '12px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '14px',
          marginTop: '16px'
        }}>
          {isLogin ? "No account? " : "Have account? "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}

import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Brain, LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar({ session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = session?.user

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out')
    navigate('/')
  }

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/history', label: 'History' },
    { path: '/models', label: 'Models' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <nav style={{
      height: '60px',
      background: 'rgba(6,11,20,0.98)',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <Brain size={22} color="#00d4ff" />
        <span style={{
          fontSize: '18px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          MediAI
        </span>
      </div>

      {/* Nav links */}
      <div style={{
        display: 'flex',
        gap: '4px',
      }}>
        {navLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              padding: '8px 16px',
              background: location.pathname === link.path
                ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: location.pathname === link.path
                ? '#00d4ff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (location.pathname !== link.path) {
                e.target.style.color = '#94a3b8'
                e.target.style.background = 'rgba(255,255,255,0.05)'
              }
            }}
            onMouseLeave={e => {
              if (location.pathname !== link.path) {
                e.target.style.color = '#64748b'
                e.target.style.background = 'transparent'
              }
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* User info + logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0f1629',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '6px 12px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '800',
            color: '#fff',
          }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span style={{
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: '500',
          }}>
            {user?.email?.split('@')[0]}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#ef4444'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#1e293b'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  )
}


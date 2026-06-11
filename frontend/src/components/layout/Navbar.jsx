import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Brain, LogOut, LayoutDashboard, Clock, BarChart2, User } from 'lucide-react'
import toast from 'react-hot-toast'

const C = {
  surface: '#ffffff',
  border: '#edeff5',
  ink: '#1f2433',
  ink2: '#6b7280',
  teal: '#14b8a6',
  tealSoft: '#dcf7f3',
  red: '#ef4444',
  redSoft: '#fee2e2',
}

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
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/models', label: 'Models', icon: BarChart2 },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      height: '100vh',
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          padding: '4px 8px',
          marginBottom: '28px',
        }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: C.tealSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Brain size={20} color={C.teal} />
        </div>
        <span style={{
          fontSize: '19px',
          fontWeight: '800',
          color: C.ink,
          letterSpacing: '-0.5px',
        }}>
          MediAI
        </span>
      </div>

      {/* Nav links */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
      }}>
        {navLinks.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                background: active ? C.tealSoft : 'transparent',
                color: active ? C.teal : C.ink2,
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: active ? '700' : '500',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = '#f5f6fb'
                  e.currentTarget.style.color = C.ink
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = C.ink2
                }
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        paddingTop: '16px',
        marginTop: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            minWidth: '34px',
            borderRadius: '50%',
            background: C.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '800',
            color: '#fff',
          }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span style={{
            color: C.ink,
            fontSize: '13px',
            fontWeight: '600',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email?.split('@')[0]}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.ink2,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = C.redSoft
            e.currentTarget.style.borderColor = C.red
            e.currentTarget.style.color = C.red
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.color = C.ink2
          }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}


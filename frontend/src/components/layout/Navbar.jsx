import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut, Brain } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(15, 17, 23, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontWeight: '700',
            fontSize: '20px',
          }}
        >
          <Brain size={28} color="var(--accent)" />
          MediAI
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'none', gap: '30px', '@media (min-width: 768px)': { display: 'flex' } }}>
          {user && (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                History
              </Link>
              <Link
                to="/models"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Models
              </Link>
            </>
          )}
        </div>

        {/* Right side - User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {user && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  {userInitials}
                </div>
                <div style={{ display: 'none, '@media (min-width: 768px)': { display: 'block' } }}>
                  <p style={{
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    margin: 0,
                  }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                <LogOut size={20} />
              </button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              '@media (min-width: 768px)': { display: 'none' },
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <Link
            to="/dashboard"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              padding: '8px 0',
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              padding: '8px 0',
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            History
          </Link>
          <Link
            to="/models"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              padding: '8px 0',
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Models
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

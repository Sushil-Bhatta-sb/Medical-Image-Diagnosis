import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, BarChart2, User, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/models', label: 'Model Comparison', icon: BarChart2 },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'block',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar-wrapper"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '250px',
          height: '100vh',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '70px',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          <X size={24} />
        </button>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive(path) ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive(path) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: isActive(path) ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive(path)) {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

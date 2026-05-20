import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginForm = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
      }}>
        Welcome Back
      </h2>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '32px',
      }}>
        Sign in to your account to continue
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
          }}>
            Email
          </label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div>
          <label style={{
            display: 'block',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
          }}>
            Password
          </label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'background-color 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => !isLoading && (e.target.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.target.style.background = 'var(--accent)')}
        >
          {isLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
        gap: '12px',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => !isLoading && (e.target.style.background = 'var(--bg-card-hover)')}
        onMouseLeave={(e) => (e.target.style.background = 'var(--bg-card)')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
        </svg>
        Google
      </button>

      <p style={{
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginTop: '24px',
      }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;

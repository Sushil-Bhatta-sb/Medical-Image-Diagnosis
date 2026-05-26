import { useHistory } from '../hooks/useHistory';
import { supabase } from '../lib/supabaseClient';
import PageWrapper from '../components/layout/PageWrapper';
import { User, Calendar, Trash2, AlertCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = ({ session }) => {
  const user = session?.user
  const { predictions } = useHistory();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) {
      toast.error('Account deletion not implemented in demo');
    }
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

  // Calculate stats
  const totalPredictions = predictions.length;
  const completedPredictions = predictions.filter((p) => p.status === 'COMPLETED').length;

  return (
    <PageWrapper session={session}>
      <div style={{ paddingTop: '20px', maxWidth: '800px' }}>
        <h1 style={{
          color: 'var(--text-primary)',
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '32px',
        }}>
          Profile
        </h1>

        {/* Profile Header */}
        <section style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid var(--border)',
          marginBottom: '32px',
        }}>
          <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: '700',
              flexShrink: 0,
            }}>
              {userInitials}
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{
                color: 'var(--text-primary)',
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 8px 0',
              }}>
                {user?.email}
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                marginBottom: '16px',
              }}>
                <Calendar size={16} />
                Member since {memberSince}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--danger)';
                  e.target.style.color = 'var(--danger)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-primary)';
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            Statistics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>
                Total Predictions
              </p>
              <p style={{
                color: 'var(--accent)',
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
              }}>
                {totalPredictions}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>
                Completed
              </p>
              <p style={{
                color: 'var(--success)',
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
              }}>
                {completedPredictions}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}>
                Success Rate
              </p>
              <p style={{
                color: 'var(--accent)',
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
              }}>
                {totalPredictions > 0 ? ((completedPredictions / totalPredictions) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border)',
          marginBottom: '32px',
        }}>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            Account Settings
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <button
              style={{
                padding: '12px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
              onClick={() => toast.info('Change password feature coming soon')}
            >
              Change Password
            </button>

            <button
              style={{
                padding: '12px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
              onClick={() => toast.info('Email preferences coming soon')}
            >
              Email Preferences
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--danger)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{
                color: 'var(--danger)',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 4px 0',
              }}>
                Danger Zone
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                margin: 0,
              }}>
                Irreversible actions that will permanently affect your account
              </p>
            </div>
          </div>

          <button
            onClick={handleDeleteAccount}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <Trash2 size={16} />
            Delete My Account Permanently
          </button>
        </section>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;

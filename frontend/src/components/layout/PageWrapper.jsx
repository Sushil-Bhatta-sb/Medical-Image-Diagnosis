import { useState } from 'react';
import Sidebar from './Sidebar';

const PageWrapper = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main
        style={{
          flex: 1,
          width: '100%',
          marginLeft: 'auto',
          '@media (min-width: 768px)': {
            marginLeft: '250px',
          },
        }}
      >
        {/* Mobile menu button (in header area) */}
        <div style={{
          display: 'flex',
          '@media (min-width: 768px)': {
            display: 'none',
          },
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 100,
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            ≡
          </button>
        </div>

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageWrapper;

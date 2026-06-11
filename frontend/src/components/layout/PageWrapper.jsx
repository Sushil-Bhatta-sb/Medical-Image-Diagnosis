import Navbar from './Navbar'

export default function PageWrapper({ session, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fb',
      display: 'flex',
      alignItems: 'flex-start',
    }}>
      <Navbar session={session} />
      <main style={{
        flex: 1,
        minWidth: 0,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 32px',
      }}>
        {children}
      </main>
    </div>
  )
}


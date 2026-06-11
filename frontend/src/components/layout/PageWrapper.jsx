import Navbar from './Navbar'

export default function PageWrapper({ session, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#060b14',
    }}>
      <Navbar session={session} />
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {children}
      </main>
    </div>
  )
}


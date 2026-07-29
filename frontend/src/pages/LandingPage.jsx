import { useNavigate } from 'react-router-dom'
import { Brain, Zap, BarChart3, 
         ArrowRight, Activity } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060b14',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* Navbar */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        background: 'rgba(6,11,20,0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Brain size={28} color="#00d4ff" />
          <span style={{
            fontSize: '20px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            MediAI
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = '#00d4ff'
              e.target.style.color = '#00d4ff'
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = '#1e293b'
              e.target.style.color = '#94a3b8'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth')}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
            }}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '100px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '20px',
          padding: '6px 16px',
          marginBottom: '32px',
        }}>
          <Activity size={14} color="#00d4ff" />
          <span style={{
            color: '#00d4ff',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            AI-Powered Medical Imaging
          </span>
        </div>

        <h1 style={{
          fontSize: '60px',
          fontWeight: '900',
          lineHeight: 1.1,
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Detect Pneumonia<br />
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            with 3 AI Models
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#64748b',
          maxWidth: '560px',
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          Upload a chest X-ray and get instant AI analysis 
          from CNN, Vision Transformer, and Classical ML models
          working together.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => navigate('/auth')}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Start Free Analysis
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          marginTop: '64px',
          paddingTop: '48px',
          borderTop: '1px solid #1e293b',
        }}>
          {[
            { value: '5,856', label: 'Training Images' },
            { value: '3', label: 'AI Models' },
            { value: '93%+', label: 'Accuracy' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '32px',
                fontWeight: '900',
                margin: '0 0 4px 0',
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {s.value}
              </p>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0,
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 40px 100px',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '48px',
          color: '#fff',
        }}>
          Three Models. One Verdict.
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>
          {[
            {
              icon: <Zap size={32} color="#00d4ff" />,
              color: '#00d4ff',
              title: 'CNN ResNet-50',
              desc: 'Deep convolutional network trained on 5,856 chest X-rays. Detects local texture patterns and abnormalities.',
            },
            {
              icon: <Brain size={32} color="#7c3aed" />,
              color: '#7c3aed',
              title: 'Vision Transformer',
              desc: 'Attention-based architecture that understands global image structure for holistic diagnosis.',
            },
            {
              icon: <BarChart3 size={32} color="#f59e0b" />,
              color: '#f59e0b',
              title: 'Classical ML (SVM)',
              desc: 'HOG feature extraction with SVM classifier. AUC-ROC of 0.93 — reliable and interpretable.',
            },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #0f1629, #0a0f1e)',
              border: `1px solid ${f.color}30`,
              borderTop: `3px solid ${f.color}`,
              borderRadius: '16px',
              padding: '32px',
            }}>
              <div style={{ marginBottom: '20px' }}>{f.icon}</div>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '12px',
              }}>
                {f.title}
              </h3>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #0f1629, #1a0a2e)',
        borderTop: '1px solid #1e293b',
        padding: '80px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          color: '#fff',
        }}>
          Ready to analyze your X-ray?
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          marginBottom: '32px',
        }}>
          Free to use. No credit card required.
        </p>
        <button
          onClick={() => navigate('/auth')}
          style={{
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '16px',
          }}
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1e293b',
        padding: '24px 40px',
        textAlign: 'center',
        color: '#475569',
        fontSize: '13px',
        background: '#060b14',
      }}>
        © 2026 MediAI — Built for educational purposes only.
        Not a substitute for professional medical advice.
      </footer>
    </div>
  )
}


import { useNavigate } from 'react-router-dom';
import { Brain, Zap, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';

const LandingPage = ({ session }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!session;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-primary)',
          fontWeight: '700',
          fontSize: '20px',
        }}>
          <Brain size={28} color="var(--accent)" />
          MediAI
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 20px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          AI-Powered Medical Image Diagnosis
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px',
        }}>
          Harness the power of deep learning and classical ML to analyze medical images with unprecedented accuracy
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            style={{
              padding: '14px 32px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px',
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          Powered by 3 Advanced Models
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {/* CNN */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Zap size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              CNN Analysis
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              Deep convolutional networks for rapid and accurate pattern recognition
            </p>
          </div>

          {/* ViT */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Brain size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              Vision Transformer
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              State-of-the-art transformer architecture for holistic image understanding
            </p>
          </div>

          {/* Classical ML */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <BarChart3 size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              Classical ML
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              Robust traditional algorithms for reliable baseline predictions
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '60px 20px',
        margin: '60px 0',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          textAlign: 'center',
        }}>
          <div>
            <p style={{
              fontSize: '40px',
              fontWeight: '800',
              color: 'var(--accent)',
              margin: '0 0 8px 0',
            }}>
              112K+
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              margin: 0,
            }}>
              Medical Images Trained
            </p>
          </div>
          <div>
            <p style={{
              fontSize: '40px',
              fontWeight: '800',
              color: 'var(--accent)',
              margin: '0 0 8px 0',
            }}>
              3
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              margin: 0,
            }}>
              Advanced AI Models
            </p>
          </div>
          <div>
            <p style={{
              fontSize: '40px',
              fontWeight: '800',
              color: 'var(--accent)',
              margin: '0 0 8px 0',
            }}>
              9
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              margin: 0,
            }}>
              Disease Classifications
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px',
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          How It Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
            }}>
              1
            </div>
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              Upload Image
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              Drag and drop your medical image or click to browse
            </p>
          </div>

          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
            }}>
              2
            </div>
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              AI Analysis
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              Our models analyze and generate predictions instantly
            </p>
          </div>

          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
            }}>
              3
            </div>
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              View Results
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              Get detailed diagnosis and confidence metrics
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
        borderTop: '1px solid var(--border)',
        padding: '60px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          Ready to Revolutionize Medical Diagnosis?
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
        }}>
          Start analyzing medical images with cutting-edge AI today
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
          style={{
            padding: '14px 32px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '32px 20px',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          margin: 0,
        }}>
          © 2024 MediAI. All rights reserved. Built for healthcare professionals.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

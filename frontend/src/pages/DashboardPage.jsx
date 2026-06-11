import { useEffect, useState } from 'react'
import { Activity, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import ImageUploader from '../components/upload/ImageUploader'
import PredictionHistoryChart from '../components/charts/PredictionHistoryChart'
import ModelLeaderboard from '../components/charts/ModelLeaderboard'
import { useHistory } from '../hooks/useHistory'
import usePredictionStore from '../store/predictionStore'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

export default function DashboardPage({ session }) {
  const user = session?.user
  const { currentPrediction } = usePredictionStore()
  const { predictions } = useHistory()
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    apiClient.get('/models/')
      .then(() => {
        setBackendStatus('connected')
      })
      .catch(() => {
        setBackendStatus('error')
        toast.error('AI engine connection dropped')
      })
  }, [])

  const totalPredictions = predictions?.length || 0
  const lastDate = predictions?.[0]?.created_at
    ? new Date(predictions[0].created_at).toLocaleDateString()
    : 'No scans run'
  
  const completed = predictions?.filter(p => p.status === 'COMPLETED') || []
  const agreed = completed.filter(
    p => p.cnn_prediction === p.vit_prediction && p.vit_prediction === p.classical_prediction
  )
  const agreementRate = completed.length > 0 ? Math.round((agreed.length / completed.length) * 100) : 0

  const getPredictionColor = (pred) => {
    if (!pred) return '#94a3b8'
    return pred === 'NORMAL' ? '#10b981' : '#ef4444'
  }

  const styles = {
    page: {
      padding: '24px',
      background: '#0a0f1e',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    card: {
      background: 'linear-gradient(135deg, #1a1f35 0%, #151929 100%)',
      border: '1px solid #2a3050',
      borderRadius: '16px',
      padding: '24px',
    },
    label: {
      color: '#64748b',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '8px',
      display: 'block',
    },
    value: {
      color: '#fff',
      fontSize: '28px',
      fontWeight: '800',
      margin: 0,
    },
  }

  return (
    <PageWrapper session={session}>
      <div style={styles.page}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              margin: '0 0 4px 0',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Medical AI Dashboard
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: backendStatus === 'connected'
              ? 'rgba(16,185,129,0.1)'
              : 'rgba(239,68,68,0.1)',
            border: `1px solid ${backendStatus === 'connected'
              ? '#10b981' : '#ef4444'}`,
            borderRadius: '8px',
            padding: '8px 16px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: backendStatus === 'connected'
                ? '#10b981' : '#ef4444',
            }} />
            <span style={{
              color: backendStatus === 'connected'
                ? '#10b981' : '#ef4444',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              {backendStatus === 'connected'
                ? 'AI Backend Online' : 'Backend Offline'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            {
              icon: <Activity size={22} color="#00d4ff" />,
              label: 'Total Scans',
              value: totalPredictions,
              color: '#00d4ff',
            },
            {
              icon: <Clock size={22} color="#7c3aed" />,
              label: 'Last Scan',
              value: lastDate,
              color: '#7c3aed',
            },
            {
              icon: <TrendingUp size={22} color="#10b981" />,
              label: 'Model Agreement',
              value: `${agreementRate}%`,
              color: '#10b981',
            },
          ].map((s, i) => (
            <div key={i} style={{
              ...styles.card,
              borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}>
                {s.icon}
                <span style={styles.label}>{s.label}</span>
              </div>
              <p style={styles.value}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Upload Section */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}>
              <Upload size={18} color="#00d4ff" />
              <h2 style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                margin: 0,
              }}>
                Upload X-Ray for Analysis
              </h2>
            </div>
            <ImageUploader />
          </div>

          {/* Model Leaderboard */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}>
              <BarChart2 size={18} color="#7c3aed" />
              <h2 style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                margin: 0,
              }}>
                Model Performance
              </h2>
            </div>
            <ModelLeaderboard />
          </div>
        </div>

        {/* RESULTS SECTION */}
        {currentPrediction &&
          currentPrediction.status === 'COMPLETED' && (
          <div style={{ marginBottom: '32px' }}>

            {/* BIG VERDICT BANNER */}
            <div style={{
              background: isNormal(currentPrediction.ensemble_prediction)
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
              border: `2px solid ${isNormal(currentPrediction.ensemble_prediction)
                ? '#10b981' : '#ef4444'}`,
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '8px' }}>
                {isNormal(currentPrediction.ensemble_prediction)
                  ? '✅' : '🫁'}
              </div>
              <h2 style={{
                fontSize: '40px',
                fontWeight: '900',
                margin: '0 0 8px 0',
                color: isNormal(currentPrediction.ensemble_prediction)
                  ? '#10b981' : '#ef4444',
              }}>
                {isNormal(currentPrediction.ensemble_prediction)
                  ? 'LUNGS NORMAL'
                  : 'PNEUMONIA DETECTED'}
              </h2>
              <p style={{
                color: '#94a3b8',
                fontSize: '16px',
                margin: '0 0 16px 0',
              }}>
                AI Confidence:{' '}
                <strong style={{ color: '#fff' }}>
                  {(currentPrediction.ensemble_confidence * 100).toFixed(1)}%
                </strong>
                {' '}| Based on 3 independent AI models
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #2a3050',
                borderRadius: '8px',
                padding: '8px 16px',
              }}>
                <Shield size={14} color="#64748b" />
                <span style={{ color: '#64748b', fontSize: '12px' }}>
                  AI screening tool only.
                  Always consult a qualified doctor for diagnosis.
                </span>
              </div>
            </div>

            {/* 3 Model Cards */}
            <h3 style={{
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}>
              Individual Model Results
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '16px',
            }}>
              {[
                {
                  name: 'CNN ResNet-50',
                  type: 'CNN',
                  color: '#00d4ff',
                  prediction: currentPrediction.cnn_prediction,
                  confidence: currentPrediction.cnn_confidence,
                  desc: 'Deep Convolutional Network',
                },
                {
                  name: 'Vision Transformer',
                  type: 'ViT',
                  color: '#7c3aed',
                  prediction: currentPrediction.vit_prediction,
                  confidence: currentPrediction.vit_confidence,
                  desc: 'Attention-based Architecture',
                },
                {
                  name: 'Classical ML (SVM)',
                  type: 'SVM',
                  color: '#f59e0b',
                  prediction: currentPrediction.classical_prediction,
                  confidence: currentPrediction.classical_confidence,
                  desc: 'HOG Features + SVM',
                },
              ].map((model, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #1a1f35, #151929)',
                  border: `1px solid ${model.color}40`,
                  borderRadius: '16px',
                  padding: '24px',
                  borderTop: `4px solid ${model.color}`,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}>
                    <div>
                      <p style={{
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '14px',
                        margin: '0 0 4px 0',
                      }}>
                        {model.name}
                      </p>
                      <p style={{
                        color: '#64748b',
                        fontSize: '11px',
                        margin: 0,
                      }}>
                        {model.desc}
                      </p>
                    </div>
                    <span style={{
                      background: `${model.color}20`,
                      color: model.color,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '800',
                    }}>
                      {model.type}
                    </span>
                  </div>

                  {/* Result */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                  }}>
                    {isNormal(model.prediction)
                      ? <CheckCircle size={24} color="#10b981" />
                      : <XCircle size={24} color="#ef4444" />
                    }
                    <span style={{
                      color: isNormal(model.prediction)
                        ? '#10b981' : '#ef4444',
                      fontSize: '22px',
                      fontWeight: '800',
                    }}>
                      {model.prediction || 'N/A'}
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}>
                      <span style={{
                        color: '#64748b',
                        fontSize: '12px',
                      }}>
                        Confidence
                      </span>
                      <span style={{
                        color: model.color,
                        fontSize: '14px',
                        fontWeight: '800',
                      }}>
                        {model.confidence
                          ? (model.confidence * 100).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                    <div style={{
                      height: '10px',
                      background: '#0a0f1e',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      border: '1px solid #2a3050',
                    }}>
                      <div style={{
                        height: '100%',
                        width: model.confidence
                          ? `${model.confidence * 100}%` : '0%',
                        background: `linear-gradient(90deg, 
                          ${model.color}, ${model.color}aa)`,
                        borderRadius: '5px',
                        transition: 'width 1.5s ease',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Agreement badge */}
            <div style={{
              background: '#1a1f35',
              border: '1px solid #2a3050',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Brain size={20} color="#7c3aed" />
              {currentPrediction.cnn_prediction ===
               currentPrediction.vit_prediction &&
               currentPrediction.vit_prediction ===
               currentPrediction.classical_prediction ? (
                <p style={{
                  color: '#10b981',
                  margin: 0,
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  ✅ All 3 models unanimously agree:{' '}
                  {currentPrediction.ensemble_prediction}
                </p>
              ) : (
                <p style={{
                  color: '#f59e0b',
                  margin: 0,
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  ⚠️ Models have different opinions —
                  ensemble used majority vote:{' '}
                  {currentPrediction.ensemble_prediction}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent History */}
        <div>
          <h2 style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Recent Scan History
          </h2>
          {predictions.length === 0 ? (
            <div style={{
              ...styles.card,
              textAlign: 'center',
              padding: '48px',
              color: '#64748b',
            }}>
              No scans yet. Upload a chest X-ray to begin analysis.
            </div>
          ) : (
            <div style={{
              background: '#1a1f35',
              border: '1px solid #2a3050',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
              {predictions.slice(0, 5).map((pred, i) => (
                <div key={i} style={{
                  padding: '16px 24px',
                  borderBottom: i < 4
                    ? '1px solid #2a3050' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}>
                    {isNormal(pred.ensemble_prediction)
                      ? <CheckCircle size={20} color="#10b981" />
                      : <XCircle size={20} color="#ef4444" />
                    }
                    <div>
                      <p style={{
                        color: isNormal(pred.ensemble_prediction)
                          ? '#10b981' : '#ef4444',
                        fontWeight: '700',
                        fontSize: '15px',
                        margin: '0 0 2px 0',
                      }}>
                        {pred.ensemble_prediction || 'Processing...'}
                      </p>
                      <p style={{
                        color: '#64748b',
                        fontSize: '12px',
                        margin: 0,
                      }}>
                        {new Date(pred.created_at)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    {pred.ensemble_confidence && (
                      <span style={{
                        color: '#94a3b8',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}>
                        {(pred.ensemble_confidence * 100).toFixed(1)}%
                        confidence
                      </span>
                    )}
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: pred.status === 'COMPLETED'
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(245,158,11,0.15)',
                      color: pred.status === 'COMPLETED'
                        ? '#10b981' : '#f59e0b',
                    }}>
                      {pred.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  )
}

import { useEffect } from 'react'
import { Activity, Clock, TrendingUp, 
         CheckCircle, XCircle, AlertCircle } from 'lucide-react'
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
  const { predictions, isLoading: historyLoading } = useHistory()

  useEffect(() => {
    apiClient.get('/models/')
      .then(res => {
        toast.success(`${res.data.length} AI models ready`)
      })
      .catch(() => toast.error('Cannot reach backend'))
  }, [])

  // Get real stats from history
  const totalPredictions = predictions.length
  const lastPrediction = predictions[0]?.created_at
    ? new Date(predictions[0].created_at).toLocaleDateString()
    : 'No predictions yet'
  
  const completedPredictions = predictions.filter(
    p => p.status === 'COMPLETED'
  )
  const agreedPredictions = completedPredictions.filter(
    p => p.cnn_prediction === p.vit_prediction && 
         p.vit_prediction === p.classical_prediction
  )
  const agreementRate = completedPredictions.length > 0
    ? Math.round((agreedPredictions.length / 
        completedPredictions.length) * 100)
    : 0

  // Helper to get prediction color
  const getPredictionColor = (prediction) => {
    if (!prediction) return '#94a3b8'
    if (prediction === 'NORMAL') return '#10b981'
    return '#ef4444'
  }

  // Helper to get prediction icon
  const getPredictionIcon = (prediction) => {
    if (!prediction) return null
    if (prediction === 'NORMAL') 
      return <CheckCircle size={20} color="#10b981" />
    return <XCircle size={20} color="#ef4444" />
  }

  return (
    <PageWrapper session={session}>
      <div style={{ paddingTop: '20px' }}>
        
        {/* Header */}
        <h1 style={{
          color: '#fff',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          Hello, {user?.email?.split('@')[0]}! 👋
        </h1>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {[
            { 
              icon: <Activity size={20} color="#6366f1" />,
              label: 'Total Predictions',
              value: totalPredictions
            },
            {
              icon: <Clock size={20} color="#6366f1" />,
              label: 'Last Prediction',
              value: lastPrediction
            },
            {
              icon: <TrendingUp size={20} color="#6366f1" />,
              label: 'Model Agreement',
              value: `${agreementRate}%`
            }
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#1a1d2e',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {stat.icon}
                <span style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {stat.label}
                </span>
              </div>
              <p style={{
                color: '#fff',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main 2-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Left: Upload */}
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Analyze X-Ray Image
            </h2>
            <ImageUploader />
          </div>

          {/* Right: Charts */}
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Analytics
            </h2>
            <PredictionHistoryChart predictions={predictions} />
            <div style={{ marginTop: '16px' }}>
              <ModelLeaderboard />
            </div>
          </div>
        </div>

        {/* Prediction Results - show after analysis */}
        {currentPrediction && 
         currentPrediction.status === 'COMPLETED' && (
          <div style={{ marginBottom: '32px' }}>
            
            {/* Final Verdict Banner */}
            <div style={{
              background: currentPrediction.ensemble_prediction === 'NORMAL'
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${getPredictionColor(
                currentPrediction.ensemble_prediction
              )}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {getPredictionIcon(currentPrediction.ensemble_prediction)}
              <div>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  margin: '0 0 4px 0',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  Final AI Verdict (Ensemble)
                </p>
                <p style={{
                  color: getPredictionColor(
                    currentPrediction.ensemble_prediction
                  ),
                  fontSize: '28px',
                  fontWeight: '800',
                  margin: 0
                }}>
                  {currentPrediction.ensemble_prediction}
                </p>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  margin: '4px 0 0 0'
                }}>
                  Confidence:{' '}
                  {(currentPrediction.ensemble_confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  margin: '0 0 4px 0'
                }}>
                  {currentPrediction.ensemble_prediction === 'NORMAL'
                    ? '✅ No signs of pneumonia detected'
                    : '⚠️ Signs of pneumonia detected'}
                </p>
                <p style={{
                  color: '#64748b',
                  fontSize: '11px',
                  margin: 0
                }}>
                  This is an AI screening tool only.
                  Consult a doctor for diagnosis.
                </p>
              </div>
            </div>

            {/* 3 Model Cards */}
            <h2 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Individual Model Results
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {[
                {
                  name: 'CNN ResNet-50',
                  type: 'CNN',
                  prediction: currentPrediction.cnn_prediction,
                  confidence: currentPrediction.cnn_confidence,
                  description: 'Convolutional Neural Network'
                },
                {
                  name: 'Vision Transformer',
                  type: 'VIT',
                  prediction: currentPrediction.vit_prediction,
                  confidence: currentPrediction.vit_confidence,
                  description: 'Transformer Architecture'
                },
                {
                  name: 'Classical ML (SVM)',
                  type: 'CLASSICAL',
                  prediction: currentPrediction.classical_prediction,
                  confidence: currentPrediction.classical_confidence,
                  description: 'HOG + SVM Features'
                }
              ].map((model, i) => (
                <div key={i} style={{
                  background: '#1a1d2e',
                  border: '1px solid #2d3148',
                  borderRadius: '12px',
                  padding: '20px',
                  borderTop: `3px solid ${getPredictionColor(
                    model.prediction
                  )}`
                }}>
                  {/* Model header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <p style={{
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '15px',
                        margin: '0 0 4px 0'
                      }}>
                        {model.name}
                      </p>
                      <p style={{
                        color: '#64748b',
                        fontSize: '12px',
                        margin: 0
                      }}>
                        {model.description}
                      </p>
                    </div>
                    <span style={{
                      background: model.type === 'CNN' 
                        ? 'rgba(99,102,241,0.2)'
                        : model.type === 'VIT'
                        ? 'rgba(139,92,246,0.2)'
                        : 'rgba(245,158,11,0.2)',
                      color: model.type === 'CNN'
                        ? '#6366f1'
                        : model.type === 'VIT'
                        ? '#8b5cf6'
                        : '#f59e0b',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {model.type}
                    </span>
                  </div>

                  {/* Prediction result */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {getPredictionIcon(model.prediction)}
                    <span style={{
                      color: getPredictionColor(model.prediction),
                      fontSize: '20px',
                      fontWeight: '800'
                    }}>
                      {model.prediction || 'N/A'}
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <span style={{
                        color: '#94a3b8',
                        fontSize: '12px'
                      }}>
                        Confidence
                      </span>
                      <span style={{
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {model.confidence
                          ? (model.confidence * 100).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: '#2d3148',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: model.confidence
                          ? `${model.confidence * 100}%`
                          : '0%',
                        background: getPredictionColor(model.prediction),
                        borderRadius: '4px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Model Agreement */}
            <div style={{
              background: '#1a1d2e',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={20} color="#6366f1" />
              {currentPrediction.cnn_prediction === 
               currentPrediction.vit_prediction &&
               currentPrediction.vit_prediction === 
               currentPrediction.classical_prediction ? (
                <p style={{
                  color: '#10b981',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  ✅ All 3 models agree: {currentPrediction.ensemble_prediction}
                </p>
              ) : (
                <p style={{
                  color: '#f59e0b',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  ⚠️ Models disagree — ensemble used majority vote
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent History */}
        <div>
          <h2 style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Recent Predictions
          </h2>
          {predictions.length === 0 ? (
            <div style={{
              background: '#1a1d2e',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              No predictions yet. Upload an X-ray to get started!
            </div>
          ) : (
            <div style={{
              background: '#1a1d2e',
              border: '1px solid #2d3148',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {predictions.slice(0, 5).map((pred, i) => (
                <div key={i} style={{
                  padding: '16px 20px',
                  borderBottom: i < 4
                    ? '1px solid #2d3148'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {getPredictionIcon(pred.ensemble_prediction)}
                    <div>
                      <p style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '14px',
                        margin: '0 0 2px 0'
                      }}>
                        {pred.ensemble_prediction || 'Processing...'}
                      </p>
                      <p style={{
                        color: '#64748b',
                        fontSize: '12px',
                        margin: 0
                      }}>
                        {new Date(pred.created_at).toLocaleDateString()}{' '}
                        {new Date(pred.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '12px'
                    }}>
                      {pred.ensemble_confidence
                        ? (pred.ensemble_confidence * 100).toFixed(1) + '%'
                        : ''}
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: pred.status === 'COMPLETED'
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(245,158,11,0.2)',
                      color: pred.status === 'COMPLETED'
                        ? '#10b981'
                        : '#f59e0b'
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

import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { usePrediction } from '../hooks/usePrediction'
import { useHistory } from '../hooks/useHistory'
import usePredictionStore from '../store/predictionStore'
import PageWrapper from '../components/layout/PageWrapper'
import ImageUploader from '../components/upload/ImageUploader'
import PredictionCard from '../components/prediction/PredictionCard'
import ModelComparisonRow from '../components/prediction/ModelComparisonRow'
import PredictionHistoryChart from '../components/charts/PredictionHistoryChart'
import ModelLeaderboard from '../components/charts/ModelLeaderboard'
import { Clock, TrendingUp, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '../lib/apiClient'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { currentPrediction } = usePredictionStore()
  const { predictions: historyPredictions, isLoading: historyLoading } = useHistory()

  // Test backend connection on mount
  useEffect(() => {
    apiClient.get('/models/')
      .then(res => {
        console.log('Backend connected successfully:', res.data)
        toast.success('AI Backend connected!')
      })
      .catch(err => {
        console.error('Backend error:', err.response?.status, err.message)
        toast.error('Backend connection failed')
      })
  }, [])

  // Mock stats
  const stats = {
    totalPredictions: 24,
    lastPrediction: '2 hours ago',
    agreementRate: '87%',
  }

  const recentPredictions = historyPredictions.slice(0, 5)

  return (
    <PageWrapper>
      <div style={{ paddingTop: '20px' }}>
        {/* Welcome Section */}
        <section style={{ marginBottom: '40px' }}>
          <h1 style={{
            color: 'var(--text-primary)',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 32px 0',
          }}>
            Hello, {user?.email?.split('@')[0]}! 👋
          </h1>

          {/* Stats Row */}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <Zap size={20} color="var(--accent)" />
                <span style={{
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  Total Predictions
                </span>
              </div>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
              }}>
                {stats.totalPredictions}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <Clock size={20} color="var(--accent)" />
                <span style={{
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  Last Prediction
                </span>
              </div>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
              }}>
                {stats.lastPrediction}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <TrendingUp size={20} color="var(--accent)" />
                <span style={{
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  Model Agreement
                </span>
              </div>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
              }}>
                {stats.agreementRate}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - 2 Column Layout */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '40px',
          '@media (max-width: 1200px)': {
            gridTemplateColumns: '1fr',
          },
        }}>
          {/* Left Column - Upload & Predictions */}
          <div>
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              Analyze Image
            </h2>
            <ImageUploader />

            {/* Predictions */}
            {currentPrediction && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                }}>
                  Model Predictions
                </h3>
                <div style={{
                  display: 'grid',
                  gap: '16px',
                }}>
                  {currentPrediction.cnn_result && (
                    <PredictionCard
                      modelName="CNN ResNet-50"
                      modelType="Convolutional Neural Network"
                      prediction={currentPrediction.cnn_result.prediction}
                      confidence={currentPrediction.cnn_result.confidence}
                    />
                  )}
                  {currentPrediction.vit_result && (
                    <PredictionCard
                      modelName="Vision Transformer"
                      modelType="Transformer Architecture"
                      prediction={currentPrediction.vit_result.prediction}
                      confidence={currentPrediction.vit_result.confidence}
                    />
                  )}
                  {currentPrediction.classical_result && (
                    <PredictionCard
                      modelName="XGBoost"
                      modelType="Classical ML"
                      prediction={currentPrediction.classical_result.prediction}
                      confidence={currentPrediction.classical_result.confidence}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Charts & History */}
          <div>
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              Analytics
            </h2>

            <PredictionHistoryChart />

            <div style={{ marginTop: '24px' }}>
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                Recent Predictions
              </h3>
              {recentPredictions.length > 0 ? (
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                }}>
                  {recentPredictions.map((pred, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        borderBottom: idx < recentPredictions.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <p style={{
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                      }}>
                        Prediction #{pred.id}
                      </p>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        margin: 0,
                      }}>
                        Status: {pred.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '20px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                  }}>
                    No predictions yet. Upload an image to get started!
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px' }}>
              <ModelLeaderboard />
            </div>
          </div>
        </section>

        {/* Model Comparison Section */}
        {currentPrediction && (
          <section>
            <ModelComparisonRow
              cnnResult={currentPrediction.cnn_result}
              vitResult={currentPrediction.vit_result}
              classicalResult={currentPrediction.classical_result}
              ensembleResult={currentPrediction.ensemble_result}
            />
          </section>
        )}
      </div>
    </PageWrapper>
  );
};

const ZapIcon = Zap;

export default DashboardPage;

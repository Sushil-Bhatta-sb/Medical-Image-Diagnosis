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
    page: { background: '#0a0f1e', minHeight: '100vh', color: '#ffffff', fontFamily: 'system-ui, sans-serif' },
    card: { background: 'linear-gradient(135deg, #161b33 0%, #0d1124 100%)', border: '1px solid #252b48', borderRadius: '16px', padding: '24px' },
    statTitle: { color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 },
    statValue: { color: '#ffffff', fontSize: '28px', fontWeight: '800', margin: '12px 0 0 0' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
    sectionTitle: { fontSize: '16px', fontWeight: '700', margin: 0, color: '#e2e8f0' },
  }

  const stats = [
    { icon: <Activity size={20} color="#00d4ff" />, label: 'Total Scans Processed', value: totalPredictions, accent: '#00d4ff' },
    { icon: <Clock size={20} color="#7c3aed" />, label: 'Last Scan Date', value: lastDate, accent: '#7c3aed' },
    { icon: <TrendingUp size={20} color="#38bdf8" />, label: 'Consensus Rate', value: `${agreementRate}%`, accent: '#38bdf8' },
  ]

  return (
    <PageWrapper session={session}>
      <div style={styles.page}>

        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 6px 0', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              X-Ray Analysis Terminal
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              Active Session: <span style={{ color: '#00d4ff', fontWeight: '600' }}>{user?.email}</span>
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: backendStatus === 'connected' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${backendStatus === 'connected' ? '#10b981' : '#ef4444'}`,
            borderRadius: '20px', padding: '8px 16px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendStatus === 'connected' ? '#10b981' : '#ef4444' }} />
            <span style={{ color: backendStatus === 'connected' ? '#10b981' : '#ef4444', fontSize: '12px', fontWeight: '700' }}>
              {backendStatus === 'connected' ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${stat.accent}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${stat.accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {stat.icon}
                </div>
                <p style={styles.statTitle}>{stat.label}</p>
              </div>
              <p style={styles.statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Workspace: Upload + Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '24px', marginBottom: '28px', alignItems: 'start' }}>
          {/* Upload column */}
          <div>
            <div style={styles.sectionHeader}>
              <Activity size={18} color="#00d4ff" />
              <h2 style={{ ...styles.sectionTitle, color: '#00d4ff' }}>Drop Radiograph File Below</h2>
            </div>
            <ImageUploader />
          </div>

          {/* Analytics column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={styles.sectionHeader}>
                <TrendingUp size={18} color="#7c3aed" />
                <h2 style={{ ...styles.sectionTitle, color: '#7c3aed' }}>Scan Activity (7 Days)</h2>
              </div>
              <div style={styles.card}>
                <PredictionHistoryChart predictions={predictions || []} />
              </div>
            </div>
            <div>
              <div style={styles.sectionHeader}>
                <Shield size={18} color="#38bdf8" />
                <h2 style={{ ...styles.sectionTitle, color: '#38bdf8' }}>Model Leaderboard</h2>
              </div>
              <div style={styles.card}>
                <ModelLeaderboard />
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION PREDICTION BANNER BLOCK */}
        {currentPrediction && currentPrediction.status === 'COMPLETED' && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              background: currentPrediction.ensemble_prediction === 'NORMAL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `2px solid ${getPredictionColor(currentPrediction.ensemble_prediction)}`,
              borderRadius: '16px', padding: '32px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {currentPrediction.ensemble_prediction === 'NORMAL' 
                  ? <CheckCircle size={48} color="#10b981" /> 
                  : <XCircle size={48} color="#ef4444" />
                }
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Ensemble System Diagnosis Result
                  </span>
                  <h2 style={{ color: getPredictionColor(currentPrediction.ensemble_prediction), fontSize: '36px', fontWeight: '900', margin: '4px 0' }}>
                    {currentPrediction.ensemble_prediction === 'NORMAL' ? 'LUNGS NORMAL' : 'PNEUMONIA DETECTED'}
                  </h2>
                  <p style={{ color: '#ffffff', fontSize: '15px', margin: 0 }}>
                    Confidence Score Assessment:{' '}
                    <span style={{ color: '#00d4ff', fontWeight: '700' }}>{(currentPrediction.ensemble_confidence * 100).toFixed(1)}%</span>
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', maxWidth: '320px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>🛡️ AI Screening Metric Guardrail</span>
                <p style={{ color: '#64748b', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
                  This automated system output is optimized to sort radiograph scans. Final physical diagnosis confirmation must be corroborated via official clinical testing.
                </p>
              </div>
            </div>

            {/* Individual Engine Readouts */}
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#94a3b8', textTransform: 'uppercase' }}>
              Isolated Architecture Node Outputs
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { name: 'Convolutional Deep Layer (ResNet-50)', type: 'CNN', pred: currentPrediction.cnn_prediction, conf: currentPrediction.cnn_confidence },
                { name: 'Vision Transformer (ViT-Base)', type: 'ViT', pred: currentPrediction.vit_prediction, conf: currentPrediction.vit_confidence },
                { name: 'Classical Edge Vector (HOG + SVM)', type: 'ML', pred: currentPrediction.classical_prediction, conf: currentPrediction.classical_confidence }
              ].map((model, i) => (
                <div key={i} style={{ ...styles.card, borderTop: `4px solid ${getPredictionColor(model.pred)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700', margin: 0 }}>{model.name}</h4>
                    <span style={{ color: '#00d4ff', fontSize: '11px', fontWeight: '700' }}>{model.type}</span>
                  </div>
                  <p style={{ color: getPredictionColor(model.pred), fontSize: '20px', fontWeight: '900', margin: '0 0 16px 0' }}>
                    {model.pred || 'PROCESSING'}
                  </p>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', color: '#94a3b8' }}>
                      <span>Model Weight Confidence</span>
                      <span style={{ color: '#fff' }}>{model.conf ? `${(model.conf * 100).toFixed(1)}%` : '0%'}</span>
                    </div>
                    <div style={{ height: '6px', background: '#1c213a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: model.conf ? `${model.conf * 100}%` : '0%', background: getPredictionColor(model.pred) }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent History */}
        <div>
          <div style={styles.sectionHeader}>
            <Clock size={18} color="#94a3b8" />
            <h2 style={styles.sectionTitle}>Recent Scan History</h2>
          </div>
          {(!predictions || predictions.length === 0) ? (
            <div style={{ ...styles.card, textAlign: 'center', padding: '48px', color: '#64748b' }}>
              No scans yet. Upload a chest X-ray above to begin analysis.
            </div>
          ) : (
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
              {predictions.slice(0, 5).map((pred, i, arr) => (
                <div key={i} style={{
                  padding: '16px 24px',
                  borderBottom: i < arr.length - 1 ? '1px solid #252b48' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {pred.ensemble_prediction === 'NORMAL'
                      ? <CheckCircle size={20} color="#10b981" />
                      : pred.ensemble_prediction
                        ? <XCircle size={20} color="#ef4444" />
                        : <AlertCircle size={20} color="#f59e0b" />}
                    <div>
                      <p style={{ color: getPredictionColor(pred.ensemble_prediction), fontWeight: '700', fontSize: '15px', margin: '0 0 2px 0' }}>
                        {pred.ensemble_prediction || 'Processing...'}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                        {pred.created_at ? new Date(pred.created_at).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {pred.ensemble_confidence != null && (
                      <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
                        {(pred.ensemble_confidence * 100).toFixed(1)}% confidence
                      </span>
                    )}
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      background: pred.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: pred.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
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


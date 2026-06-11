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
    page: { padding: '24px', background: '#0a0f1e', minHeight: '100vh', color: '#ffffff', fontFamily: 'system-ui, sans-serif' },
    card: { background: 'linear-gradient(135deg, #161b33 0%, #0d1124 100%)', border: '1px solid #252b48', borderRadius: '16px', padding: '24px' },
    statTitle: { color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', margin: 0 },
    statValue: { color: '#ffffff', fontSize: '26px', fontWeight: '800', margin: '8px 0 0 0' }
  }

  return (
    <PageWrapper session={session}>
      <div style={styles.page}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px 0', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
            borderRadius: '20px', padding: '6px 16px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendStatus === 'connected' ? '#10b981' : '#ef4444' }} />
            <span style={{ color: backendStatus === 'connected' ? '#10b981' : '#ef4444', fontSize: '12px', fontWeight: '700' }}>
              {backendStatus === 'connected' ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { icon: <Activity size={20} color="#00d4ff" />, label: 'Total Scans Processed', value: totalPredictions },
            { icon: <Clock size={20} color="#7c3aed" />, label: 'Last Scan Date', value: lastDate },
            { icon: <TrendingUp size={20} color="#38bdf8" />, label: 'Consensus Rate', value: `${agreementRate}%` }
          ].map((stat, i) => (
            <div key={i} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {stat.icon}
                <p style={styles.statTitle}>{stat.label}</p>
              </div>
              <p style={styles.statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Input workspace layout panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#00d4ff' }}>Drop Radiograph File Below</h2>
            <ImageUploader />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#7c3aed' }}>Analytics Overview</h2>
            <div style={styles.card}>
              <PredictionHistoryChart predictions={predictions || []} />
              <div style={{ marginTop: '20px' }}>
                <ModelLeaderboard />
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION PREDICTION BANNER BLOCK */}
        {currentPrediction && currentPrediction.status === 'COMPLETED' && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              background: currentPrediction.ensemble_prediction === 'NORMAL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `2px solid ${getPredictionColor(currentPrediction.ensemble_prediction)}`,
              borderRadius: '16px', padding: '32px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
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
      </div>
    </PageWrapper>
  )
}

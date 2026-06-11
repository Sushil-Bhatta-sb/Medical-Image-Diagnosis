import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Droplet, Stethoscope, ScanLine,
  CheckCircle, XCircle, AlertCircle, Shield, ChevronDown
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import PageWrapper from '../components/layout/PageWrapper'
import ImageUploader from '../components/upload/ImageUploader'
import ModelLeaderboard from '../components/charts/ModelLeaderboard'
import { useHistory } from '../hooks/useHistory'
import usePredictionStore from '../store/predictionStore'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

/* ---------- Soft pastel palette ---------- */
const C = {
  pageBg: '#f5f6fb',
  card: '#ffffff',
  border: '#edeff5',
  ink: '#1f2433',
  ink2: '#6b7280',
  ink3: '#9aa1b2',
  amber: '#f59e0b',
  amberSoft: '#fef3e2',
  coral: '#f43f5e',
  coralSoft: '#fde7ee',
  teal: '#14b8a6',
  tealSoft: '#dcf7f3',
  green: '#16a34a',
  greenSoft: '#dcfce7',
  red: '#ef4444',
  redSoft: '#fee2e2',
}

export default function DashboardPage({ session }) {
  const user = session?.user
  const { currentPrediction } = usePredictionStore()
  const { predictions } = useHistory()
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    apiClient.get('/models/')
      .then(() => setBackendStatus('connected'))
      .catch(() => {
        setBackendStatus('error')
        toast.error('AI engine connection dropped')
      })
  }, [])

  /* ---------- Derived metrics ---------- */
  const completed = useMemo(
    () => predictions?.filter(p => p.status === 'COMPLETED') || [],
    [predictions]
  )

  const totalPredictions = predictions?.length || 0

  const agreed = completed.filter(
    p => p.cnn_prediction === p.vit_prediction && p.vit_prediction === p.classical_prediction
  )
  const agreementRate = completed.length > 0
    ? Math.round((agreed.length / completed.length) * 100)
    : 0

  const pneumoniaCount = completed.filter(p => p.ensemble_prediction === 'PNEUMONIA').length

  /* ---------- 7-day buckets for sparklines + activity chart ---------- */
  const daily = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        key: d.toDateString(),
        scans: 0, agreed: 0, disagreed: 0, pneumonia: 0,
      })
    }
    completed.forEach(p => {
      const bucket = days.find(x => x.key === new Date(p.created_at).toDateString())
      if (!bucket) return
      bucket.scans++
      const allAgree = p.cnn_prediction === p.vit_prediction && p.vit_prediction === p.classical_prediction
      allAgree ? bucket.agreed++ : bucket.disagreed++
      if (p.ensemble_prediction === 'PNEUMONIA') bucket.pneumonia++
    })
    return days
  }, [completed])

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const getPredictionColor = (pred) => {
    if (!pred) return C.ink3
    return pred === 'NORMAL' ? C.green : C.red
  }

  /* ---------- Reusable styles ---------- */
  const card = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '18px',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
  }

  /* ---------- Metric cards config ---------- */
  const metrics = [
    {
      title: 'Total Scans',
      icon: <ScanLine size={18} color={C.amber} />,
      iconBg: C.amberSoft,
      value: totalPredictions,
      unit: 'scans',
      pill: { text: 'Tracked', bg: C.amberSoft, color: C.amber },
      stroke: C.amber,
      fill: 'urlAmber',
      data: daily.map(d => ({ v: d.scans })),
    },
    {
      title: 'Consensus Rate',
      icon: <Activity size={18} color={C.teal} />,
      iconBg: C.tealSoft,
      value: agreementRate,
      unit: '%',
      pill: agreementRate >= 70
        ? { text: 'Healthy', bg: C.greenSoft, color: C.green }
        : { text: 'Mixed', bg: C.amberSoft, color: C.amber },
      stroke: C.teal,
      fill: 'urlTeal',
      data: daily.map(d => ({ v: d.scans ? Math.round((d.agreed / d.scans) * 100) : 0 })),
    },
    {
      title: 'Pneumonia Flags',
      icon: <Droplet size={18} color={C.coral} />,
      iconBg: C.coralSoft,
      value: pneumoniaCount,
      unit: 'cases',
      pill: { text: 'Detected', bg: C.coralSoft, color: C.coral },
      stroke: C.coral,
      fill: 'urlCoral',
      data: daily.map(d => ({ v: d.pneumonia })),
    },
  ]

  return (
    <PageWrapper session={session}>
      <div style={{ background: C.pageBg, minHeight: '100vh', borderRadius: '20px', padding: '28px', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.ink, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Health Overview
            </h1>
            <p style={{ color: C.ink3, margin: 0, fontSize: '13px' }}>{today} · {user?.email}</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: backendStatus === 'connected' ? C.greenSoft : C.redSoft,
            borderRadius: '999px', padding: '8px 16px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendStatus === 'connected' ? C.green : C.red }} />
            <span style={{ color: backendStatus === 'connected' ? C.green : C.red, fontSize: '12px', fontWeight: '700' }}>
              {backendStatus === 'connected' ? 'AI Engine Online' : 'Engine Offline'}
            </span>
          </div>
        </div>

        {/* Metric cards w/ sparklines */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ ...card, padding: '20px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: m.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.icon}
                  </div>
                  <span style={{ color: C.ink2, fontSize: '13px', fontWeight: '600' }}>{m.title}</span>
                </div>
                <span style={{ background: m.pill.bg, color: m.pill.color, fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px' }}>
                  {m.pill.text}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '30px', fontWeight: '800', color: C.ink, lineHeight: 1 }}>{m.value}</span>
                <span style={{ fontSize: '12px', color: C.ink3, fontWeight: '600' }}>{m.unit}</span>
              </div>

              <div style={{ height: '46px', margin: '0 -20px -20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={m.data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={m.fill} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={m.stroke} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={m.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={m.stroke} strokeWidth={2.5} fill={`url(#${m.fill})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Upload + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
          {/* Upload card */}
          <div style={{ ...card, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Stethoscope size={18} color={C.teal} />
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: C.ink, margin: 0 }}>New X-Ray Analysis</h2>
            </div>
            <ImageUploader />
          </div>

          {/* Activity Growth chart */}
          <div style={{ ...card, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: C.ink, margin: 0 }}>Activity Growth</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 10px', color: C.ink2, fontSize: '12px', fontWeight: '600' }}>
                Last 7 Days <ChevronDown size={14} />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={daily} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="label" stroke={C.ink3} tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <YAxis stroke={C.ink3} tickLine={false} axisLine={false} allowDecimals={false} style={{ fontSize: '11px' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '12px', color: C.ink }}
                />
                <Bar dataKey="agreed" name="Consensus" fill={C.teal} radius={[6, 6, 0, 0]} maxBarSize={14} />
                <Bar dataKey="disagreed" name="Split" fill={C.amber} radius={[6, 6, 0, 0]} maxBarSize={14} />
                <Bar dataKey="pneumonia" name="Pneumonia" fill={C.coral} radius={[6, 6, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              {[
                { c: C.teal, t: 'Consensus' },
                { c: C.amber, t: 'Split' },
                { c: C.coral, t: 'Pneumonia' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.c }} />
                  <span style={{ fontSize: '12px', color: C.ink2 }}>{l.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest diagnosis result */}
        {currentPrediction && currentPrediction.status === 'COMPLETED' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              ...card,
              borderLeft: `6px solid ${getPredictionColor(currentPrediction.ensemble_prediction)}`,
              padding: '28px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {currentPrediction.ensemble_prediction === 'NORMAL'
                  ? <CheckCircle size={44} color={C.green} />
                  : <XCircle size={44} color={C.red} />}
                <div>
                  <span style={{ color: C.ink3, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ensemble Diagnosis
                  </span>
                  <h2 style={{ color: getPredictionColor(currentPrediction.ensemble_prediction), fontSize: '30px', fontWeight: '800', margin: '4px 0' }}>
                    {currentPrediction.ensemble_prediction === 'NORMAL' ? 'Lungs Normal' : 'Pneumonia Detected'}
                  </h2>
                  <p style={{ color: C.ink2, fontSize: '14px', margin: 0 }}>
                    Confidence:{' '}
                    <span style={{ color: C.ink, fontWeight: '700' }}>
                      {(currentPrediction.ensemble_confidence * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px', color: C.ink3, fontSize: '11px', lineHeight: 1.5 }}>
                <Shield size={14} color={C.ink3} />
                AI screening aid only. Confirm final diagnosis with clinical testing by a qualified physician.
              </div>
            </div>

            {/* Individual model readouts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { name: 'CNN ResNet-50', type: 'CNN', pred: currentPrediction.cnn_prediction, conf: currentPrediction.cnn_confidence, accent: C.amber },
                { name: 'Vision Transformer', type: 'ViT', pred: currentPrediction.vit_prediction, conf: currentPrediction.vit_confidence, accent: C.teal },
                { name: 'Classical (HOG+SVM)', type: 'ML', pred: currentPrediction.classical_prediction, conf: currentPrediction.classical_confidence, accent: C.coral },
              ].map((m, i) => (
                <div key={i} style={{ ...card, padding: '20px', borderTop: `4px solid ${m.accent}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: C.ink, fontSize: '14px', fontWeight: '700', margin: 0 }}>{m.name}</h4>
                    <span style={{ background: `${m.accent}1f`, color: m.accent, fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px' }}>{m.type}</span>
                  </div>
                  <p style={{ color: getPredictionColor(m.pred), fontSize: '20px', fontWeight: '800', margin: '0 0 14px 0' }}>
                    {m.pred || 'PROCESSING'}
                  </p>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: C.ink3 }}>
                      <span>Confidence</span>
                      <span style={{ color: C.ink, fontWeight: '600' }}>{m.conf ? `${(m.conf * 100).toFixed(1)}%` : '0%'}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f2f7', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: m.conf ? `${m.conf * 100}%` : '0%', background: m.accent, borderRadius: '999px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom row: Leaderboard + Recent history */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div style={{ ...card, padding: '22px' }}>
            <ModelLeaderboard />
          </div>

          <div style={{ ...card, padding: '22px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: C.ink, margin: '0 0 16px 0' }}>Recent Scans</h2>
            {(!predictions || predictions.length === 0) ? (
              <p style={{ color: C.ink3, fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No scans yet. Upload a chest X-ray to begin.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {predictions.slice(0, 5).map((pred, i, arr) => (
                  <div key={i} style={{
                    padding: '12px 0',
                    borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {pred.ensemble_prediction === 'NORMAL'
                        ? <CheckCircle size={18} color={C.green} />
                        : pred.ensemble_prediction
                          ? <XCircle size={18} color={C.red} />
                          : <AlertCircle size={18} color={C.amber} />}
                      <div>
                        <p style={{ color: getPredictionColor(pred.ensemble_prediction), fontWeight: '700', fontSize: '14px', margin: '0 0 2px 0' }}>
                          {pred.ensemble_prediction || 'Processing...'}
                        </p>
                        <p style={{ color: C.ink3, fontSize: '11px', margin: 0 }}>
                          {pred.created_at ? new Date(pred.created_at).toLocaleString() : '—'}
                        </p>
                      </div>
                    </div>
                    {pred.ensemble_confidence != null && (
                      <span style={{ color: C.ink2, fontSize: '12px', fontWeight: '600' }}>
                        {(pred.ensemble_confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}


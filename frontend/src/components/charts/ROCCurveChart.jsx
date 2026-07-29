import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ROCCurveChart = () => {
  // Mock ROC curve data
  const data = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.4 },
    { fpr: 0.2, tpr: 0.6 },
    { fpr: 0.3, tpr: 0.75 },
    { fpr: 0.4, tpr: 0.85 },
    { fpr: 0.5, tpr: 0.9 },
    { fpr: 0.6, tpr: 0.93 },
    { fpr: 0.7, tpr: 0.95 },
    { fpr: 0.8, tpr: 0.96 },
    { fpr: 0.9, tpr: 0.98 },
    { fpr: 1, tpr: 1 },
  ];

  // Random baseline
  const baseline = data.map(d => ({ fpr: d.fpr, tpr: d.fpr }));

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid var(--border)',
    }}>
      <h3 style={{
        color: 'var(--text-primary)',
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        ROC Curve Analysis
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="fpr"
            label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -5 }}
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
            }}
            formatter={(value) => value.toFixed(3)}
            labelFormatter={(value) => `FPR: ${value.toFixed(3)}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="tpr"
            stroke="var(--accent)"
            dot={false}
            isAnimationActive={false}
            name="CNN Model (AUC: 0.92)"
          />
          <Line
            type="monotone"
            data={baseline}
            dataKey="tpr"
            stroke="var(--warning)"
            dot={false}
            isAnimationActive={false}
            strokeDasharray="5 5"
            name="ViT Model (AUC: 0.94)"
          />
          <Line
            type="monotone"
            data={data.map((d) => ({
              fpr: d.fpr,
              tpr: d.tpr * 0.85,
            }))}
            dataKey="tpr"
            stroke="var(--text-muted)"
            dot={false}
            isAnimationActive={false}
            name="Classical ML (AUC: 0.78)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ROCCurveChart;

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PredictionHistoryChart = ({ predictions = [] }) => {
  // Mock data for last 7 days
  const data = [
    { date: 'Mon', agreed: 12, disagreed: 2 },
    { date: 'Tue', agreed: 15, disagreed: 1 },
    { date: 'Wed', agreed: 10, disagreed: 3 },
    { date: 'Thu', agreed: 18, disagreed: 2 },
    { date: 'Fri', agreed: 20, disagreed: 1 },
    { date: 'Sat', agreed: 8, disagreed: 2 },
    { date: 'Sun', agreed: 14, disagreed: 4 },
  ];

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
        Prediction History (7 Days)
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
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
          />
          <Legend />
          <Bar
            dataKey="agreed"
            fill="var(--success)"
            name="Models Agreed"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="disagreed"
            fill="var(--warning)"
            name="Models Disagreed"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionHistoryChart;

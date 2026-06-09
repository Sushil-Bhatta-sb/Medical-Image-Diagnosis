import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PredictionHistoryChart = ({ predictions = [] }) => {
  // Process real predictions into chart data grouped by date
  const data = useMemo(() => {
    if (!predictions.length) {
      return [];
    }

    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toDateString(),
        agreed: 0,
        disagreed: 0
      });
    }

    // Count predictions per day
    predictions.forEach(pred => {
      if (pred.status !== 'COMPLETED') return;
      
      const predDate = new Date(pred.created_at).toDateString();
      const dayData = days.find(d => d.fullDate === predDate);
      
      if (dayData) {
        const allAgree = pred.cnn_prediction === pred.vit_prediction &&
                         pred.vit_prediction === pred.classical_prediction;
        if (allAgree) {
          dayData.agreed++;
        } else {
          dayData.disagreed++;
        }
      }
    });

    return days;
  }, [predictions]);

  const hasData = data.some(d => d.agreed > 0 || d.disagreed > 0);

  return (
    <div style={{
      background: '#1a1d2e',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #2d3148',
    }}>
      <h3 style={{
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        Prediction History (7 Days)
      </h3>

      {!hasData ? (
        <div style={{
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          No prediction data for the last 7 days
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1d2e',
                border: '1px solid #2d3148',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar
              dataKey="agreed"
              fill="#10b981"
              name="Models Agreed"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="disagreed"
              fill="#f59e0b"
              name="Models Disagreed"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PredictionHistoryChart;

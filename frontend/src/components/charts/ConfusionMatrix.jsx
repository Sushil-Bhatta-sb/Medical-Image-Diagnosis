const ConfusionMatrix = ({ title = 'Confusion Matrix' }) => {
  // Mock 3x3 confusion matrix
  const data = [
    [450, 30, 20],
    [25, 420, 35],
    [15, 40, 425],
  ];

  const labels = ['Normal', 'Disease A', 'Disease B'];
  const maxValue = Math.max(...data.flat());

  const getColor = (value) => {
    const intensity = value / maxValue;
    const r = Math.round(99 + (239 - 99) * intensity);
    const g = Math.round(102 + (68 - 102) * intensity);
    const b = Math.round(241 + (68 - 241) * intensity);
    return `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})`;
  };

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
        margin: '0 0 20px 0',
      }}>
        {title}
      </h3>

      <div style={{
        overflow: 'auto',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)',
                fontWeight: '600',
              }}>
                Predicted
              </th>
              {labels.map((label) => (
                <th
                  key={label}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: '600',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: 'var(--text-primary)',
                  borderRight: '1px solid var(--border)',
                  fontWeight: '600',
                  background: 'var(--bg-primary)',
                }}>
                  {labels[i]}
                </td>
                {row.map((value, j) => (
                  <td
                    key={j}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      background: getColor(value),
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      borderRight: j < row.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '12px',
        marginTop: '12px',
        margin: '12px 0 0 0',
      }}>
        Accuracy: 92.3% | Precision: 91.8% | Recall: 92.1%
      </p>
    </div>
  );
};

export default ConfusionMatrix;

const ConfidenceBar = ({ confidence, label }) => {
  const percentage = Math.round(confidence * 100);
  let barColor = 'var(--danger)';
  
  if (confidence > 0.8) {
    barColor = 'var(--success)';
  } else if (confidence > 0.6) {
    barColor = 'var(--warning)';
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          fontWeight: '500',
        }}>
          {label}
        </span>
        <span style={{
          color: barColor,
          fontSize: '13px',
          fontWeight: '600',
        }}>
          {percentage}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'var(--bg-primary)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div
          style={{
            height: '100%',
            background: barColor,
            width: `${percentage}%`,
            transition: 'width 0.6s ease-out',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;

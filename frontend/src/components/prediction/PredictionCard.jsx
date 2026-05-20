import { DISEASE_LABELS } from '../../lib/constants';
import ConfidenceBar from './ConfidenceBar';
import GradCAMOverlay from './GradCAMOverlay';

const PredictionCard = ({ modelName, modelType, prediction, confidence, gradcamUrl }) => {
  let borderColor = 'var(--danger)';
  let bgColor = 'rgba(239, 68, 68, 0.1)';
  
  if (confidence > 0.8) {
    borderColor = 'var(--success)';
    bgColor = 'rgba(16, 185, 129, 0.1)';
  } else if (confidence > 0.6) {
    borderColor = 'var(--warning)';
    bgColor = 'rgba(245, 158, 11, 0.1)';
  }

  const diseaseLabel = DISEASE_LABELS[prediction] || `Disease ${prediction}`;

  return (
    <div style={{
      background: bgColor,
      border: `1.5px solid ${borderColor}`,
      borderRadius: '12px',
      padding: '16px',
      animation: 'slideInUp 0.5s ease-out',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div>
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 4px 0',
          }}>
            {modelName}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '12px',
            margin: 0,
          }}>
            {modelType}
          </p>
        </div>
        <div style={{
          background: borderColor,
          color: 'white',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
        }}>
          {Math.round(confidence * 100)}%
        </div>
      </div>

      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
      }}>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          margin: '0 0 6px 0',
          letterSpacing: '0.5px',
        }}>
          Prediction
        </p>
        <p style={{
          color: borderColor,
          fontSize: '20px',
          fontWeight: '700',
          margin: 0,
        }}>
          {diseaseLabel}
        </p>
      </div>

      <ConfidenceBar confidence={confidence} label="Confidence" />

      {gradcamUrl && (
        <GradCAMOverlay originalUrl={gradcamUrl} gradcamUrl={gradcamUrl} />
      )}
    </div>
  );
};

export default PredictionCard;

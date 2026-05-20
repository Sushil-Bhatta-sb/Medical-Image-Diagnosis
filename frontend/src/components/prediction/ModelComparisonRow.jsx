import { DISEASE_LABELS } from '../../lib/constants';
import { Trophy, Check, X } from 'lucide-react';

const ModelComparisonRow = ({ cnnResult, vitResult, classicalResult, ensembleResult }) => {
  const getResultDisplay = (result) => {
    if (!result) return null;
    return DISEASE_LABELS[result.prediction] || `Disease ${result.prediction}`;
  };

  const cnnLabel = getResultDisplay(cnnResult);
  const vitLabel = getResultDisplay(vitResult);
  const classicalLabel = getResultDisplay(classicalResult);
  const ensembleLabel = getResultDisplay(ensembleResult);

  const allAgree = cnnLabel === vitLabel && vitLabel === classicalLabel;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid var(--border)',
      marginTop: '20px',
    }}>
      <h3 style={{
        color: 'var(--text-primary)',
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        Model Comparison
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {/* CNN */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${allAgree ? 'var(--success)' : 'var(--border)'}`,
        }}>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
          }}>
            CNN
          </p>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 6px 0',
          }}>
            {cnnLabel}
          </p>
          <p style={{
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: '600',
            margin: 0,
          }}>
            {cnnResult ? `${Math.round(cnnResult.confidence * 100)}%` : 'N/A'}
          </p>
        </div>

        {/* ViT */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${allAgree ? 'var(--success)' : 'var(--border)'}`,
        }}>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
          }}>
            Vision Transformer
          </p>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 6px 0',
          }}>
            {vitLabel}
          </p>
          <p style={{
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: '600',
            margin: 0,
          }}>
            {vitResult ? `${Math.round(vitResult.confidence * 100)}%` : 'N/A'}
          </p>
        </div>

        {/* Classical ML */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${allAgree ? 'var(--success)' : 'var(--border)'}`,
        }}>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
          }}>
            Classical ML
          </p>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 6px 0',
          }}>
            {classicalLabel}
          </p>
          <p style={{
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: '600',
            margin: 0,
          }}>
            {classicalResult ? `${Math.round(classicalResult.confidence * 100)}%` : 'N/A'}
          </p>
        </div>

        {/* Ensemble */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid var(--accent)',
          gridColumn: 'span 1',
          '@media (max-width: 767px)': {
            gridColumn: 'span 1',
          },
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}>
            <Trophy size={16} color="var(--accent)" />
            <p style={{
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: '700',
              margin: 0,
              textTransform: 'uppercase',
            }}>
              Ensemble
            </p>
          </div>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 6px 0',
          }}>
            {ensembleLabel}
          </p>
          <p style={{
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: '600',
            margin: 0,
          }}>
            {ensembleResult ? `${Math.round(ensembleResult.confidence * 100)}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Agreement status */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: allAgree ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {allAgree ? (
          <Check size={18} color="var(--success)" />
        ) : (
          <X size={18} color="var(--warning)" />
        )}
        <span style={{
          color: allAgree ? 'var(--success)' : 'var(--warning)',
          fontSize: '13px',
          fontWeight: '600',
        }}>
          {allAgree
            ? 'All models agree on this prediction'
            : 'Models disagree - review results carefully'}
        </span>
      </div>
    </div>
  );
};

export default ModelComparisonRow;

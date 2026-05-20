import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { Trophy, Star } from 'lucide-react';

const ModelLeaderboard = () => {
  // Mock data - in real app would fetch from API
  const mockLeaderboard = [
    { rank: 1, name: 'Vision Transformer v2', type: 'ViT', accuracy: 0.94, auc: 0.954, f1: 0.942 },
    { rank: 2, name: 'CNN ResNet-50', type: 'CNN', accuracy: 0.92, auc: 0.924, f1: 0.918 },
    { rank: 3, name: 'XGBoost Ensemble', type: 'Classical', accuracy: 0.88, auc: 0.872, f1: 0.874 },
  ];

  const getScoreColor = (score) => {
    if (score >= 0.9) return 'var(--success)';
    if (score >= 0.8) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <Trophy size={20} color="var(--accent)" />
        <h3 style={{
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: '600',
          margin: 0,
        }}>
          Model Leaderboard
        </h3>
      </div>

      <div style={{
        overflow: 'auto',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}>
                Rank
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}>
                Model Name
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}>
                Type
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}>
                Accuracy
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}>
                AUC-ROC
              </th>
              <th style={{
                padding: '12px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}>
                F1 Score
              </th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((model) => (
              <tr
                key={model.rank}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: model.rank === 1 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                }}
              >
                <td style={{
                  padding: '12px',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {model.rank === 1 && <Star size={16} fill="var(--accent)" color="var(--accent)" />}
                    <span>#{model.rank}</span>
                  </div>
                </td>
                <td style={{
                  padding: '12px',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontWeight: '500',
                }}>
                  {model.name}
                </td>
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: 'var(--accent)',
                  fontWeight: '500',
                }}>
                  {model.type}
                </td>
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: getScoreColor(model.accuracy),
                  fontWeight: '600',
                }}>
                  {(model.accuracy * 100).toFixed(1)}%
                </td>
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: getScoreColor(model.auc),
                  fontWeight: '600',
                }}>
                  {model.auc.toFixed(3)}
                </td>
                <td style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: getScoreColor(model.f1),
                  fontWeight: '600',
                }}>
                  {model.f1.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelLeaderboard;

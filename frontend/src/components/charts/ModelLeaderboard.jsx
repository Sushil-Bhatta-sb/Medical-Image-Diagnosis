import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { Trophy, Star, Loader2 } from 'lucide-react';

const ModelLeaderboard = () => {
  // Fetch real model data from API
  const { data: models, isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await apiClient.get('/models/');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sort by accuracy and add rank
  const leaderboard = models
    ?.filter(m => m.is_active)
    .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))
    .map((model, idx) => ({
      rank: idx + 1,
      name: model.name,
      type: model.model_type,
      accuracy: model.accuracy || 0,
      auc: model.auc_roc || 0,
      f1: model.f1_score || 0,
    })) || [];

  const getScoreColor = (score) => {
    if (score >= 0.9) return '#10b981';
    if (score >= 0.8) return '#f59e0b';
    return '#ef4444';
  };

  const getTypeColor = (type) => {
    if (type === 'CNN') return '#6366f1';
    if (type === 'VIT') return '#8b5cf6';
    return '#f59e0b';
  };

  return (
    <div style={{
      background: '#1a1d2e',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #2d3148',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <Trophy size={20} color="#6366f1" />
        <h3 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: '600',
          margin: 0,
        }}>
          Model Leaderboard
        </h3>
      </div>

      {isLoading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#64748b'
        }}>
          <Loader2 size={20} className="animate-spin" style={{ marginRight: '8px' }} />
          Loading models...
        </div>
      ) : error ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          Failed to load model data
        </div>
      ) : leaderboard.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          No models registered yet
        </div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2d3148' }}>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}>
                  Rank
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}>
                  Model Name
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}>
                  Type
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}>
                  Accuracy
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}>
                  AUC-ROC
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}>
                  F1 Score
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((model) => (
                <tr
                  key={model.rank}
                  style={{
                    borderBottom: '1px solid #2d3148',
                    background: model.rank === 1 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  }}
                >
                  <td style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: '#fff',
                    fontWeight: '600',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      {model.rank === 1 && <Star size={16} fill="#6366f1" color="#6366f1" />}
                      <span>#{model.rank}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'left',
                    color: '#fff',
                    fontWeight: '500',
                  }}>
                    {model.name}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <span style={{
                      background: `${getTypeColor(model.type)}20`,
                      color: getTypeColor(model.type),
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {model.type}
                    </span>
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
      )}
    </div>
  );
};

export default ModelLeaderboard;

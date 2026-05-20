import { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import PageWrapper from '../components/layout/PageWrapper';
import { Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const HistoryPage = () => {
  const { predictions, isLoading } = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPredictions = predictions.filter(
    (p) => p.id.toString().includes(searchTerm) || p.status.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedPredictions = filteredPredictions.slice(startIdx, startIdx + itemsPerPage);

  const handleExportCSV = () => {
    if (predictions.length === 0) {
      toast.error('No predictions to export');
      return;
    }

    const headers = ['ID', 'Status', 'CNN Prediction', 'ViT Prediction', 'Classical Prediction', 'Date'];
    const rows = predictions.map((p) => [
      p.id,
      p.status,
      p.cnn_result?.prediction || 'N/A',
      p.vit_result?.prediction || 'N/A',
      p.classical_result?.prediction || 'N/A',
      new Date(p.created_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predictions.csv';
    a.click();
    toast.success('Downloaded predictions.csv');
  };

  return (
    <PageWrapper>
      <div style={{ paddingTop: '20px' }}>
        <h1 style={{
          color: 'var(--text-primary)',
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
        }}>
          Prediction History
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          marginBottom: '32px',
        }}>
          View and analyze all your medical image predictions
        </p>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{
            flex: 1,
            minWidth: '250px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : predictions.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              marginBottom: '12px',
            }}>
              No predictions yet
            </p>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}>
              Start by uploading a medical image on the Dashboard
            </p>
          </div>
        ) : (
          <>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
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
                      background: 'var(--bg-primary)',
                    }}>
                      ID
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      background: 'var(--bg-primary)',
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      background: 'var(--bg-primary)',
                    }}>
                      CNN
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      background: 'var(--bg-primary)',
                    }}>
                      ViT
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      background: 'var(--bg-primary)',
                    }}>
                      Classical
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      background: 'var(--bg-primary)',
                    }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPredictions.map((pred, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.05)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <td style={{
                        padding: '12px',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                      }}>
                        #{pred.id}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                      }}>
                        <span style={{
                          background: pred.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: pred.status === 'COMPLETED' ? 'var(--success)' : 'var(--warning)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {pred.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}>
                        {pred.cnn_result ? `${Math.round(pred.cnn_result.confidence * 100)}%` : '-'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}>
                        {pred.vit_result ? `${Math.round(pred.vit_result.confidence * 100)}%` : '-'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}>
                        {pred.classical_result ? `${Math.round(pred.classical_result.confidence * 100)}%` : '-'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'left',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                      }}>
                        {new Date(pred.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
              }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '8px 12px',
                      background: currentPage === page ? 'var(--accent)' : 'var(--bg-card)',
                      color: currentPage === page ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.target.style.background = 'var(--bg-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.target.style.background = 'var(--bg-card)';
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default HistoryPage;

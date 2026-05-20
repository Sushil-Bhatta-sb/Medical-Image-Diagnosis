import PageWrapper from '../components/layout/PageWrapper';
import ModelLeaderboard from '../components/charts/ModelLeaderboard';
import ROCCurveChart from '../components/charts/ROCCurveChart';
import ConfusionMatrix from '../components/charts/ConfusionMatrix';

const ModelComparePage = () => {
  return (
    <PageWrapper>
      <div style={{ paddingTop: '20px' }}>
        <h1 style={{
          color: 'var(--text-primary)',
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
        }}>
          Model Performance Comparison
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          marginBottom: '32px',
        }}>
          Detailed performance metrics and comparison of all three AI models
        </p>

        {/* Leaderboard */}
        <section style={{ marginBottom: '40px' }}>
          <ModelLeaderboard />
        </section>

        {/* ROC Curve */}
        <section style={{ marginBottom: '40px' }}>
          <ROCCurveChart />
        </section>

        {/* Metrics Cards */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            Model Metrics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {/* CNN */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border)',
            }}>
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
              }}>
                CNN ResNet-50
              </h3>

              <div style={{
                display: 'grid',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    Accuracy
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    92.1%
                  </p>
                </div>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    AUC-ROC
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    0.924
                  </p>
                </div>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    F1 Score
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    0.918
                  </p>
                </div>
              </div>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
              }}>
                Deep convolutional architecture excels at pattern recognition in medical images. Fast inference time with strong accuracy.
              </p>
            </div>

            {/* ViT */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '24px',
              border: '2px solid var(--accent)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0,
                }}>
                  Vision Transformer
                </h3>
                <span style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>
                  BEST
                </span>
              </div>

              <div style={{
                display: 'grid',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    Accuracy
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    94.3%
                  </p>
                </div>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    AUC-ROC
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    0.954
                  </p>
                </div>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    F1 Score
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    0.942
                  </p>
                </div>
              </div>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
              }}>
                State-of-the-art transformer achieves highest accuracy with superior contextual understanding of medical images.
              </p>
            </div>

            {/* Classical ML */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border)',
            }}>
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
              }}>
                XGBoost Ensemble
              </h3>

              <div style={{
                display: 'grid',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    Accuracy
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    88.2%
                  </p>
                </div>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    AUC-ROC
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    0.872
                  </p>
                </div>
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}>
                    F1 Score
                  </p>
                  <p style={{
                    color: 'var(--accent)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                  }}>
                    0.874
                  </p>
                </div>
              </div>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
              }}>
                Reliable baseline using gradient boosting. Provides interpretable results and serves as verification model.
              </p>
            </div>
          </div>
        </section>

        {/* Confusion Matrices */}
        <section>
          <h2 style={{
            color: 'var(--text-primary)',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            Confusion Matrices
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            <ConfusionMatrix title="CNN ResNet-50" />
            <ConfusionMatrix title="Vision Transformer" />
            <ConfusionMatrix title="XGBoost Ensemble" />
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default ModelComparePage;

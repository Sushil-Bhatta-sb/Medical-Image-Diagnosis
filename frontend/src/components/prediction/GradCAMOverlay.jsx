import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const GradCAMOverlay = ({ originalUrl, gradcamUrl }) => {
  const [showGradCAM, setShowGradCAM] = useState(false);

  return (
    <div style={{
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
      marginTop: '12px',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
      }}>
        <img
          src={originalUrl}
          alt="Original X-ray"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: showGradCAM ? 0.3 : 1,
            transition: 'opacity 0.3s',
          }}
        />
        {showGradCAM && (
          <img
            src={gradcamUrl}
            alt="Grad-CAM Overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'fadeIn 0.3s ease-out',
            }}
          />
        )}
      </div>

      <button
        onClick={() => setShowGradCAM(!showGradCAM)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: '600',
          backdropFilter: 'blur(4px)',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
      >
        {showGradCAM ? (
          <>
            <Eye size={14} />
            Original
          </>
        ) : (
          <>
            <EyeOff size={14} />
            AI Map
          </>
        )}
      </button>

      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
        backdropFilter: 'blur(4px)',
      }}>
        {showGradCAM ? 'AI Attention Map' : 'X-ray Image'}
      </div>
    </div>
  );
};

export default GradCAMOverlay;

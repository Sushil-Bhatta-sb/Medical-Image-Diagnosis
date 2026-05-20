import { X, RefreshCw } from 'lucide-react';

const ImagePreview = ({ file, onRemove }) => {
  const fileSize = (file.size / 1024).toFixed(2);
  const previewUrl = URL.createObjectURL(file);

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}>
        <img
          src={previewUrl}
          alt="Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
      }}>
        <p style={{
          color: 'var(--text-primary)',
          fontSize: '14px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {file.name}
        </p>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '12px',
          margin: '0 0 12px 0',
        }}>
          {fileSize} KB • {file.type}
        </p>

        <button
          onClick={onRemove}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--danger)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.color = 'var(--danger)';
          }}
        >
          <X size={16} />
          Remove & Choose Another
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;

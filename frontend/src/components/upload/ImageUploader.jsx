import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePrediction } from '../../hooks/usePrediction';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { submitImage, isAnalyzing } = usePrediction();

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only JPEG and PNG images are accepted');
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: false,
    disabled: isAnalyzing,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    await submitImage(selectedFile);
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Drop Zone — always visible when no file selected */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive
              ? 'rgba(99,102,241,0.08)'
              : 'transparent',
            border: isDragActive
              ? '2px dashed #6366f1'
              : '2px dashed var(--border)',
            borderRadius: '12px',
            transition: 'all 0.2s',
          }}
        >
          <input {...getInputProps()} />
          <Upload size={48} style={{
            margin: '0 auto 16px',
            color: '#6366f1',
            display: 'block',
          }} />
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 8px 0',
          }}>
            {isDragActive
              ? 'Drop your image here'
              : 'Drag and drop your X-ray'}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            margin: '0 0 8px 0',
          }}>
            or click to browse files
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            margin: 0,
          }}>
            Supports JPG, PNG — Max 10MB
          </p>
        </div>
      )}

      {/* Preview + Buttons — shown after file selected */}
      {selectedFile && (
        <div style={{ padding: '16px' }}>
          {/* Image Preview */}
          <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '12px',
            maxHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f1117',
          }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* File Info */}
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            margin: '0 0 12px 0',
          }}>
            {selectedFile.name} —{' '}
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            style={{
              width: '100%',
              padding: '14px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
              opacity: isAnalyzing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                Analyzing...
              </>
            ) : (
              '🔬 Analyze Image'
            )}
          </button>

          {/* Remove Button */}
          {!isAnalyzing && (
            <button
              onClick={handleRemove}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <X size={16} />
              Remove & Choose Another
            </button>
          )}
        </div>
      )}

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <Loader2
            size={32}
            style={{
              color: '#6366f1',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
              display: 'block',
            }}
          />
          <p style={{
            color: 'var(--text-primary)',
            fontWeight: '600',
            margin: '0 0 4px 0',
          }}>
            AI Models Analyzing...
          </p>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            margin: 0,
          }}>
            CNN, ViT and Classical ML are processing your image
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;
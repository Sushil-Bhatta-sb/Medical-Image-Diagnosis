import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePrediction } from '../../hooks/usePrediction';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImagePreview from './ImagePreview';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { submitImage, isAnalyzing } = usePrediction();

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only JPEG, PNG, and DICOM images are accepted');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
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

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    await submitImage(selectedFile);
    setSelectedFile(null);
  };

  if (selectedFile && !isAnalyzing) {
    return <ImagePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />;
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '40px',
      border: '2px dashed var(--border)',
      transition: 'all 0.3s',
      cursor: isAnalyzing ? 'not-allowed' : 'pointer',
      opacity: isAnalyzing ? 0.6 : 1,
    }}>
      <div
        {...getRootProps()}
        style={{
          textAlign: 'center',
          cursor: isAnalyzing ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '20px',
          background: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
          borderRadius: '8px',
          border: isDragActive ? '2px solid var(--accent)' : 'none',
        }}
      >
        <input {...getInputProps()} disabled={isAnalyzing} />

        {isAnalyzing ? (
          <>
            <Loader2 size={48} style={{
              margin: '0 auto 16px',
              color: 'var(--accent)',
              animation: 'spin 1s linear infinite',
            }} />
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 8px 0',
            }}>
              Analyzing Image
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              margin: 0,
            }}>
              Please wait while our AI models analyze your medical image...
            </p>
          </>
        ) : (
          <>
            <Upload size={48} style={{
              margin: '0 auto 16px',
              color: 'var(--accent)',
            }} />
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 8px 0',
            }}>
              {isDragActive ? 'Drop your image here' : 'Drag and drop your X-ray'}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              margin: '0 0 12px 0',
            }}>
              or click to select from your computer
            </p>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '12px',
              margin: 0,
            }}>
              Supports JPG, PNG (Max 10MB)
            </p>
          </>
        )}
      </div>

      {selectedFile && !isAnalyzing && (
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
        >
          Analyze Image
        </button>
      )}
    </div>
  );
};

export default ImageUploader;

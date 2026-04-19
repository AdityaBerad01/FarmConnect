import { useState, useRef } from 'react';
import { HiOutlinePhoto, HiOutlineXMark } from 'react-icons/hi2';

export default function ImageUpload({ images = [], onChange, maxImages = 5 }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;

    if (remaining <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = fileArray
      .filter(f => f.type.startsWith('image/'))
      .slice(0, remaining);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange([...images, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="image-upload-wrapper">
      {/* Preview */}
      {images.length > 0 && (
        <div className="image-upload-preview">
          {images.map((img, index) => (
            <div key={index} className="image-upload-thumb">
              <img src={img} alt={`Upload ${index + 1}`} />
              <button
                type="button"
                className="image-upload-remove"
                onClick={() => removeImage(index)}
              >
                <HiOutlineXMark />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          className={`image-upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <HiOutlinePhoto style={{ fontSize: '2rem', color: 'var(--color-primary-light)' }} />
          <p style={{ fontWeight: 500, marginTop: '0.5rem' }}>
            Click or drag images here
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {images.length}/{maxImages} images • JPG, PNG supported
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}

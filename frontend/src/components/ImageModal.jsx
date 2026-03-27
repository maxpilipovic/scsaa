import React, { useEffect } from 'react';

function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 z-60 bg-white/90 rounded-full p-2 hover:bg-white"
        >
          ✕
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[90vh] object-contain rounded-md shadow-lg bg-white"
        />
      </div>
    </div>
  );
}

export default ImageModal;

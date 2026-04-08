import React, { useState } from 'react';
import ImageModal from './ImageModal';

// Loads images placed in `src/assets/dashboard-gallery`. Add images there to show in the dashboard gallery.
const modules = import.meta.glob('../assets/dashboard-gallery/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });
const imageUrls = Object.keys(modules)
  .sort()
  .map((k) => {
    const mod = modules[k];
    return (mod && (mod.default ?? mod)) || k;
  });

function DashboardGallery() {
  const [openSrc, setOpenSrc] = useState(null);
  const [openAlt, setOpenAlt] = useState('');

  return (
    <section id="dashboard-gallery" className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageUrls.map((src, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-lg group cursor-pointer" onClick={() => { setOpenSrc(src); setOpenAlt(`Dashboard gallery ${idx + 1}`); }}>
              <img
                src={src}
                alt={`Dashboard gallery ${idx + 1}`}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
        {openSrc && <ImageModal src={openSrc} alt={openAlt} onClose={() => setOpenSrc(null)} />}
      </div>
    </section>
  );
}

export default DashboardGallery;

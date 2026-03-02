import React, { useState, useEffect, useRef } from 'react';
import ImageModal from './ImageModal';

// Loads images placed in `src/assets/landing-gallery`. If that folder is empty,
// fall back to loading images from `src/assets` so the landing page still shows images.
const landingModules = import.meta.glob('../assets/landing-gallery/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });
const fallbackModules = import.meta.glob('../assets/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });
const pickModules = Object.keys(landingModules).length ? landingModules : fallbackModules;
const imageUrls = Object.keys(pickModules)
  .sort()
  .map((k) => {
    const mod = pickModules[k];
    return (mod && (mod.default ?? mod)) || k;
  });

function LandingGallery() {
  const [openSrc, setOpenSrc] = useState(null);
  const [openAlt, setOpenAlt] = useState('');

  // Create 4 slideshows (2x2). Evenly distribute images among them.
  const SLIDESHOW_COUNT = 4;
  const DURATION_MS = 8000; // 8s per slide (slower)
  // No stagger — all slideshows start together

  const chunks = Array.from({ length: SLIDESHOW_COUNT }, (_, i) =>
    imageUrls.filter((_, idx) => idx % SLIDESHOW_COUNT === i)
  );

  function Slideshow({ images, slotIndex }) {
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      if (!images.length) return;
      if (paused) return;
      ref.current = setInterval(() => setI((s) => (s + 1) % images.length), DURATION_MS);
      return () => {
        if (ref.current) clearInterval(ref.current);
      };
    }, [images.length, paused]);

    useEffect(() => {
      if (paused && ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      } else if (!paused && !ref.current && images.length) {
        ref.current = setInterval(() => setI((s) => (s + 1) % images.length), DURATION_MS);
      }
      return () => {};
    }, [paused, images.length]);

    return (
      <div className="relative rounded-lg overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {images.length ? (
          <img
            src={images[i]}
            alt={`Slide ${i + 1}`}
            className="w-full h-80 md:h-96 object-cover bg-purple-50 cursor-pointer"
            onClick={() => { setOpenSrc(images[i]); setOpenAlt(`Slide ${i + 1}`); }}
          />
        ) : (
          <div className="w-full h-80 md:h-96 flex items-center justify-center text-purple-700">No images</div>
        )}
      </div>
    );
  }

  return (
    <section id="landing-gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-purple-900 text-center mb-4">Brotherhood Memories</h2>
        <p className="text-purple-700 text-center mb-12 max-w-2xl mx-auto">
          Capturing moments of fellowship, service, and lifelong friendships
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chunks.map((images, idx) => (
            <div key={idx} className="h-full">
              <Slideshow images={images} slotIndex={idx} />
            </div>
          ))}



          {openSrc && <ImageModal src={openSrc} alt={openAlt} onClose={() => setOpenSrc(null)} />}
        </div>
      </div>
    </section>
  );
}

export default LandingGallery;

import React from 'react';
import { Image } from 'lucide-react';

function Gallery() {
  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-purple-900 text-center mb-4">Brotherhood Memories</h2>
        <p className="text-purple-700 text-center mb-12 max-w-2xl mx-auto">
          Capturing moments of fellowship, service, and lifelong friendships
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Photo 1 - Large */}
          <div className="lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-2xl group bg-purple-200">
            <div className="aspect-[4/3] flex items-center justify-center">
              <div className="text-center">
                <Image className="text-purple-400 mx-auto mb-4" size={64} />
                <p className="text-purple-700 font-semibold">Annual Brotherhood Reunion</p>
                <p className="text-purple-600 text-sm">Photo Coming Soon</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <div className="text-white">
                <h3 className="font-bold text-xl mb-1">2024 Annual Reunion</h3>
                <p className="text-sm">Over 200 brothers gathered to celebrate our legacy</p>
              </div>
            </div>
          </div>

          {/* Photo 2 */}
          <div className="relative overflow-hidden rounded-2xl group bg-amber-200">
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center">
                <Image className="text-amber-600 mx-auto mb-2" size={48} />
                <p className="text-purple-700 font-semibold text-sm">Homecoming Game</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Homecoming 2024</h3>
              </div>
            </div>
          </div>

          {/* Photo 3 */}
          <div className="relative overflow-hidden rounded-2xl group bg-purple-200">
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center">
                <Image className="text-purple-500 mx-auto mb-2" size={48} />
                <p className="text-purple-700 font-semibold text-sm">Service Project</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Community Service</h3>
              </div>
            </div>
          </div>

          {/* Photo 4 */}
          <div className="relative overflow-hidden rounded-2xl group bg-amber-200">
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center">
                <Image className="text-amber-600 mx-auto mb-2" size={48} />
                <p className="text-purple-700 font-semibold text-sm">Golf Tournament</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Alumni Golf Classic</h3>
              </div>
            </div>
          </div>

          {/* Photo 5 */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl group bg-purple-100">
            <div className="aspect-[2/1] flex items-center justify-center">
              <div className="text-center">
                <Image className="text-purple-500 mx-auto mb-2" size={48} />
                <p className="text-purple-700 font-semibold text-sm">Founders Day Celebration</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Founders Day 2024</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gallery;
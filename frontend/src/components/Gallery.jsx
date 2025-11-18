//import React from 'react';
//import image1 from '../assets/image1.JPEG';
import image2 from '../assets/image2.JPG';
//import image3 from '../assets/image3.JPG';
//import image4 from '../assets/image4.JPG';
//import image5 from '../assets/image5.JPG';
//import image6 from '../assets/image6.JPG';
import image7 from '../assets/image7.JPG';
//import image8 from '../assets/image8.JPG';
//import image9 from '../assets/image9.JPG';
import image10 from '../assets/image10.JPG';
//import image11 from '../assets/image11.JPG';
//import image12 from '../assets/image12.JPG';
import image13 from '../assets/image13.JPG';
//import image14 from '../assets/image14.JPG';
//import image15 from '../assets/image15.JPG';
//import image16 from '../assets/image16.JPG';
//import image17 from '../assets/image17.JPG';
//import image18 from '../assets/image18.JPG';
//import image19 from '../assets/image19.JPG';
import image20 from '../assets/image20.JPG';

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
          <div className="lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-2xl group">
            <img
              src={image2}
              alt="Annual Brotherhood Reunion"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <div className="text-white">
                <h3 className="font-bold text-xl mb-1">2024 Annual Reunion</h3>
                <p className="text-sm">Over 40 brothers attended</p>
              </div>
            </div>
          </div>

          {/* Photo 2 */}
          <div className="relative overflow-hidden rounded-2xl group">
            <img
              src={image7}
              alt="Homecoming Game"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">1977 Greek Week Games</h3>
              </div>
            </div>
          </div>

          {/* Photo 3 */}
          <div className="relative overflow-hidden rounded-2xl group">
            <img
              src={image13}
              alt="Service Project"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">2018</h3>
              </div>
            </div>
          </div>

          {/* Photo 4 */}
          <div className="relative overflow-hidden rounded-2xl group">
            <img
              src={image20}
              alt="Golf Tournament"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Tugs 2012</h3>
              </div>
            </div>
          </div>

          {/* Photo 5 */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl group">
            <img
              src={image10}
              alt="Founders Day Celebration"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-purple-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Greek Week 1985</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gallery;

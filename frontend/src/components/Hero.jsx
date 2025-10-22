
import React from 'react';

function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-purple-50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-15 inline-block">
          <span className="bg-white text-purple-700 px-4 py-2 rounded-full text-3xl font-semibold border border-purple-300">
            Sidwell, Crook, Stewart Alumni Association
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition">
            Join the Association
          </button>
          <button className="bg-white text-purple-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-purple-300">
            Member Login
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
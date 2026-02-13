
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate(); //Allow for navigation

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-purple-50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900">
            Sidwell, Crook, Stewart
          </h1>
          <p className="mt-2 text-xl sm:text-2xl font-serif text-gray-700">
            Alumni Association · Beta-Gamma Chapter
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition">
            Join the Association
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-purple-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-purple-300"
          >
            Member Login
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
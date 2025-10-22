
import React from 'react';
import { Users, Calendar, CreditCard } from 'lucide-react';

function Benefits() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-purple-900 text-center mb-4">Why Join SCSAA?</h2>
        <p className="text-purple-700 text-center mb-12 max-w-2xl mx-auto">
          Maintain your connection to the brotherhood and enjoy exclusive member benefits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition">
            <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-purple-900 mb-2">Exclusive Events</h3>
            <p className="text-purple-700">Access to reunions, networking events, and social gatherings throughout the year</p>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:border-amber-400 transition">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-purple-900 mb-2">Network</h3>
            <p className="text-purple-700">Connect with brothers across generations and industries for career opportunities</p>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:border-amber-400 transition">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-purple-900 mb-2">Easy Dues Payment</h3>
            <p className="text-purple-700">Convenient online payment system with secure transaction processing</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Benefits;
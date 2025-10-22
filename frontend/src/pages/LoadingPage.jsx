import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-100">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
        <h2 className="text-purple-900 font-bold text-2xl">Loading...</h2>
        <p className="text-purple-700 mt-2 text-center">Please wait while we load your data.</p>
      </div>
    </div>
  );
}

export default LoadingPage;
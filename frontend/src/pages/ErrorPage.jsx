import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ErrorPage({ message }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 px-4">
      <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-100 text-center max-w-md">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-purple-900 font-bold text-2xl mb-2">Oops!</h2>
        <p className="text-purple-700 mb-6">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;
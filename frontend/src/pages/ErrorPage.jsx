import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ErrorPage({ message }) {
  const navigate = useNavigate();

  return (
    <div className="page-shell flex items-center justify-center px-4">
      <div className="panel-strong flex flex-col items-center p-8 text-center max-w-md">
        <AlertCircle className="text-red-300 mb-4" size={48} />
        <h2 className="text-zinc-950 font-bold text-2xl mb-2">Oops!</h2>
        <p className="text-zinc-600 mb-6">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary py-2 px-6"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;

import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingPage() {
  return (
    <div className="page-shell flex items-center justify-center px-4">
      <div className="panel-strong flex flex-col items-center p-8 text-center">
        <Loader2 className="animate-spin text-zinc-950 mb-4" size={48} />
        <h2 className="text-zinc-950 font-bold text-2xl">Loading...</h2>
        <p className="text-zinc-600 mt-2 text-center">Please wait while we load your data.</p>
      </div>
    </div>
  );
}

export default LoadingPage;

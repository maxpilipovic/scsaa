import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center">
              <span className="text-zinc-950 font-black text-sm tracking-tight">SP</span>
            </div>
            <div>
              <h3 className="text-zinc-950 font-bold">SCSAA</h3>
              <p className="text-zinc-600 text-sm">Sigma Pi Beta-Gamma</p>
            </div>
          </div>

          <p className="text-zinc-500 text-sm text-center md:text-right">
            2025 Sidwell, Crook, Stewart Alumni Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

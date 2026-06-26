import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full bg-white z-50 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center">
              <span className="text-zinc-950 font-black text-sm tracking-tight">SP</span>
            </div>
            <div>
              <h1 className="text-zinc-950 font-bold text-lg leading-tight">SCSAA</h1>
              <p className="text-zinc-600 text-xs">Sigma Pi Beta-Gamma</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="text-zinc-700 hover:text-zinc-950 transition font-medium px-4 py-2 border border-transparent hover:border-zinc-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary px-5 py-2"
            >
              Register
            </button>
          </div>

          <button
            className="md:hidden text-zinc-950 p-2 border border-zinc-200 hover:bg-zinc-100 hover:text-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="block w-full text-left text-zinc-700 hover:text-zinc-950 transition px-3 py-2 border border-transparent hover:border-zinc-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary w-full px-6 py-3"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

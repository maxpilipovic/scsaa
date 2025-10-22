import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-purple-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ΣΠ</span>
            </div>
            <div>
              <h1 className="text-purple-900 font-bold text-lg">SCSAA</h1>
              <p className="text-purple-600 text-xs">Beta-Gamma Chapter</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-purple-700 hover:text-purple-900 transition font-medium">Login</button>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-purple-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-purple-200">
          <div className="px-4 py-4 space-y-3">
            <button className="block w-full text-left text-purple-700 hover:text-purple-900 transition">Login</button>
            <button className="block w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
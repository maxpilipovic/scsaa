import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t-2 border-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ΣΠ</span>
            </div>
            <div>
              <h3 className="text-purple-900 font-bold">SCSAA</h3>
              <p className="text-purple-600 text-sm">Beta-Gamma Chapter</p>
            </div>
          </div>
          
          <p className="text-purple-700 text-sm text-center md:text-right">
            © 2025 Sidwell, Crook, Stewart Alumni Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
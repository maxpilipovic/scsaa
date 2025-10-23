import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const Header = ({ memberData }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {memberData.name.split(' ')[0]}!
          </h2>
          <p className="text-gray-600 mt-1">Pledge Class: {memberData.pledgeClass}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
            <Bell size={24} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {memberData.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
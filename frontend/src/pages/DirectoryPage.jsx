import React from 'react';
import SectionCard from '../components/SectionCard.jsx';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const DirectoryPage = () => {
  return (
    <SectionCard title="Member Directory">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search members..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <p className="text-gray-600 text-center py-8">Directory feature coming soon!</p>
    </SectionCard>
  );
};

export default DirectoryPage;
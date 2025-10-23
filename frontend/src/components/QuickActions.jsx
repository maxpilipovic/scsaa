import React from 'react';
import SectionCard from './SectionCard.jsx';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const QuickActions = () => {
  return (
    <SectionCard title="Quick Actions">
      <div className="space-y-3">
        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium">
          Update Profile
        </button>
        <button className="w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg hover:bg-indigo-50 transition font-medium">
          Download Receipt
        </button>
        <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
          Contact Board
        </button>
      </div>
    </SectionCard>
  );
};

export default QuickActions;
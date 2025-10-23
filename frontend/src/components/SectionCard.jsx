import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const SectionCard = ({ title, children, action }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
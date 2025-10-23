import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const StatusCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    green: 'border-green-500 bg-green-100 text-green-600',
    blue: 'border-blue-500 bg-blue-100 text-blue-600',
    purple: 'border-purple-500 bg-purple-100 text-purple-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color].split(' ')[0]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color === 'green' ? 'text-green-600' : 'text-gray-800'}`}>
            {value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color].split(' ')[1]}`}>
          <Icon className={colorClasses[color].split(' ')[2]} size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
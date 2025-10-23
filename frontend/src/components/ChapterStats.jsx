import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const ChapterStats = () => {
  const stats = [
    { label: "Total Alumni", value: "347" },
    { label: "Active Members", value: "289" },
    { label: "Dues Paid (2025)", value: "83%" },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Chapter Stats</h3>
      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-indigo-100">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterStats;
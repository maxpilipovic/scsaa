import React from "react";
import SectionCard from './SectionCard.jsx';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const ResourcesPage = () => {
  const resources = ['Chapter Bylaws', 'Meeting Minutes'];

  return (
    <SectionCard title="Resources & Documents">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" size={24} />
              <span className="font-medium text-gray-800">{resource}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default ResourcesPage;
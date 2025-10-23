import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="border-l-4 border-indigo-500 pl-4 py-2">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
        <span className="text-xs text-gray-500">{announcement.date}</span>
      </div>
      <p className="text-sm text-gray-600">{announcement.preview}</p>
      <button className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 font-medium">
        Read more →
      </button>
    </div>
  );
};

export default AnnouncementCard;
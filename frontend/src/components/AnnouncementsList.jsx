import React from 'react';
import AnnouncementCard from './AnnouncementCard.jsx';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const AnnouncementsList = ({ announcements }) => {
  return (
    <div className="space-y-4">
      {announcements.map((announcement, idx) => (
        <AnnouncementCard key={idx} announcement={announcement} />
      ))}
    </div>
  );
};

export default AnnouncementsList;
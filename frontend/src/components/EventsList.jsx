import React from 'react';
import EventCard from './EventCard';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const EventsList = ({ events, compact = false }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">No current events</p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {events.map((event, idx) => (
        <EventCard key={idx} event={event} compact={compact} />
      ))}
    </div>
  );
};

export default EventsList;
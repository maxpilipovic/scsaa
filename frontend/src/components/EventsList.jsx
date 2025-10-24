import React from 'react';
import EventCard from './EventCard';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const EventsList = ({ events, compact = false }) => {
  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {events.map((event, idx) => (
        <EventCard key={idx} event={event} compact={compact} />
      ))}
    </div>
  );
};

export default EventsList;
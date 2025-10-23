import React from 'react';
import SectionCard from '../components/SectionCard.jsx';
import EventsList from '../components/EventsList.jsx';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const EventsPage = ({ upcomingEvents }) => {
  return (
    <SectionCard title="Events Calendar">
      <EventsList events={upcomingEvents} />
    </SectionCard>
  );
};

export default EventsPage;
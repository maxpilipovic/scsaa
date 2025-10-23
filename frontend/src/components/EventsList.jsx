import React from 'react';
import EventCard from './EventCard.jsx';

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
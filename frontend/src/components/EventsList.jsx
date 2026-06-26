import React from 'react';
import EventCard from './EventCard';
import { Calendar } from 'lucide-react';

const EventsList = ({ events, compact = false, onRsvp, updatingEventId }) => {
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
        <EventCard
          key={event.event_id || idx}
          event={event}
          compact={compact}
          onRsvp={onRsvp}
          isUpdating={updatingEventId === event.event_id}
        />
      ))}
    </div>
  );
};

export default EventsList;

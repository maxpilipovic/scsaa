import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const EventCard = ({ event, compact = false }) => {
  const date = new Date(event.start_time);
  const day = date.toLocaleString('en-US', { day: 'numeric' });
  const month = date.toLocaleString('en-US', { month: 'short' });
  const fullDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (compact) {
    return (
      <div className="pb-4 border-b border-zinc-200 last:border-b-0">
        <div className="flex items-start gap-3">
          <div className="bg-white text-black p-2 text-center min-w-[50px]">
            <p className="text-xs font-bold uppercase">{month}</p>
            <p className="text-lg font-black leading-none">{day}</p>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-zinc-950 text-sm">{event.name}</h4>
            <p className="text-xs text-zinc-600 mt-1">{event.location}</p>
            <button className="text-xs text-zinc-800 hover:text-zinc-950 mt-2 font-medium">
              RSVP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 p-5 bg-zinc-50 hover:bg-zinc-100 transition">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h4 className="font-bold text-zinc-950">{event.name}</h4>
          <p className="text-sm text-zinc-600 mt-3 flex items-center gap-2">
            <MapPin size={16} className="text-zinc-500" />
            {event.location}
          </p>
          <p className="text-sm text-zinc-600 mt-2 flex items-center gap-2">
            <Calendar size={16} className="text-zinc-500" />
            {fullDate}
          </p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm">
          RSVP
        </button>
      </div>
    </div>
  );
};

export default EventCard;

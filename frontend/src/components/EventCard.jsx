import React from 'react';

const EventCard = ({ event, compact = false, onRsvp, isUpdating = false }) => {
  const date = new Date(event.start_time);
  const day = date.toLocaleString('en-US', { day: 'numeric' });
  const month = date.toLocaleString('en-US', { month: 'short' });
  const fullDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const myRsvp = event.my_rsvp?.replace('_', ' ');

  if (compact) {
    return (
      <div className="pb-4 border-b last:border-b-0">
        <div className="flex items-start gap-3">
          <div className="bg-indigo-100 rounded-lg p-2 text-center min-w-[50px]">
            <p className="text-xs text-indigo-600 font-semibold">{month}</p>
            <p className="text-lg font-bold text-indigo-800">{day}</p>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-sm">{event.name}</h4>
            <p className="text-xs text-gray-600 mt-1">{event.location}</p>
            <p className="text-xs text-gray-500 mt-2">
              {event.rsvp_counts?.going || 0} going
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-semibold text-gray-800">{event.name}</h4>
          <p className="text-sm text-gray-600 mt-1">Location: {event.location}</p>
          <p className="text-sm text-gray-600 mt-1">Date: {fullDate}</p>
          <p className="text-sm text-gray-500 mt-2">
            {event.rsvp_counts?.going || 0} going
            {event.rsvp_counts?.maybe ? `, ${event.rsvp_counts.maybe} maybe` : ''}
            {myRsvp ? ` · Your RSVP: ${myRsvp}` : ''}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['going', 'Going'],
            ['maybe', 'Maybe'],
            ['not_going', 'No'],
          ].map(([status, label]) => (
            <button
              key={status}
              type="button"
              onClick={() => onRsvp?.(event.event_id, status)}
              disabled={isUpdating}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                event.my_rsvp === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventCard;

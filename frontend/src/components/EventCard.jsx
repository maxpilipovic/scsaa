import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const EventCard = ({ event, compact = false }) => {
  if (compact) {
    return (
      <div className="pb-4 border-b last:border-b-0">
        <div className="flex items-start gap-3">
          <div className="bg-indigo-100 rounded-lg p-2 text-center min-w-[50px]">
            <p className="text-xs text-indigo-600 font-semibold">
              {event.date.split(' ')[0]}
            </p>
            <p className="text-lg font-bold text-indigo-800">
              {event.date.split(' ')[1].replace(',', '')}
            </p>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-sm">{event.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{event.location}</p>
            <button className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium">
              RSVP →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{event.title}</h4>
          <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
          <p className="text-sm text-gray-600 mt-1">📅 {event.date}</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          RSVP
        </button>
      </div>
    </div>
  );
};

export default EventCard;
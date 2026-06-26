import React from 'react';

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex justify-between items-start gap-4 mb-1">
        <h4 className="font-semibold text-zinc-950">{announcement.title}</h4>
        <span className="text-xs text-zinc-500 whitespace-nowrap">{announcement.date}</span>
      </div>
      <p className="text-sm text-zinc-600">{announcement.preview}</p>
      <button className="text-sm text-zinc-800 hover:text-zinc-950 mt-2 font-medium">
        Read more
      </button>
    </div>
  );
};

export default AnnouncementCard;

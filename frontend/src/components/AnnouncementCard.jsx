import React from 'react';

const AnnouncementCard = ({ announcement, onReadMore }) => {
  const createdAt = announcement.created_at
    ? new Date(announcement.created_at).toLocaleDateString()
    : announcement.date;

  return (
    <div className="border-l-4 border-indigo-500 pl-4 py-2">
      <div className="flex justify-between items-start mb-1 gap-3">
        <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
        <span className="shrink-0 text-xs text-gray-500">{createdAt}</span>
      </div>
      <p className="text-sm text-gray-600">{announcement.preview}</p>
      <button
        type="button"
        onClick={() => onReadMore?.(announcement)}
        className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
      >
        Read more
      </button>
    </div>
  );
};

export default AnnouncementCard;

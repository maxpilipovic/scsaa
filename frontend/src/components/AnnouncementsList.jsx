import React from 'react';
import AnnouncementCard from './AnnouncementCard.jsx';

const AnnouncementsList = ({ announcements, onReadMore }) => {
  return (
    <div className="space-y-4">
      {announcements.map((announcement, idx) => (
        <AnnouncementCard
          key={announcement.announcements_id || idx}
          announcement={announcement}
          onReadMore={onReadMore}
        />
      ))}
    </div>
  );
};

export default AnnouncementsList;

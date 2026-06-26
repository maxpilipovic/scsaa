import React, { useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import EventsList from '../components/EventsList.jsx';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

const EventsPage = ({ upcomingEvents, onEventRsvpUpdated }) => {
  const [updatingEventId, setUpdatingEventId] = useState(null);

  const handleRsvp = async (eventId, status) => {
    try {
      setUpdatingEventId(eventId);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Your session expired. Please sign in again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/activity/events/${eventId}/rsvp`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update RSVP.');
      }

      onEventRsvpUpdated?.(eventId, data);
      toast.success('RSVP updated.');
    } catch (error) {
      console.error('RSVP update error:', error);
      toast.error(error.message || 'Could not update RSVP.');
    } finally {
      setUpdatingEventId(null);
    }
  };

  return (
    <SectionCard title="Events Calendar">
      <EventsList
        events={upcomingEvents}
        onRsvp={handleRsvp}
        updatingEventId={updatingEventId}
      />
    </SectionCard>
  );
};

export default EventsPage;

import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import EventFormModal from '../components/EventFormModal';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';

//TODO
//1. We need a back button.

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
    if (user && isAdmin) {
      fetchEvents();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error('Not authenticated');
      const token = session.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch events.');
      
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event = null) => {
    setCurrentEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEvent(null);
  };

  const handleSaveEvent = async (formData) => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error('Not authenticated');
      const token = session.access_token;

      const isUpdating = !!currentEvent;
      const url = isUpdating
        ? `${import.meta.env.VITE_API_URL}/api/v1/admin/events/${currentEvent.event_id}`
        : `${import.meta.env.VITE_API_URL}/api/v1/admin/events`;
      
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save event.');
      }
      
      toast.success(`Event ${isUpdating ? 'updated' : 'created'} successfully!`);
      handleCloseModal();
      fetchEvents(); // Refresh the list
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) throw new Error('Not authenticated');
        const token = session.access_token;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/events/${eventId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete event.');
        }

        toast.success('Event deleted successfully!');
        fetchEvents(); // Refresh the list
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (loading || adminLoading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;
  if (!isAdmin) return <ErrorPage message="Admin Access" />;

  return (
    <>
      <SectionCard title="Events Management">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">Create, edit, and delete platform events.</p>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            Create New Event
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : (
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map(event => (
                <div key={event.event_id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{event.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start_time).toLocaleString()} | {event.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenModal(event)} className="text-gray-500 hover:text-indigo-600">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDeleteEvent(event.event_id)} className="text-gray-500 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No events found. Click "Create New Event" to add one.</p>
            )}
          </div>
        )}
      </SectionCard>

      <EventFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        event={currentEvent}
      />
    </>
  );
};

export default AdminEventsPage;
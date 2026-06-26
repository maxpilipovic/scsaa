import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import AnnouncementFormModal from '../components/AnnouncementFormModal';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
    if (user && isAdmin) {
      fetchAnnouncements();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error('Not authenticated');
      const token = session.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch announcements.');
      
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (announcement = null) => {
    setCurrentAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAnnouncement(null);
  };

  const handleSaveAnnouncement = async (formData) => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error('Not authenticated');
      const token = session.access_token;

      const isUpdating = !!currentAnnouncement;
      const url = isUpdating
        ? `${import.meta.env.VITE_API_URL}/api/v1/admin/announcements/${currentAnnouncement.announcements_id}`
        : `${import.meta.env.VITE_API_URL}/api/v1/admin/announcements`;
      
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
        throw new Error(errorData.message || 'Failed to save announcement.');
      }
      
      toast.success(`Announcement ${isUpdating ? 'updated' : 'created'} successfully!`);
      handleCloseModal();
      fetchAnnouncements(); // Refresh the list
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) throw new Error('Not authenticated');
        const token = session.access_token;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/announcements/${announcementId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete announcement.');
        }

        toast.success('Announcement deleted successfully!');
        fetchAnnouncements(); // Refresh the list
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (loading || adminLoading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;
  if (!isAdmin) return <ErrorPage message="Admin Access" />;

  return (
    <div className="page-shell p-4 sm:p-6 lg:p-8">
      <SectionCard title="Announcements Management">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <p className="text-zinc-600">Create, edit, and delete platform announcements.</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary px-4 py-2"
          >
            <Plus size={18} />
            Create New Announcement
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin text-zinc-950" size={32} />
          </div>
        ) : error ? (
          <p className="text-center text-red-300 py-8">{error}</p>
        ) : (
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map(announcement => (
                <div key={announcement.announcements_id} className="bg-zinc-50 p-4 border border-zinc-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-950">{announcement.title}</h3>
                    <p className="text-sm text-zinc-600">{announcement.preview}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenModal(announcement)} className="text-zinc-500 hover:text-zinc-950">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(announcement.announcements_id)} className="text-zinc-500 hover:text-red-300">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-8">No announcements found. Click "Create New Announcement" to add one.</p>
            )}
          </div>
        )}
      </SectionCard>

      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAnnouncement}
        announcement={currentAnnouncement}
      />
    </div>
  );
};

export default AdminAnnouncementsPage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AnnouncementFormModal = ({ isOpen, onClose, onSave, announcement }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    preview: '',
  });

  useEffect(() => {
    if (announcement) {
      // If editing, populate form with announcement data
      setFormData({
        title: announcement.title || '',
        preview: announcement.preview || '',
      });
    } else {
      // If creating, reset form
      setFormData({ title: '', preview: '' });
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const announcementData = {
      ...formData,
      user_id: user.id,
    };
    onSave(announcementData);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/20 z-50 flex justify-center items-center p-4">
      <div className="panel-strong p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-zinc-950 mb-6">{announcement ? 'Edit Announcement' : 'Create New Announcement'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-dark mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="preview" className="block text-sm font-medium text-zinc-700">Preview</label>
              <textarea
                id="preview"
                name="preview"
                value={formData.preview}
                onChange={handleInputChange}
                rows="4"
                className="input-dark mt-1"
              ></textarea>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2">
              Save Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;

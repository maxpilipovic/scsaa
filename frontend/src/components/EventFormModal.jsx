import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EventFormModal = ({ isOpen, onClose, onSave, event }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_date: '',
    location: '',
  });

  useEffect(() => {
    if (event) {
      // If editing, populate form with event data
      setFormData({
        name: event.name || '',
        description: event.description || '',
        start_time: event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '', // Format for datetime-local
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '', // Format for datetime-local
        location: event.location || '',
      });
    } else {
      // If creating, reset form
      setFormData({ name: '', description: '', start_time: '', end_date: '', location: '' });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      user_id: user.id,
    };
    onSave(eventData);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/20 z-50 flex justify-center items-center p-4">
      <div className="panel-strong p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-zinc-950 mb-6">{event ? 'Edit Event' : 'Create New Event'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-dark mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="input-dark mt-1"
              ></textarea>
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-zinc-700">Start Time</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="input-dark mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-zinc-700">End Date</label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="input-dark mt-1"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-zinc-700">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-dark mt-1"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;

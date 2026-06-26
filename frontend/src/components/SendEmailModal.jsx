import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SendEmailModal = ({ isOpen, onClose, userId = null, userName = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'

  // If a specific user is passed, add them to selected users
  React.useEffect(() => {
    if (userId) {
      setSelectedUsers(currentUsers => (
        currentUsers.find(u => u.id === userId)
          ? currentUsers
          : [{ id: userId, email: '', name: userName || 'Unknown' }]
      ));
    }
  }, [userId, userName]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/search-users?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setMessage({ type: 'error', text: 'Failed to search users' });
    }
  };

  const addUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([
        ...selectedUsers,
        {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      ]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      setMessage({ type: 'error', text: 'Subject and body are required' });
      return;
    }

    if (selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one user' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      let endpoint, requestBody;

      if (activeTab === 'single' && selectedUsers.length === 1) {
        // Send to single user
        endpoint = `${import.meta.env.VITE_API_URL}/api/v1/admin/send-email-to-user`;
        requestBody = {
          userId: selectedUsers[0].id,
          subject,
          body,
          adminUserId: (await supabase.auth.getUser()).data.user.id,
        };
      } else {
        // Send bulk email
        endpoint = `${import.meta.env.VITE_API_URL}/api/v1/admin/send-bulk-email`;
        requestBody = {
          userIds: selectedUsers.map(u => u.id),
          subject,
          body,
          adminUserId: (await supabase.auth.getUser()).data.user.id,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: result.message });

      // Reset form after success
      setTimeout(() => {
        setSubject('');
        setBody('');
        if (!userId) {
          setSelectedUsers([]);
        }
        if (!userId) {
          onClose();
        }
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to send email' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/20 flex items-center justify-center z-50 p-4">
      <div className="panel-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-zinc-950">Send Email</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-black p-2 hover:bg-zinc-100 transition"
            aria-label="Close email modal"
          >
            <X size={20} />
          </button>
        </div>

        {message && (
          <div className={`mx-6 mt-4 p-4 ${
            message.type === 'success'
              ? 'bg-green-400/10 text-green-200 border border-green-400/30'
              : 'bg-red-400/10 text-red-200 border border-red-400/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSendEmail} className="p-6 space-y-6">
          {!userId && (
            <div className="flex gap-2 border-b border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === 'single'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Single User
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bulk')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === 'bulk'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Multiple Users
              </button>
            </div>
          )}

          {!userId && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-700">
                Search & Select Users
              </label>
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={handleSearch}
                className="input-dark"
              />

              {searchResults.length > 0 && (
                <div className="border border-zinc-200 max-h-48 overflow-y-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-zinc-100 border-b border-zinc-200 last:border-b-0 cursor-pointer transition"
                      onClick={() => addUser(user)}
                    >
                      <div>
                        <p className="font-medium text-zinc-950">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1 text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-700">
                Selected Recipients ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-50 text-zinc-800 text-sm border border-zinc-200"
                  >
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      className="ml-1 hover:text-zinc-950"
                      aria-label={`Remove ${user.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email-subject" className="block text-sm font-semibold text-zinc-700">
              Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="input-dark"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email-body" className="block text-sm font-semibold text-zinc-700">
              Message
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body (HTML formatting supported)"
              className="input-dark resize-none"
              rows="10"
            />
            <p className="text-sm text-zinc-500">
              HTML formatting is supported in this message.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedUsers.length === 0 || !subject.trim() || !body.trim()}
              className="btn-primary px-6 py-2"
            >
              {isLoading ? 'Sending...' : `Send to ${selectedUsers.length} ${selectedUsers.length === 1 ? 'User' : 'Users'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailModal;

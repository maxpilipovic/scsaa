import React, { useState } from 'react';
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
    if (userId && !selectedUsers.find(u => u.id === userId)) {
      setSelectedUsers([{ id: userId, email: '', name: userName || 'Unknown' }]);
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
        endpoint = 'http://localhost:3001/api/v1/admin/send-email-to-user';
        requestBody = {
          userId: selectedUsers[0].id,
          subject,
          body,
          adminUserId: (await supabase.auth.getUser()).data.user.id,
        };
      } else {
        // Send bulk email
        endpoint = 'http://localhost:3001/api/v1/admin/send-bulk-email';
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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSendEmail} className="p-6 space-y-6">
          {/* Tab Navigation */}
          {!userId && (
            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === 'single'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Single User
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bulk')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === 'bulk'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Multiple Users
              </button>
            </div>
          )}

          {/* User Search */}
          {!userId && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Search & Select Users
              </label>
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition"
                      onClick={() => addUser(user)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button 
                        type="button" 
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Selected Recipients ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      className="ml-1 hover:text-blue-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Input */}
          <div className="space-y-2">
            <label htmlFor="email-subject" className="block text-sm font-semibold text-gray-700">
              Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Body Textarea */}
          <div className="space-y-2">
            <label htmlFor="email-body" className="block text-sm font-semibold text-gray-700">
              Message
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body (HTML formatting supported)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              rows="10"
            />
            <p className="text-sm text-gray-600">
              💡 You can use HTML formatting in your message
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedUsers.length === 0 || !subject.trim() || !body.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
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

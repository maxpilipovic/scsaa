import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import SectionCard from '../components/SectionCard';

function UserDetailsPage() {
  const { userId } = useParams();
  const { user: adminUser } = useAuth(); // The logged-in admin
  const [user, setUser] = useState(null); // The user being viewed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!adminUser) {
        setError('You must be logged in to view this page.');
        setLoading(false);
        return;
      }

      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          setError('No active session.');
          setLoading(false);
          return;
        }
        const token = session.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}`, { headers });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, adminUser]);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;
  if (!user) return <ErrorPage message="User not found." />;

  const userDetails = [
    { label: 'First Name', value: user.first_name },
    { label: 'Last Name', value: user.last_name },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone_number || 'N/A' },
    { label: 'Date of Birth', value: user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A' },
    { label: 'Pledge Class', value: user.pledge_class || 'N/A' },
    { label: 'Joined', value: new Date(user.created_at).toLocaleString() },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard', { state: { defaultTab: 'Admin' } })}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          &larr; Back to Admin Dashboard
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-2">{user.first_name} {user.last_name}</h1>
      <p className="text-gray-600 mb-8">User ID: {user.id}</p>

      <div className="space-y-8">
        <SectionCard title="User Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userDetails.map(detail => (
              <div key={detail.label}>
                <h3 className="font-medium text-gray-700">{detail.label}</h3>
                <p className="text-gray-600">{detail.value}</p>
              </div>
            ))}
          </div>
          {/* Edit form will go here in a future step */}
        </SectionCard>

        <SectionCard title="Membership & Payments">
          {/* Membership status and payment history will be added here */}
          <p className="text-gray-500">Membership status and payment history coming soon.</p>
        </SectionCard>
      </div>
    </div>
  );
}

export default UserDetailsPage;

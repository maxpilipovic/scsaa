import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import SectionCard from '../components/SectionCard';
import StatusCard from '../components/StatusCard';
import UserTable from '../components/UserTable'; //Import the new UserTable component
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    recentSignups: [],
    totalRevenue: 0,
    mrr: 0,
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      if (!user) {
        setLoading(false);
        setError('User not authenticated.');
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

        const [
          totalMembersRes,
          activeMembersRes,
          recentSignupsRes,
          totalRevenueRes,
          mrrRes,
          usersRes, //Add users fetch
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getTotalMembers`), //This is public now, but keeping headers for consistency
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getActiveMembers`), //This is public now
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/recentSignups`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/totalRevenue`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/mrr`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users`, { headers }), //Fetch all users
        ]);

        const [
          totalMembersData,
          activeMembersData,
          recentSignupsData,
          totalRevenueData,
          mrrData,
          usersData, // Add users data
        ] = await Promise.all([
          totalMembersRes.json(),
          activeMembersRes.json(),
          recentSignupsRes.json(),
          totalRevenueRes.json(),
          mrrRes.json(),
          usersRes.json(), // Parse users JSON
        ]);

        setDashboardData({
          totalMembers: totalMembersData.totalMembers,
          activeMembers: activeMembersData.activeMembers,
          recentSignups: recentSignupsData,
          totalRevenue: totalRevenueData.totalRevenue,
          mrr: mrrData.mrr,
        });
        setUsers(usersData); // Set users state
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, [user]);

  const filteredUsers = users.filter(u => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = u.email?.toLowerCase() || '';
    const pledgeClass = String(u.pledge_class || '').toLowerCase(); // Convert to string before calling toLowerCase
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return fullName.includes(lowerCaseSearchTerm) || email.includes(lowerCaseSearchTerm) || pledgeClass.includes(lowerCaseSearchTerm);
  });

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatusCard title="Total Members" value={dashboardData.totalMembers} color="green" />
        <StatusCard title="Total Revenue" value={`${dashboardData.totalRevenue.toFixed(2)}`} color="green" />
        <StatusCard title="Yearly Recurring Revenue" value={`${dashboardData.mrr.toFixed(2)}`} color="green" />
      </div>
      
      <div className="space-y-8">

        <SectionCard title="Announcements & Events">
          <p className="text-gray-500">Create, edit and delete announcements and events directly from the admin dashboard.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => navigate('/dashboard/announcements')}>Manage Announcements</button>
          <button className="mt-4 ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => navigate('/dashboard/events')}>Manage Events</button>
        </SectionCard>

        <SectionCard title="User Management">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, email, or pledge class..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <UserTable users={filteredUsers} />
        </SectionCard>

        <SectionCard title="Recent Sign-ups">
          {dashboardData.recentSignups.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {dashboardData.recentSignups.map((signup) => (
                <li key={signup.id} className="py-3 flex justify-between items-center">
                  <span>{signup.first_name} {signup.last_name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(signup.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent sign-ups.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default AdminPage;


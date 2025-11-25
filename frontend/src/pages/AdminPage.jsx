import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import SectionCard from '../components/SectionCard';
import StatusCard from '../components/StatusCard';
import { supabase } from '../lib/supabaseClient'; //Import supabase for session

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
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getTotalMembers`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getActiveMembers`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/recentSignups`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/totalRevenue`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/mrr`, { headers }),
        ]);

        const [
          totalMembersData,
          activeMembersData,
          recentSignupsData,
          totalRevenueData,
          mrrData,
        ] = await Promise.all([
          totalMembersRes.json(),
          activeMembersRes.json(),
          recentSignupsRes.json(),
          totalRevenueRes.json(),
          mrrRes.json(),
        ]);

        setDashboardData({
          totalMembers: totalMembersData.totalMembers,
          activeMembers: activeMembersData.activeMembers,
          recentSignups: recentSignupsData,
          totalRevenue: totalRevenueData.totalRevenue,
          mrr: mrrData.mrr,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, [user]);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;

  //Add a check for isAdmin here if this page should only be accessible by admins
  

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatusCard title="Total Members" value={dashboardData.totalMembers} />
        <StatusCard title="Active Members" value={`$${dashboardData.totalRevenue.toFixed(2)}`} />
        <StatusCard title="Monthly Recurring Revenue" value={`$${dashboardData.mrr.toFixed(2)}`} />
      </div>

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
  );
}

export default AdminPage;

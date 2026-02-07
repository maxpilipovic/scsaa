import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import SectionCard from '../components/SectionCard';
import StatusCard from '../components/StatusCard';
import UserTable from '../components/UserTable'; //Import the new UserTable component
import SendEmailModal from '../components/SendEmailModal';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, TrendingUp, Bell, Calendar, Mail, Search } from 'lucide-react';

function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
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
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }

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

    if (isAdmin) {
      fetchAdminDashboardData();
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const filteredUsers = users.filter(u => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = u.email?.toLowerCase() || '';
    const pledgeClass = String(u.pledge_class || '').toLowerCase(); // Convert to string before calling toLowerCase
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return fullName.includes(lowerCaseSearchTerm) || email.includes(lowerCaseSearchTerm) || pledgeClass.includes(lowerCaseSearchTerm);
  });

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;
  if (!isAdmin) return <ErrorPage message="Admin Access" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Back Button and Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your organization and members</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Members</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.totalMembers}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${dashboardData.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Yearly Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${dashboardData.mrr.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Management Actions Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Content Management</h2>
          </div>
          <p className="text-gray-600 mb-6">Create, edit and delete announcements and events directly from the admin dashboard.</p>
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5" 
              onClick={() => navigate('/dashboard/admin/announcements')}
            >
              <Bell className="w-4 h-4" />
              Manage Announcements
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5" 
              onClick={() => navigate('/dashboard/admin/events')}
            >
              <Calendar className="w-4 h-4" />
              Manage Events
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5" 
              onClick={() => setEmailModalOpen(true)}
            >
              <Mail className="w-4 h-4" />
              Email System
            </button>
          </div>
        </div>

        {/* User Management Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          </div>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or pledge class..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <UserTable users={filteredUsers} />
        </div>

        {/* Recent Sign-ups Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Sign-ups</h2>
          {dashboardData.recentSignups.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {dashboardData.recentSignups.map((signup) => (
                <li key={signup.id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded transition-colors">
                  <span className="font-medium text-gray-700">{signup.first_name} {signup.last_name}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date(signup.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent sign-ups.</p>
          )}
        </div>
      </div>

      <SendEmailModal 
        isOpen={emailModalOpen} 
        onClose={() => setEmailModalOpen(false)} 
      />
    </div>
  );
}

export default AdminPage;


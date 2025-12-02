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

  const [userPaymentInfo, setUserPaymentInfo] = useState(null);
  const [userMembershipStatus, setUserMembershipStatus] = useState(null);

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

        //Fetch user details (has to exist)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}`, { headers });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        setUser(userData);

        //Fetch user payments (DONT THROW ERROR IF NONE)
        const paymentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}/payments`, { headers });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setUserPaymentInfo(paymentsData); // array expected
        } else {
          setUserPaymentInfo([]); // user has no payments
        }

        //Fetch membership status (DONT THROW ERROR IF NONE)
        const membershipStatusResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}/membership-status`, { headers });

        if (membershipStatusResponse.ok) {
          const membershipData = await membershipStatusResponse.json();
          setUserMembershipStatus(membershipData);
        } else {
          setUserMembershipStatus(null); // no membership
        }

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

  console.log('User Payment Info:', userPaymentInfo);

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
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-2">Membership Status</h3>
            {userMembershipStatus ? (
              <div>
                <p className="text-gray-600">Status: {(userMembershipStatus.status).toUpperCase()}</p>
                <p className="text-gray-600">Paid: {new Date(userMembershipStatus.paid_at).toLocaleDateString()}</p>
                <p className="text-gray-600">Expires: {new Date(userMembershipStatus.expires_at).toLocaleDateString()}</p>
                <p className="text-gray-600">Stripe Customer ID: {userMembershipStatus.stripe_customer_id}</p>

              </div>
            ) : (
              <p className="text-gray-600">No membership status found.</p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-gray-700 mb-2">Payment History</h3>
              {userPaymentInfo && userPaymentInfo.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-300 rounded-xl shadow-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Payment ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Dues Amount</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Stripe Payment ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPaymentInfo.map((payment) => (
                        <tr key={payment.payment_id} className="odd:bg-white even:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{payment.payment_id}</td>
                          <td className="border border-gray-300 px-4 py-2">${payment.dues_amount}</td>
                          <td className="border border-gray-300 px-4 py-2">{payment.stripe_payment_id}</td>
                          <td className="border border-gray-300 px-4 py-2 capitalize">
                            {payment.status}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(payment.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No payment history found.</p>
              )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default UserDetailsPage;

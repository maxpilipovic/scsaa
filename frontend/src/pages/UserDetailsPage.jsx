import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import SectionCard from '../components/SectionCard';
import { toast } from 'react-toastify';

function UserDetailsPage() {
  const { userId } = useParams();
  const { user: adminUser } = useAuth(); //The logged-in admin
  const [user, setUser] = useState(null); //The user being viewed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPaymentInfo, setUserPaymentInfo] = useState(null);
  const [userMembershipStatus, setUserMembershipStatus] = useState(null);

  //State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!adminUser) {
        setError('You must be logged in to view this page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        setFormData(userData); // Initialize form data

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        toast.error('Authentication session expired. Please log in again.');
        setIsSaving(false);
        return;
      }
      const token = session.access_token;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user.');
      }

      const result = await response.json();
      setUser(result.user); //Update user state with the returned updated user
      setIsEditing(false);
      toast.success('User updated successfully!');

    } catch (err) {
      console.error('Error saving user details:', err);
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user); // Revert changes
    setIsEditing(false);
  };

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage message={error} />;
  if (!user) return <ErrorPage message="User not found." />;

  // Define the fields that will be editable
  const editableDetails = [
    { label: 'First Name', name: 'first_name', type: 'text' },
    { label: 'Last Name', name: 'last_name', type: 'text' },
    { label: 'Email', name: 'email', type: 'text' },
    { label: 'Phone', name: 'phone_number', type: 'text' },
    { label: 'Date of Birth', name: 'date_of_birth', type: 'date' },
    { label: 'Address', name: 'address', type: 'text' },
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
      <h1 className="text-3xl font-bold mb-2">{formData.first_name} {formData.last_name}</h1>
      <p className="text-gray-600 mb-8">User ID: {user.id}</p>

      <div className="space-y-8">
        <SectionCard title="User Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableDetails.map(detail => (
              <div key={detail.name}>
                <h3 className="font-medium text-gray-700">{detail.label}</h3>
                {isEditing ? (
                  <input
                    type={detail.type}
                    name={detail.name}
                    value={formData[detail.name] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  />
                ) : (
                  <p className="text-gray-600">{user[detail.name] || 'N/A'}</p>
                )}
              </div>
            ))}
             {/* Non-editable details */}
             <div>
                <h3 className="font-medium text-gray-700">Joined</h3>
                <p className="text-gray-600">{new Date(user.created_at).toLocaleString()}</p>
              </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            {isEditing ? (
              <>
                <button onClick={handleCancel} disabled={isSaving} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Edit</button>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Membership & Payments">
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
                          <td className="border border-gray-300 px-4 py_2">{payment.stripe_payment_id}</td>
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

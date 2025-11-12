import React, { useState } from 'react';

const ManageSubscriptionButton = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleManageSubscription = async () => {
    if (!userId) {
      setError('User not found. Please log in again.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create portal session.');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('Could not get portal URL.');
      }

      // Redirect the user to the Stripe Customer Portal
      window.location.href = url;

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className="px-4 py-2 font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
      >
        {loading ? 'Loading...' : 'Manage Billing & Subscription'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ManageSubscriptionButton;

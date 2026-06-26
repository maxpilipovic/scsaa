import React, { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

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
        className="btn-primary px-6 py-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading Portal...
          </>
        ) : (
          <>
            <ExternalLink className="w-5 h-5" />
            Open Billing Portal
          </>
        )}
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-400/10 border border-red-400/30 text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ManageSubscriptionButton;

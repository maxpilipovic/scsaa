import React, { useState } from 'react';

// The Price IDs from your Stripe products
const recurringPriceId = 'price_1SNgo1Ag7ZN6KXnzDFTtY6fc';
const oneTimePriceId = 'price_1SNgpaAg7ZN6KXnztU1ZKd6T';

const PaymentOptions = ({ userId }) => {
  const [loading, setLoading] = useState(null); // To track which button is loading
  const [error, setError] = useState(null);

  const handleCheckout = async (priceId) => {
    if (!userId) {
      setError('Could not initiate payment: User not found.');
      return;
    }
    setError(null);
    setLoading(priceId);

    try {
      // 1. Call your backend to create the checkout session
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, userId }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create checkout session.');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('Could not get checkout URL.');
      }

      // 2. Redirect the user to the Stripe-hosted checkout page.
      window.location.href = url;

    } catch (err) {
      setError(err.message);
      setLoading(null); // Stop loading on error
    }
    // No finally block needed as we only stop loading on error. On success, the page navigates away.
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Choose Your Payment</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="space-y-4">
        <button
          onClick={() => handleCheckout(recurringPriceId)}
          disabled={loading === recurringPriceId}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition duration-300 ease-in-out"
        >
          {loading === recurringPriceId ? 'Processing...' : 'Pay Annual Dues ($50.00/year)'}
        </button>

        <button
          onClick={() => handleCheckout(oneTimePriceId)}
          disabled={loading === oneTimePriceId}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300 ease-in-out"
        >
          {loading === oneTimePriceId ? 'Processing...' : 'Make a One-Time $50.00 Payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentOptions;

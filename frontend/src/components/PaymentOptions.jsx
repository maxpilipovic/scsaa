import React, { useState } from "react";

// The Price IDs from your Stripe products
const recurringPriceId = "price_1SNgo1Ag7ZN6KXnzDFTtY6fc";
//const oneTimePriceId = "price_1SNgpaAg7ZN6KXnztU1ZKd6T";

const PaymentOptions = ({ userId }) => {
  const [loading, setLoading] = useState(null); // To track which button is loading
  const [error, setError] = useState(null);

  const handleCheckout = async (priceId) => {
    if (!userId) {
      setError("Could not initiate payment: User not found.");
      return;
    }
    setError(null);
    setLoading(priceId);

    try {
      // 1. Call your backend to create the checkout session
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priceId, userId }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          errorBody.error || "Failed to create checkout session."
        );
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error("Could not get checkout URL.");
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
    <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-10 max-w-md mx-auto border border-gray-200">
      <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">
        Membership Dues
      </h2>

      <p className="text-center text-gray-600 mb-8">
        Support the Sidwell, Crook & Stewart Alumni Association (Beta-Gamma
        Chapter)
      </p>

      {error && (
        <div
          className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-inner">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
          Annual Membership
        </h3>

        <p className="text-center text-gray-700 mb-6">
          <span className="text-4xl font-extrabold text-indigo-600">$50</span>
          <span className="text-gray-500 text-sm ml-1">/ year</span>
        </p>

        <button
          onClick={() => handleCheckout(recurringPriceId)}
          disabled={loading === recurringPriceId}
          className="
        w-full bg-indigo-600 text-white text-lg font-bold py-3 rounded-xl 
        hover:bg-indigo-700 shadow-md hover:shadow-lg 
        transition-all duration-200 ease-out 
        focus:outline-none focus:ring-4 focus:ring-indigo-300
        disabled:bg-gray-400 disabled:cursor-not-allowed
      "
        >
          {loading === recurringPriceId ? "Processing..." : "Pay Annual Dues"}
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Your support helps fund events, outreach, and alumni initiatives.
      </p>
    </div>
  );
};

export default PaymentOptions;

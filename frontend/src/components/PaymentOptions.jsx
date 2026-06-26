import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

// The Price IDs from your Stripe products
const recurringPriceId = import.meta.env.VITE_STRIPE_RECURRING_PRICE_ID;
//const oneTimePriceId = "price_1SNgpaAg7ZN6KXnztU1ZKd6T";

const PaymentOptions = ({ userId, membershipStatus }) => {
  const [loading, setLoading] = useState(null); //To track which button is loading
  const [error, setError] = useState(null);

  const handleCheckout = async (priceId) => {
    if (!userId) {
      setError("Could not initiate payment: User not found.");
      return;
    }
    setError(null);
    setLoading(priceId);

    try {
      //1. Call your backend to create the checkout session
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

      //2. Redirect the user to the Stripe-hosted checkout page.
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(null); // Stop loading on error
    }
    //No finally block needed as we only stop loading on error. On success, the page navigates away.
  };

  const status = membershipStatus?.status ?? "none";
  const isActive = status === "active";
  const isPendingCancellation = status === "pending_cancellation";
  const isMembershipValid = isActive || isPendingCancellation;

  console.log("Membership Status in PaymentOptions:", membershipStatus);
  return (
    <div>
      <p className="text-zinc-600 mb-6">
        Support the Sidwell, Crook & Stewart Alumni Association (Beta-Gamma Chapter)
      </p>

      {error && (
        <div
          className="bg-red-400/10 border border-red-400/30 text-red-200 px-4 py-3 mb-4 text-sm flex items-start gap-2"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MESSAGE BOX */}
      {isActive && (
        <div className="bg-green-400/10 border border-green-400/30 p-4 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-200">Membership Active</p>
              <p className="text-sm text-green-300/80 mt-1">
                Your membership is currently active. You will be notified before it expires.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPendingCancellation && (
        <div className="bg-zinc-50 border border-zinc-200 p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-zinc-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-800">Pending Cancellation</p>
              <p className="text-sm text-zinc-600 mt-1">
                Your membership is still active but will not auto-renew. You can resume auto-renew anytime in Settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT CARD (Only show if not active or pending-cancellation) */}
      {!isMembershipValid && (
        <div className="bg-zinc-50 border border-zinc-200 p-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-zinc-950">Annual Membership</h3>
            </div>

            <p className="text-center mb-6">
              <span className="text-5xl font-extrabold text-zinc-950">
                $100
              </span>
              <span className="text-zinc-500 text-sm ml-2">/ year</span>
            </p>

            <button
              onClick={() => handleCheckout(recurringPriceId)}
              disabled={loading === recurringPriceId}
              className="
                w-full bg-white text-black text-lg font-bold py-3 
                hover:bg-zinc-200 
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-white/40
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading === recurringPriceId ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin"></div>
                  Processing...
                </span>
              ) : (
                "Pay Annual Dues"
              )}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-zinc-500 text-sm mt-4">
        Your support helps fund events, outreach, and alumni initiatives.
      </p>
    </div>
  );
};

export default PaymentOptions;

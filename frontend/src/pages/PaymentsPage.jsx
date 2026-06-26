import React from 'react';
import { useState } from 'react';
import PaymentTable from '../components/PaymentTable';
import PaymentOptions from '../components/PaymentOptions';
import { CreditCard, Heart, History } from 'lucide-react';

const PaymentsPage = ({ paymentHistory, user, membershipData }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time'); // 'one-time' or 'monthly'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCustomDonation = async () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount < 1) {
      setError('Please enter a valid amount (minimum $1)');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/payments/create-donation-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: amount * 100, // Convert to cents
            userId: user?.id,
            type: donationType 
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create donation session.');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('Could not get checkout URL.');
      }

      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tight">Payments & Donations</h1>
            <p className="text-zinc-600 mt-1">Manage your membership and support the association</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Membership Payment Card */}
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xl font-bold text-zinc-950">Membership Dues</h2>
          </div>
          <PaymentOptions userId={user?.id} membershipStatus={membershipData} />
        </div>

        {/* Custom Donation Card */}
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xl font-bold text-zinc-950">Make a Donation</h2>
          </div>
          <p className="text-zinc-600 mb-6">Support the association with a custom donation amount</p>
          
          {error && (
            <div className="bg-red-400/10 border border-red-400/30 text-red-200 px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Donation Type Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDonationType('one-time')}
              className={`flex-1 py-2 px-4 font-medium transition-all ${
                donationType === 'one-time'
                  ? 'bg-white text-black'
                  : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setDonationType('monthly')}
              className={`flex-1 py-2 px-4 font-medium transition-all ${
                donationType === 'monthly'
                  ? 'bg-white text-black'
                  : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Donation Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 font-medium">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="input-dark pl-8 pr-4"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setCustomAmount(amount.toString())}
                className="py-2 px-3 bg-zinc-50 hover:bg-zinc-100 hover:text-black border border-zinc-200 font-medium text-zinc-800 transition-all"
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCustomDonation}
            disabled={loading || !customAmount}
            className={`w-full py-3 font-bold transition-all ${
              donationType === 'one-time'
                ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-100'
                : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-100'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {loading ? 'Processing...' : `Donate ${donationType === 'monthly' ? 'Monthly' : ''}`}
          </button>

          <p className="text-center text-zinc-500 text-sm mt-4">
            {donationType === 'monthly' 
              ? 'You can cancel your monthly donation anytime in Settings'
              : 'Thank you for your generous support!'}
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-zinc-500" />
          <h2 className="text-xl font-bold text-zinc-950">Payment History</h2>
        </div>
        <PaymentTable payments={paymentHistory} />
      </div>
    </div>
  );
};

export default PaymentsPage;

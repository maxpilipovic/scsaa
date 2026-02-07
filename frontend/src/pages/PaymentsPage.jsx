import React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentTable from '../components/PaymentTable';
import PaymentOptions from '../components/PaymentOptions';
import { CreditCard, Heart, History } from 'lucide-react';

const PaymentsPage = ({ paymentHistory, user, membershipData }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time'); // 'one-time' or 'monthly'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redirect to dashboard if payment was cancelled
  useEffect(() => {
    if (searchParams.get('payment_cancelled') === 'true') {
      navigate('/dashboard?payment_cancelled=true', { replace: true });
    }
  }, [searchParams, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Payments & Donations</h1>
            <p className="text-gray-600 mt-1">Manage your membership and support the association</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Membership Payment Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Membership Dues</h2>
          </div>
          <PaymentOptions userId={user?.id} membershipStatus={membershipData} />
        </div>

        {/* Custom Donation Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800">Make a Donation</h2>
          </div>
          <p className="text-gray-600 mb-6">Support the association with a custom donation amount</p>
          
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Donation Type Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDonationType('one-time')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                donationType === 'one-time'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setDonationType('monthly')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                donationType === 'monthly'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setCustomAmount(amount.toString())}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all"
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCustomDonation}
            disabled={loading || !customAmount}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${
              donationType === 'one-time'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {loading ? 'Processing...' : `Donate ${donationType === 'monthly' ? 'Monthly' : ''}`}
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            {donationType === 'monthly' 
              ? 'You can cancel your monthly donation anytime in Settings'
              : 'Thank you for your generous support!'}
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
        </div>
        <PaymentTable payments={paymentHistory} />
      </div>
    </div>
  );
};

export default PaymentsPage;

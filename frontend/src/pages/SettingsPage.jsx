import React from 'react';
import SectionCard from '../components/SectionCard';
import ManageSubscriptionButton from '../components/ManageSubscriptionButton';
import { CreditCard, Heart } from 'lucide-react';

const SettingsPage = ({ user, membershipData }) => {
  const hasActiveMembership = membershipData?.status === 'active' || membershipData?.status === 'pending_cancellation';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and subscriptions</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Email</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Name</h3>
              <p className="text-gray-600">{user?.user_metadata?.first_name} {user?.user_metadata?.last_name}</p>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Management</h2>
          
          <p className="mb-6 text-gray-600">
            Manage all your subscriptions including membership dues and recurring donations. You can update payment methods, cancel subscriptions, or view your billing history.
          </p>

          {hasActiveMembership && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800">Active Subscriptions</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You have active subscriptions. Click below to view and manage them in the billing portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ManageSubscriptionButton userId={user?.id} />

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> The billing portal allows you to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
              <li>View all active subscriptions (membership & donations)</li>
              <li>Update payment methods</li>
              <li>Cancel or resume subscriptions</li>
              <li>Download invoices and billing history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

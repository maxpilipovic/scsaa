import React from 'react';
import SectionCard from '../components/SectionCard';
import ManageSubscriptionButton from '../components/ManageSubscriptionButton';

const SettingsPage = ({ user }) => {
  return (
    <div className="space-y-8">
      <SectionCard title="Account Settings">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Email</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          {/* You can add more user profile details here */}
        </div>
      </SectionCard>

      <SectionCard title="Subscription Management">
        <p className="mb-4 text-gray-600">
          Click the button below to manage your subscription, update your payment method, or view your invoice history.
        </p>
        <ManageSubscriptionButton userId={user?.id} />
      </SectionCard>
    </div>
  );
};

export default SettingsPage;

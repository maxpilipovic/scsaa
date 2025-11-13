import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import SectionCard from '../components/SectionCard';
import PaymentTable from '../components/PaymentTable';
import PaymentOptions from '../components/PaymentOptions';
import { supabase } from '../lib/supabaseClient';

const PaymentsPage = ({ paymentHistory, user }) => {
  
  const [membershipStatus, setMembershipStatus] = useState(null);

  //Pull membership status API
  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) return;

        const token = session.access_token;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/dashboard/getMembershipStatus?userId=${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setMembershipStatus(data);

        console.log("Membership Status:", data);
      } catch (error) {
        console.error("Error fetching membership status:", error);
      }
    };

    if (user?.id) fetchMembershipStatus();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <SectionCard title="Make a Payment">
        <PaymentOptions userId={user?.id} membershipStatus={membershipStatus} />
      </SectionCard>

      <SectionCard title="Payment History">
        <PaymentTable payments={paymentHistory} />
      </SectionCard>
    </div>
  );
};

export default PaymentsPage;

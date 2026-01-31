import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import SectionCard from '../components/SectionCard';
import PaymentTable from '../components/PaymentTable';
import PaymentOptions from '../components/PaymentOptions';
import { supabase } from '../lib/supabaseClient';

const PaymentsPage = ({ paymentHistory, user, membershipData }) => {
  
  //MembershipData is now passed from parent, no need to fetch here!

  return (
    <div className="space-y-8">
      <SectionCard title="Make a Payment">
        <PaymentOptions userId={user?.id} membershipStatus={membershipData} />
      </SectionCard>

      <SectionCard title="Payment History">
        <PaymentTable payments={paymentHistory} />
      </SectionCard>
    </div>
  );
};

export default PaymentsPage;

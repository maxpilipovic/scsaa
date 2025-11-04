import React from 'react';
import SectionCard from '../components/SectionCard';
import PaymentTable from '../components/PaymentTable';
import PaymentOptions from '../components/PaymentOptions';

const PaymentsPage = ({ paymentHistory }) => {
  
  return (
    <div className="space-y-8">
      <SectionCard title="Make a Payment">
        <PaymentOptions />
      </SectionCard>

      <SectionCard title="Payment History">
        <PaymentTable payments={paymentHistory} showReceipt={true} />
      </SectionCard>
    </div>
  );
};

export default PaymentsPage;

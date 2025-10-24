import React from 'react';
import SectionCard from '../components/SectionCard';
import PaymentTable from '../components/PaymentTable';

const PaymentsPage = ({ paymentHistory }) => {
  
  return (
    <SectionCard title="Payment History">
      <PaymentTable payments={paymentHistory} showReceipt={true} />
    </SectionCard>
  );
};

export default PaymentsPage;
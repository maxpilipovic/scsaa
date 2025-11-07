import React from 'react';

const PaymentTable = ({ payments }) => {

  console.log(payments);

  return (

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-600 border-b">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Payment ID</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        
        <tbody>
          {payments.map((payment, idx) => {
            const date = payment.created_at
              ? new Date(payment.created_at).toLocaleDateString()
              : 'N/A';

            return (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-4 text-sm text-gray-800">{date}</td>
                <td className="py-4 text-sm font-semibold text-gray-800">
                  ${payment.dues_amount}
                </td>
                <td className="py-4 text-sm text-gray-600">
                  {payment.stripe_payment_id}
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'succeeded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
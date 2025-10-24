import React from 'react';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';

const PaymentTable = ({ payments, showReceipt = false }) => {

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
            {showReceipt && <th className="pb-3 font-medium">Receipt</th>}
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
                      payment.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                {showReceipt && (
                  <td className="py-4">
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <Download size={18} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
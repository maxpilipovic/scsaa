import React from 'react';

const PaymentTable = ({ payments }) => {
  console.log(payments);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.16em] text-zinc-500 border-b border-zinc-200">
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
              <tr key={idx} className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-100 transition">
                <td className="py-4 text-sm text-zinc-800">{date}</td>
                <td className="py-4 text-sm font-semibold text-zinc-950">
                  ${payment.dues_amount}
                </td>
                <td className="py-4 text-sm text-zinc-600">
                  {payment.stripe_payment_id}
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold border ${
                      payment.status === 'succeeded'
                        ? 'bg-green-400/10 text-green-300 border-green-400/20'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200'
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

import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const SuccessMessage = ({ message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';

  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
  const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 rounded-md relative mb-6 shadow-sm`}>
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-3" />
        <span className="block sm:inline font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3 text-lg"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SuccessMessage;

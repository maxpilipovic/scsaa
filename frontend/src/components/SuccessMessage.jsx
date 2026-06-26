import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const SuccessMessage = ({ message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';

  const bgColor = isSuccess ? 'bg-green-400/10' : 'bg-red-400/10';
  const borderColor = isSuccess ? 'border-green-400/30' : 'border-red-400/30';
  const textColor = isSuccess ? 'text-green-200' : 'text-red-200';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 relative mb-6`}>
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

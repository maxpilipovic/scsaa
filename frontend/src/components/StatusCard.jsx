import React from 'react';

const StatusCard = ({ title, value, subtitle, color = 'green' }) => {
  const colorClasses = {
    green: 'border-t-green-400',
    blue: 'border-t-sky-400',
    purple: 'border-t-white',
    red: 'border-t-red-400',
    gray: 'border-t-zinc-500',
    orange: 'border-t-zinc-300',
  };

  const accentClass = colorClasses[color] || colorClasses.green;

  return (
    <div className={`panel p-6 border-t-2 ${accentClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-black mt-2 text-zinc-950">{value}</p>
          <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;

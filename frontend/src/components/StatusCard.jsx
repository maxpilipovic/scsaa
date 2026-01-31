import React from 'react';

const StatusCard = ({ title, value, subtitle, color = 'green' }) => {
  const colorClasses = {
    green: 'border-green-500 bg-green-100 text-green-600',
    blue: 'border-blue-500 bg-blue-100 text-blue-600',
    purple: 'border-purple-500 bg-purple-100 text-purple-600',
    red: 'border-red-500 bg-red-100 text-red-600',
    gray: 'border-gray-500 bg-gray-100 text-gray-600',
    orange: 'border-orange-500 bg-orange-100 text-orange-600',
  };

  const selectedColor = colorClasses[color] || colorClasses['green'];
  const borderClass = selectedColor.split(' ')[0];

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${borderClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
            {value}
          </p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
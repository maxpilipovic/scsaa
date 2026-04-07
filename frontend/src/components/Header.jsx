import React from 'react';

const Header = ({ membershipData, onOpenSettings }) => {

  //console.log(membershipData);

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {`${membershipData.first_name} ${membershipData.last_name}`}!
          </h2>
          <p className="text-gray-600 mt-1">Pledge Class: {membershipData.pledge_class}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold transition hover:bg-indigo-700 hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 focus:outline-none"
            aria-label="Open settings"
          >
            {membershipData.first_name.split(' ').map(n => n[0]).join('')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

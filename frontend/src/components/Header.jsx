import React from 'react';

const Header = ({ membershipData, onOpenSettings }) => {

  //console.log(membershipData);

  return (
    <div className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-5 sticky top-0 z-20">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
            Welcome back, {`${membershipData.first_name} ${membershipData.last_name}`}!
          </h2>
          <p className="text-zinc-600 mt-1">Pledge Class: {membershipData.pledge_class}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 bg-white flex items-center justify-center text-black font-bold transition hover:bg-zinc-200 focus:outline-none"
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

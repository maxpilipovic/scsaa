import React from 'react';

const SectionCard = ({ title, children, action }) => {
  return (
    <div className="panel overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-white">
        <h3 className="text-lg font-bold text-zinc-950">{title}</h3>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;

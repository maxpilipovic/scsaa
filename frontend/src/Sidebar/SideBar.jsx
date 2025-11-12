import React from 'react';
import { Home, CreditCard, FileText, Calendar, Settings, LogOut } from 'lucide-react';

const SideBar = ({ activeTab, setActiveTab }) => {
    
  const NavButton = ({ icon: Icon, label, tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition ${
        activeTab === tabName ? 'bg-indigo-800' : 'hover:bg-indigo-800'
      }`}
    >
      <Icon size={20} className="mr-3" />
      {label}
    </button>
  );

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">SCSAA</h1>
        <p className="text-sm text-indigo-200 mt-1">Sigma Pi Beta-Gamma</p>
      </div>
      
      <nav className="flex-1 px-4">
        <NavButton icon={Home} label="Dashboard" tabName="overview" />
        <NavButton icon={CreditCard} label="Payments" tabName="payments" />
        <NavButton icon={Calendar} label="Events" tabName="events" />
        <NavButton icon={FileText} label="Resources" tabName="resources" />
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <NavButton icon={Settings} label="Settings" tabName="settings" />
        <button className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-indigo-800 transition">
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
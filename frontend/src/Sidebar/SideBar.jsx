import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, CreditCard, FileText, Home, LogOut, Settings, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SideBar = ({ activeTab, setActiveTab, closeSidebar, isAdmin }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      if (closeSidebar) {
        closeSidebar();
      }
      navigate('/');

      toast.success("Signed out successfully", {
        autoClose: 5000,
        position: "top-right",
      });

    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavButton = ({ icon, label, tabName }) => {
    const Icon = icon;

    return (
      <button
        onClick={() => {
          setActiveTab(tabName);
          if (closeSidebar) {
            closeSidebar();
          }
        }}
        className={`flex items-center w-full px-4 py-3 mb-2 rounded-2xl transition font-medium ${
          activeTab === tabName ? 'bg-zinc-950 text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
        }`}
      >
        <Icon size={20} className="mr-3" />
        {label}
      </button>
    );
  };

  const AdminNavButton = () => (
    <button
      onClick={() => {
        navigate('/dashboard/admin');
        if (closeSidebar) {
          closeSidebar();
        }
      }}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-2xl transition font-medium ${
        location.pathname.startsWith('/dashboard/admin') ? 'bg-zinc-950 text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
      }`}
    >
      <Shield size={20} className="mr-3" />
      Admin
    </button>
  );

  return (
    <div className="w-64 h-full bg-white text-zinc-950 flex flex-col border-r border-zinc-200">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center">
            <span className="text-zinc-950 font-black text-sm">SP</span>
          </div>
          <div>
            <h1 className="text-2xl font-black leading-tight">SCSAA</h1>
            <p className="text-sm text-zinc-500 mt-1">Sigma Pi Beta-Gamma</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <NavButton icon={Home} label="Dashboard" tabName="overview" />
        <NavButton icon={CreditCard} label="Payments" tabName="payments" />
        <NavButton icon={Calendar} label="Events" tabName="events" />
        <NavButton icon={FileText} label="Resources" tabName="resources" />
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <NavButton icon={Settings} label="Settings" tabName="settings" />
        {isAdmin && <AdminNavButton />}
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 rounded-2xl text-zinc-700 hover:bg-zinc-100 hover:text-black transition font-medium"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;

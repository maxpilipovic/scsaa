import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import { supabase } from '../lib/supabaseClient';

import SideBar from '../Sidebar/SideBar.jsx';
import Header from '../components/Header.jsx';
import OverviewPage from './OverviewPage.jsx';
import EventsPage from './EventsPage.jsx';
import ResourcesPage from '../components/ResosurcesPage.jsx';
import SuccessMessage from '../components/SuccessMessage.jsx';
import PaymentsPage from './PaymentsPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import { Menu, X } from 'lucide-react'; //Import Menu and X icons

function DashboardPage() {
  const { user, loading } = useAuth();
  const location = useLocation(); //Get location object (THIS IS FOR READING NAVIGATION STATE, E.G., DEFAULT TAB)
  const [authorized, setAuthorized] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); //State for sidebar visibility

  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [personData, setPersonData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  //Effect to handle incoming navigation state for DEFAULT TAB
  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
      // Clean the state from location history
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  //Effect to show success/error message banner based on URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let alertTimeout;

    const showAlert = (message, type) => {
      setAlert({ show: true, message, type });
      window.history.replaceState(null, null, window.location.pathname);

      alertTimeout = setTimeout(() => {
        setAlert(currentAlert => ({ ...currentAlert, show: false }));
      }, 7000);
    };

    if (queryParams.get('payment_success') === 'true') {
      showAlert('Payment successful! Thank you for your contribution.', 'success');
    } else if (queryParams.get('payment_cancelled') === 'true') {
      showAlert('Payment was cancelled. You have not been charged.', 'error');
    }

    return () => {
      clearTimeout(alertTimeout);
    };
  }, []);

  //Effect to check access and fetch all dashboard data
  useEffect(() => {
    if (!user) return;

    const checkAccess = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) return setAuthorized(false);

        const token = session.access_token;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/check-access`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok && data.authorized) {
          setAuthorized(true);
          setPersonData(data);
          await fetchDashboardData(token, user.id);
        } else setAuthorized(false);
      } catch (err) {
        console.error("NOT AUTHORIZED", err);
        setAuthorized(false);
      }
    };

    const fetchDashboardData = async (token, userId) => {
      try {
        const [membershipRes, paymentsRes, eventsRes, announcementsRes, adminStatusRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/memberships/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/payments/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/events`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/announcements`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getAdminStatus`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [membershipData, paymentsData, eventsData, announcementsData, adminData] = await Promise.all([
          membershipRes.json(),
          paymentsRes.json(),
          eventsRes.json(),
          announcementsRes.json(),
          adminStatusRes.json(),
        ]);

        setMembershipData(membershipData);
        setPaymentHistory(paymentsData);
        setUpcomingEvents(eventsData);
        setAnnouncements(announcementsData);
        setIsAdmin(adminData.is_admin);
        console.log("Admin Status:", adminData.is_admin);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    checkAccess();
  }, [user]);

  if (loading || (user && authorized === null)) return <LoadingPage />;
  if (!user) return <ErrorPage message="Please log in to access this page." />;
  if (user && authorized === false) return <ErrorPage message="You are not authorized to view this page." />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex">
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />
      </div>

      {/* Mobile Sidebar and Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sidebar content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-900 z-50">
            <SideBar activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {/* Hamburger menu button for smaller screens */}
        <div className="md:hidden p-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 focus:outline-none">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {personData?.authUser && <Header membershipData={personData.authUser} />}

        <div className="p-8">
          {alert.show && (
            <SuccessMessage
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(prev => ({ ...prev, show: false }))}
            />
          )}

          {activeTab === "overview" &&
            personData?.authUser && (
                <OverviewPage
                membershipData={membershipData}
                paymentHistory={paymentHistory}
                upcomingEvents={upcomingEvents}
                announcements={announcements}
                setActiveTab={setActiveTab}
                />
            )}
          
          {activeTab === "payments" && <PaymentsPage paymentHistory={paymentHistory} user={user} membershipData={membershipData} />}
          {activeTab === "events" && <EventsPage upcomingEvents={upcomingEvents} />}
          {activeTab === "resources" && <ResourcesPage />}
          {activeTab === "settings" && <SettingsPage user={user} />}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

import React from 'react';
import { useState, useEffect } from 'react';
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
import SettingsPage from './SettingsPage.jsx'; // <-- Import new page

function DashboardPage() {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [personData, setPersonData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Effect to show success/error message banner based on URL params
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

  // Effect to check access and fetch all dashboard data
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
        const [membershipRes, paymentsRes, eventsRes, announcementsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/memberships/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/payments/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/events`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/announcements`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [membershipData, paymentsData, eventsData, announcementsData] = await Promise.all([
          membershipRes.json(),
          paymentsRes.json(),
          eventsRes.json(),
          announcementsRes.json(),
        ]);

        setMembershipData(membershipData);
        setPaymentHistory(paymentsData);
        setUpcomingEvents(eventsData);
        setAnnouncements(announcementsData);
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
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
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
            personData?.authUser &&
            membershipData && (
                <OverviewPage
                membershipData={membershipData}
                paymentHistory={paymentHistory}
                upcomingEvents={upcomingEvents}
                announcements={announcements}
                setActiveTab={setActiveTab}
                />
            )}
          {activeTab === "payments" && <PaymentsPage paymentHistory={paymentHistory} user={user} />}
          {activeTab === "events" && <EventsPage upcomingEvents={upcomingEvents} />}
          {activeTab === "resources" && <ResourcesPage />}
          {activeTab === "settings" && <SettingsPage user={user} />}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

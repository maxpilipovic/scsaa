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

import PaymentsPage from './PaymentsPage.jsx';

function DashboardPage() {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [personData, setPersonData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!user) return;

    const checkAccess = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) return setAuthorized(false);

        const token = session.access_token;
        const response = await fetch('http://localhost:3001/api/check-access', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok && data.authorized) {
          setAuthorized(true);
          setPersonData(data);
          // ✅ use Supabase auth user.id, not data.authUser.id
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
          fetch(`http://localhost:3001/api/memberships/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:3001/api/payments/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/events', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/announcements', { headers: { Authorization: `Bearer ${token}` } }),
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

  // Wait for data to load
  if (loading || (user && authorized === null)) return <LoadingPage />;
  if (!user) return <ErrorPage message="Please log in to access this page." />;
  if (user && authorized === false) return <ErrorPage message="You are not authorized to view this page." />;

  // Derived fields
  const memberInfo = membershipData
    ? {
        ...membershipData,
        duesStatus: membershipData.status === "active" ? "paid" : "unpaid",
        duesExpiration: new Date(membershipData.expires_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }
    : null;

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {/* ✅ only render Header once personData is ready */}
        {personData?.authUser && <Header membershipData={personData.authUser} />}

        <div className="p-8">
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
          {activeTab === "payments" && <PaymentsPage paymentHistory={paymentHistory} />}
          {activeTab === "events" && <EventsPage upcomingEvents={upcomingEvents} />}
          {activeTab === "resources" && <ResourcesPage />}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
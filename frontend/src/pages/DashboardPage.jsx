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

    const { user, loading } = useAuth(); //UseAuth Context
    const [authorized, setAuthorized] = useState(null);
    const [hostName, setHostName] = useState("");
    const [activeTab, setActiveTab] = useState('overview');
    
    useEffect(() => {
      
      //Check if metadata exists
      if (!user) {
        return;
      }
  
      const checkAccess = async () => {
        try {
          //Grab token from supabase auth...
          const session = (await supabase.auth.getSession()).data.session;
          if (!session) {
            setAuthorized(false);
            return;
          }
          const token = session.access_token;
          //API call to verify data.
          const response = await fetch('http://localhost:3001/api/check-access', {
            headers : {
              'Authorization' : `Bearer ${token}`
            }
          });
          
          //Grab the data...
          const data = await response.json();
          
          if (response.ok && data.authorized) {
            setAuthorized(true);
            setHostName(data.name);
          } else {
            setAuthorized(false);
          }


        } catch (error) {
          console.error("NOT AUTHORIZED", error);
          setAuthorized(false);
        }
      };
  
      checkAccess();
    }, [user]);

    //Loading or user not yet loaded
    if (loading || (user && authorized === null)) {
        return <LoadingPage />;
    }

    //User not authorized
    if (user && authorized === false) {
        return <ErrorPage message="You are not authorized to view this page." />;
    }

    //Optional: user not logged in at all
    if (!user) {
        return <ErrorPage message="Please log in to access this page." />;
    }
  
    // Sample data matching database schema
    const memberData = {
        id: "usr_001",
        first_name: "John",
        last_name: "Anderson",
        email: "john.anderson@email.com",
        phone_number: "(555) 123-4567",
        pledge_class: "Fall 2015",
        graduationYear: "2019",
        is_admin: false,
        created_at: "2015-09-01T00:00:00Z",
        dob: "1997-03-15",
        address: "123 Alumni Way, Springfield, IL",
        name: "John Anderson", // derived field for convenience
        pledgeClass: "Fall 2015" // derived field for convenience
    };

    // Sample membership data
    const membershipData = {
        membership_id: "mem_001",
        user_id: "usr_001",
        year: 2025,
        status: "active",
        paid_at: "2025-01-15T10:30:00Z",
        expires_at: "2025-12-31T23:59:59Z",
        created_at: "2025-01-15T10:30:00Z"
    };

    const paymentHistory = [
        { 
        payment_id: "pay_003",
        user_id: "usr_001",
        dues_amount: 50.00,
        processing_fee: 1.50,
        stripe_payment_id: "pi_3xyz789",
        status: "completed",
        created_at: "2025-01-15T10:30:00Z",
        date: "Jan 15, 2025",
        amount: "$50.00",
        status_display: "Completed",
        method: "Credit Card"
        },
        { 
        payment_id: "pay_002",
        user_id: "usr_001",
        dues_amount: 45.00,
        processing_fee: 1.35,
        stripe_payment_id: "pi_2abc456",
        status: "completed",
        created_at: "2024-01-20T14:20:00Z",
        date: "Jan 20, 2024",
        amount: "$45.00",
        status_display: "Completed",
        method: "PayPal"
        },
        { 
        payment_id: "pay_001",
        user_id: "usr_001",
        dues_amount: 45.00,
        processing_fee: 1.35,
        stripe_payment_id: "pi_1def123",
        status: "completed",
        created_at: "2023-02-05T09:15:00Z",
        date: "Feb 5, 2023",
        amount: "$45.00",
        status_display: "Completed",
        method: "Credit Card"
        },
    ];

    const upcomingEvents = [
        { 
        event_id: "evt_001",
        name: "Annual Homecoming Reunion",
        description: "Join us for our annual homecoming celebration with brothers from all generations.",
        location: "Campus Alumni Center",
        start_time: "2025-11-15T18:00:00Z",
        end_date: "2025-11-15T23:00:00Z",
        created_at: "2025-09-01T12:00:00Z",
        user_id: "usr_admin",
        date: "Nov 15, 2025",
        title: "Annual Homecoming Reunion"
        },
        { 
        event_id: "evt_002",
        name: "Holiday Social Mixer",
        description: "End of year celebration with networking and festivities.",
        location: "Downtown Hotel",
        start_time: "2025-12-10T19:00:00Z",
        end_date: "2025-12-10T22:00:00Z",
        created_at: "2025-10-01T12:00:00Z",
        user_id: "usr_admin",
        date: "Dec 10, 2025",
        title: "Holiday Social Mixer"
        },
    ];

    const announcements = [
        { 
        date: "Oct 20, 2025",
        title: "New Chapter Scholarship Fund Launched",
        preview: "We're excited to announce a new scholarship opportunity for current students. Applications open December 1st.",
        created_at: "2025-10-20T10:00:00Z"
        },
        { 
        date: "Oct 10, 2025",
        title: "Board Elections Coming in December",
        preview: "Nominations are now open for the 2026 board positions. Submit your nomination by November 30th.",
        created_at: "2025-10-10T15:30:00Z"
        },
    ];

    // Derived fields for display
    memberData.duesStatus = membershipData.status === "active" ? "paid" : "unpaid";
    memberData.duesExpiration = new Date(membershipData.expires_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    console.log(paymentHistory);

    return (
    <div className="flex h-screen bg-gray-50">
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-auto">
        <Header memberData={memberData} />

        <div className="p-8">
          {activeTab === 'overview' && (
            <OverviewPage 
              memberData={memberData}
              paymentHistory={paymentHistory}
              upcomingEvents={upcomingEvents}
              announcements={announcements}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'payments' && <PaymentsPage paymentHistory={paymentHistory} />}
          {activeTab === 'directory' && <DirectoryPage />}
          {activeTab === 'events' && <EventsPage upcomingEvents={upcomingEvents} />}
          {activeTab === 'resources' && <ResourcesPage />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
import React from 'react';
import StatusCard from '../components/StatusCard.jsx';
import SectionCard from '../components/SectionCard.jsx';
import AnnouncementsList from '../components/AnnouncementsList.jsx';
import PaymentTable from '../components/PaymentTable.jsx';
import EventsList from '../components/EventsList.jsx';
import ChapterStats from '../components/ChapterStats.jsx';
import { CreditCard, Users, Calendar} from 'lucide-react';


const OverviewPage = ({ membershipData, paymentHistory, upcomingEvents, announcements, setActiveTab }) => {

  //onsole.log(membershipData);
  //console.log(paymentHistory);
  //console.log(upcomingEvents);
  //console.log(announcements);
  if (!membershipData) return null; // Wait for data

  //Map DB fields to UI-friendly variable names
  const duesExpiration = membershipData.expires_at
    ? new Date(membershipData.expires_at).toLocaleDateString()
    : 'N/A';
  //const pledgeClass = membershipData.pledge_class || 'N/A';
  const memberSince = membershipData.year || 'N/A';
  const duesStatus = membershipData.status?.toUpperCase(); //To uppercase

  //Safely handle upcoming events
  const nextEvent = upcomingEvents?.length ? upcomingEvents[0] : null;

  const statusColors = {
    INCOMPLETE: "green", //Inital payment fails
    INCOMPLETE_EXPIRED: "orange", //First invoice not paid within 23 hours
    TRIALING: "blue", //Trial period (does not exist in my system)
    ACTIVE: "green", //Trial period is over...
    PAST_DUE: "yellow", //Payment is required in subscription, but failed.
    CANCELED: "red", //Subscription has been cancelled (Exhausted all retries)
    PENDING_CANCELLATION: "red", //Subscription has been cancelled (Exhausted all retries)
    UNPAID: "red", //Subscription has been cancelled (Exhausted all retries)
  };

  //Decide what color - fallback black
  const statusColor = statusColors[duesStatus] || "black";


  return (
    <>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatusCard
          title="Dues Status"
          value={duesStatus}
          subtitle={`Valid until ${duesExpiration}`}
          color={statusColor}
        />
        <StatusCard
          title="Member Since"
          value={memberSince}
          color={statusColor}
        />
        <StatusCard
          title="Upcoming Events"
          value={upcomingEvents?.length || 0}
          subtitle={nextEvent ? `Next: ${new Date(nextEvent.start_time).toLocaleDateString()}` : 'No upcoming events'}
          color={statusColor}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard 
            title="Recent Payments"
            action={
              <button 
                onClick={() => setActiveTab('payments')}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View All
              </button>
            }
          >
            <PaymentTable payments={paymentHistory?.slice(0, 3) || []} />
          </SectionCard>

          <SectionCard title="Latest Announcements">
            <AnnouncementsList announcements={announcements || []} />
          </SectionCard>
        </div>

        {/* Right Column - Takes 1/3 */}
        <div className="space-y-6">
          <SectionCard title="Upcoming Events">
            <EventsList events={upcomingEvents || []} compact={true} />
          </SectionCard>

          <ChapterStats />
        </div>
      </div>
    </>
  );
};

export default OverviewPage;
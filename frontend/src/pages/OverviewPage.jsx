import React from 'react';
import StatusCard from '../components/StatusCard.jsx';
import SectionCard from '../components/SectionCard.jsx';
import AnnouncementsList from '../components/AnnouncementsList.jsx';
import PaymentTable from '../components/PaymentTable.jsx';
import EventsList from '../components/EventsList.jsx';
import QuickActions from '../components/QuickActions.jsx';
import ChapterStats from '../components/ChapterStats.jsx';
import { Home, CreditCard, Users, FileText, Calendar, Settings, LogOut, Bell, Search, Download } from 'lucide-react';


const OverviewPage = ({ memberData, paymentHistory, upcomingEvents, announcements, setActiveTab }) => {
  return (
    <>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatusCard
          title="Dues Status"
          value="PAID"
          subtitle={`Valid until ${memberData.duesExpiration}`}
          icon={CreditCard}
          color="green"
        />
        <StatusCard
          title="Member Since"
          value={memberData.pledgeClass}
          subtitle={`Graduated ${memberData.graduationYear}`}
          icon={Users}
          color="blue"
        />
        <StatusCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          subtitle={`Next: ${upcomingEvents[0].date}`}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 */}
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
            <PaymentTable payments={paymentHistory.slice(0, 3)} />
          </SectionCard>

          <SectionCard title="Latest Announcements">
            <AnnouncementsList announcements={announcements} />
          </SectionCard>
        </div>

        {/* Right Column - Takes 1/3 */}
        <div className="space-y-6">
          <SectionCard title="Upcoming Events">
            <EventsList events={upcomingEvents} compact={true} />
          </SectionCard>

          <QuickActions />
          <ChapterStats />
        </div>
      </div>
    </>
  );
};

export default OverviewPage;
import React from 'react';
import { useEffect } from 'react';

const ChapterStats = () => {
  const [totalAlumni, setTotalAlumni] = React.useState(0);
  const [activeMembers, setActiveMembers] = React.useState(0);

  useEffect(() => {
    const fetchTotalMembers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getTotalMembers`);
        const data = await response.json();

        console.log("Total members:", data);
        setTotalAlumni(data.totalMembers);
      } catch (error) {
        console.error('Error fetching total members:', error);
      }
    };

    fetchTotalMembers();
  }, []);

  const fetchActiveMembers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getActiveMembers`);
      const data = await response.json();

      console.log("Active members:", data);
      setActiveMembers(data.activeMembers);
    } catch (error) {
      console.error('Error fetching active members:', error);
    }
  };

  useEffect(() => {
    fetchActiveMembers();
  }, []);

  const actualStats = [
    { label: "Total Alumni", value: totalAlumni },
    { label: "Active Members", value: activeMembers },
  ];

  return (
    <div className="panel p-6 text-zinc-950">
      <p className="section-eyebrow mb-2">Chapter Pulse</p>
      <h3 className="text-lg font-bold mb-4">SCSAA Stats</h3>
      <div className="space-y-3">
        {actualStats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center border-b border-zinc-200 last:border-b-0 pb-3 last:pb-0">
            <span className="text-zinc-600">{stat.label}</span>
            <span className="text-2xl font-black text-zinc-950">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterStats;

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
        //Update
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
      //Update
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
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">SCSAA Stats</h3>
      <div className="space-y-3">
        {actualStats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-indigo-100">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterStats;
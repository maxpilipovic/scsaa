import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTable = ({ users }) => {
  const navigate = useNavigate();

  if (!users || users.length === 0) {
    return <p className="text-gray-500">No users found.</p>;
  }

  const handleRowClick = (userId) => {
    navigate(`/dashboard/user/${userId}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-600 border-b">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Pledge Class</th>
            <th className="pb-3 font-medium">Joined Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
            const joinedDate = new Date(user.created_at).toLocaleDateString();
            const pledgeClass = user.pledge_class || 'N/A';

            return (
              <tr 
                key={user.id} 
                className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(user.id)}
              >
                <td className="py-4 text-sm text-gray-800">{fullName}</td>
                <td className="py-4 text-sm text-gray-600">{user.email}</td>
                <td className="py-4 text-sm text-gray-600">{pledgeClass}</td>
                <td className="py-4 text-sm text-gray-600">{joinedDate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

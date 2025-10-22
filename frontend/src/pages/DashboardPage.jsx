import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';

function DashboardPage() {

    const { user, loading } = useAuth();
    const [authorized, setAuthorized] = useState(null);
    const [users, setUsers] = useState([]);
    const [hostName, setHostName] = useState("");

    useEffect(() => {
      
      //Check if metadata exists
      if (!user) {
        return;
      }
  
      const checkAccess = async () => {
        try {
          const usersResponse = await fetch('http://localhost:3001/api/users');
          const usersData = await usersResponse.json();
          setUsers(usersData);
          console.log(user.user_metadata.email);
          console.log(usersData);      
          const currentUser = usersData.find(w => w.email === user.user_metadata.email);
          
          //IF VALID USER
          if (currentUser) {
            setAuthorized(true);
            setHostName(currentUser.first_name + " " + currentUser.last_name);

          }
          else  {
            setAuthorized(false);
            console.log("NOT AUTHORIZED");
          }
        } catch (error) {
          console.error("NOT AUTHORIZED", error);
          setAuthorized(false);
        }
      };
  
      checkAccess();
    }, [user]);

    // Loading or user not yet loaded
    if (loading || (user && authorized === null)) {
        return <LoadingPage />;
    }

    // User not authorized
    if (user && authorized === false) {
        return <ErrorPage message="You are not authorized to view this page." />;
    }

    // Optional: user not logged in at all
    if (!user) {
        return <ErrorPage message="Please log in to access this page." />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">
                Welcome, {hostName}
            </h1>
        </div>
    );
}

export default DashboardPage;
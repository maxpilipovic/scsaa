import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import ErrorPage from './ErrorPage';
import { supabase } from '../lib/supabaseClient';

function DashboardPage() {

    const { user, loading } = useAuth(); //UseAuth Context
    const [authorized, setAuthorized] = useState(null);
    const [hostName, setHostName] = useState("");

    useEffect(() => {
      
      //Check if metadata exists
      if (!user) {
        return;
      }
  
      const checkAccess = async () => {
        try {
          //Grab token from supabase auth...
          const token = (await supabase.auth.getSession()).data.session?.access_token;
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

    return (
        <div>
            <h1 className="text-3xl font-bold">
                Welcome, {hostName}
            </h1>
        </div>
    );
}

export default DashboardPage;
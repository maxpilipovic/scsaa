import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const AdminContext = createContext({});

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication to complete
    }

    const checkAdminRole = async () => {
      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const token = session.access_token;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/getAdminStatus`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch admin status');
            }

            const adminData = await response.json();
            setIsAdmin(adminData.is_admin === true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    setLoading(true);
    checkAdminRole();
  }, [user, authLoading]);

  const value = {
    isAdmin,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import LoadingPage from '../pages/LoadingPage';

/**
 * ProtectedRoute component that prevents non-admin users from accessing admin pages
 * Handles loading states and redirects unauthorized users to dashboard
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading) {
    return <LoadingPage />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin route but user is not admin - redirect to dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authorized, render the component
  return children;
};

export default ProtectedRoute;

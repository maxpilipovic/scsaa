import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingPage from "../pages/LoadingPage";
import ErrorPage from "../pages/ErrorPage";

//Admin auth wrapper that restricts access to admin users only
const AdminContext = ({ children }) => {

  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //Assuming user metadata contains a role field
  if (user.user_metadata?.role !== 'admin') {
    return <ErrorPage message="Access Denied: Admins Only" />;
  }

  return children;
};

export default AdminContext;
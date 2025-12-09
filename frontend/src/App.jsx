import React from "react";
import HomePage from "./pages/HomePage";
import { Routes, Route } from 'react-router-dom';

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminAnnouncementsPage from "./pages/AdminAnnouncementsPage";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/user/:userId" element={<UserDetailsPage />} />
          <Route path="/dashboard/admin/events" element={<AdminEventsPage />} />
          <Route path="/dashboard/admin/announcements" element={<AdminAnnouncementsPage />} />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App;

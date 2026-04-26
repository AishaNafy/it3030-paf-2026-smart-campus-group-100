import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketCreationPage from './pages/TicketCreationPage';
import TicketListPage from './pages/TicketListPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ReportingDashboard from './pages/ReportingDashboard';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import BookingRequestPage from './pages/Booking/BookingRequestPage'; // Booking
import MyBookings from './pages/Booking/MyBookings'; // Booking
import BookingAdminDashboard from './pages/Booking/AdminDashboard'; // Booking (Renamed to avoid conflict)
import FacilityListPage from './pages/FacilityListPage';
import FacilityDetailsPage from './pages/FacilityDetailsPage';
import UserManagementPage from './pages/UserManagementPage';
import AuthCallback from './pages/AuthCallback';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Student Routes */}
        <Route path="/student" element={<Layout role="STUDENT" />}>
          <Route index element={<TicketListPage />} />
          <Route path="create" element={<TicketCreationPage />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
          <Route path="book" element={<BookingRequestPage />} /> {/* Booking */}
          <Route path="my-bookings" element={<MyBookings />} /> {/* Booking */}
          <Route path="facilities" element={<FacilityListPage />} />
          <Route path="facilities/:id" element={<FacilityDetailsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Technician Routes - dashboard handles its own auth & layout */}
        <Route path="/technician" element={<TechnicianDashboard />} />
        <Route path="/technician/ticket/:id" element={<Layout role="TECHNICIAN"><TicketDetailsPage /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout role="ADMIN" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<ReportingDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
          <Route path="manage-bookings" element={<BookingAdminDashboard />} /> {/* Booking */}
          <Route path="facilities" element={<FacilityListPage />} />
          <Route path="facilities/:id" element={<FacilityDetailsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
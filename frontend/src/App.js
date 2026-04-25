import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to student by default */}
        <Route path="/" element={<Navigate to="/student" replace />} />

        {/* Student Routes */}
        <Route path="/student" element={<Layout role="student" />}>
          <Route index element={<TicketListPage />} />
          <Route path="create" element={<TicketCreationPage />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
          <Route path="book" element={<BookingRequestPage />} /> {/* Booking */}
          <Route path="my-bookings" element={<MyBookings />} /> {/* Booking */}
          <Route path="facilities" element={<FacilityListPage />} />
          <Route path="facilities/:id" element={<FacilityDetailsPage />} />
        </Route>

        {/* Technician Routes */}
        <Route path="/technician" element={<Layout role="technician" />}>
          <Route index element={<TechnicianDashboard />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<ReportingDashboard />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
          <Route path="manage-bookings" element={<BookingAdminDashboard />} /> {/* Booking */}
          <Route path="facilities" element={<FacilityListPage />} />
          <Route path="facilities/:id" element={<FacilityDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
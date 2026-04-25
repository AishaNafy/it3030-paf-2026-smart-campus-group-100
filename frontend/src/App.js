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
import FacilityListPage from './pages/FacilityListPage';
import FacilityDetailsPage from './pages/FacilityDetailsPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<Layout role="student" />}>
          <Route index element={<TicketListPage />} />
          <Route path="create" element={<TicketCreationPage />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
          <Route path="facilities" element={<FacilityListPage />} />
          <Route path="facilities/:id" element={<FacilityDetailsPage />} />
        </Route>

        {/* Technician Routes - dashboard handles its own auth & layout */}
        <Route path="/technician" element={<TechnicianDashboard />} />
        <Route path="/technician/ticket/:id" element={<Layout role="technician"><TicketDetailsPage /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<ReportingDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
          <Route path="facilities" element={<FacilityListPage />} />
          <Route path="facilities/:id" element={<FacilityDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

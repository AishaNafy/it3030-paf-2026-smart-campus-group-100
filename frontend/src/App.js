import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TicketCreationPage from './pages/TicketCreationPage';
import TicketListPage from './pages/TicketListPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ReportingDashboard from './pages/ReportingDashboard';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to student by default, or just leave it empty if user prefers */}
        <Route path="/" element={<Navigate to="/student" replace />} />

        {/* Student Routes */}
        <Route path="/student" element={<Layout role="student" />}>
          <Route index element={<TicketListPage />} />
          <Route path="create" element={<TicketCreationPage />} />
          <Route path="ticket/:id" element={<TicketDetailsPage />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

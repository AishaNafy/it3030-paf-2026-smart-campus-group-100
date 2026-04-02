import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
  const { role } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      setTickets(response.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tickets/${selectedTicket.id}`, {
        status: updateStatus,
        assignedTo: assignedTo || null,
        resolutionNotes: resolutionNotes
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setAssignedTo(ticket.assignedTo || '');
    setUpdateStatus(ticket.status);
    setResolutionNotes(ticket.resolutionNotes || '');
  };

  if (role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admin Role Required.</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p className="text-gray-500 text-sm">Review all incidents, assign technicians, and update status.</p>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? <p>Loading...</p> : tickets.map(ticket => (
          <div key={ticket.id} className="glass-card hover:shadow-xl transition cursor-pointer" onClick={() => openModal(ticket)}>
            <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-gray-800">{ticket.title}</h3>
               <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{ticket.status}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
               <span>P: {ticket.priority}</span>
               <span>Assignee: {ticket.assignedTo || 'Unassigned'}</span>
               <span>By: {ticket.createdBy}</span>
            </div>
          </div>
        ))}
        {!loading && tickets.length === 0 && <p>No tickets found.</p>}
      </div>

      {/* Update Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
             <h3 className="text-xl font-bold mb-4">Allocate Ticket #{selectedTicket.id.substring(20)}</h3>
             <form onSubmit={handleUpdateTicket} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Assign Technician</label>
                   <select 
                      value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                      className="input-field"
                   >
                     <option value="">-- Unassigned --</option>
                     <option value="TechUser">TechUser (Default Technician)</option>
                     <option value="John Doe (IT)">John Doe (IT)</option>
                     <option value="Jane Smith (Maintenance)">Jane Smith (Maintenance)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Status</label>
                   <select 
                      value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}
                      className="input-field"
                   >
                     <option value="Open">Open</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Resolved">Resolved</option>
                     <option value="Closed">Closed</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                   <textarea 
                      rows={4}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="input-field resize-none"
                      placeholder="Enter details about how this was resolved (optional)..."
                   />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                   <button type="button" onClick={() => setSelectedTicket(null)} className="btn-secondary">Cancel</button>
                   <button type="submit" className="btn-primary">Save Changes</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

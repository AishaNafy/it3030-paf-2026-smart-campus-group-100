import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Filter, Search, Eye } from 'lucide-react';
import api from '../api/axiosConfig';

const TicketListPage = () => {
  const { role } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if(statusFilter) params.append('status', statusFilter);
      if(priorityFilter) params.append('priority', priorityFilter);
      if(categoryFilter) params.append('category', categoryFilter);
      params.append('page', page);
      params.append('size', 10);
      
      const response = await api.get(`/tickets?${params.toString()}`);
      setTickets(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, categoryFilter, page]);

  // Utility for status colors
  const statusColor = {
    'Open': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Bar with Filters */}
      <div className="glass-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Filter size={20} className="text-primary"/> Filters
        </h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <select 
             className="input-field text-sm !mt-0"
             value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="">All Statuses</option>
             <option value="Open">Open</option>
             <option value="In Progress">In Progress</option>
             <option value="Resolved">Resolved</option>
             <option value="Closed">Closed</option>
           </select>

           <select 
             className="input-field text-sm !mt-0"
             value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
           >
             <option value="">All Priorities</option>
             <option value="Low">Low</option>
             <option value="Medium">Medium</option>
             <option value="High">High</option>
             <option value="Critical">Critical</option>
           </select>

           <select 
             className="input-field text-sm !mt-0"
             value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
           >
             <option value="">All Categories</option>
             <option value="Maintenance">Maintenance</option>
             <option value="IT">IT</option>
             <option value="Cleaning">Cleaning</option>
           </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/40 divide-y divide-gray-100 backdrop-blur-sm">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No tickets found.</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-primary/5 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      #{ticket.id.substring(ticket.id.length - 6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                      <div className="text-xs text-gray-500">Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`ticket/${ticket.id}`} className="text-primary hover:text-teal-700 flex items-center gap-1">
                        <Eye size={16} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white/30 backdrop-blur-sm">
          <button 
             disabled={page === 0} 
             onClick={() => setPage(p => p - 1)}
             className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page + 1} of {Math.max(1, totalPages)}</span>
          <button 
             disabled={page >= totalPages - 1} 
             onClick={() => setPage(p => p + 1)}
             className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketListPage;

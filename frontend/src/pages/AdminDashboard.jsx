import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import jsPDF from 'jspdf';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return { bg: [220, 234, 255], text: [20, 83, 204] };
      case 'In Progress':
        return { bg: [255, 249, 220], text: [173, 120, 4] };
      case 'Resolved':
        return { bg: [220, 255, 231], text: [19, 107, 68] };
      case 'Closed':
        return { bg: [238, 242, 247], text: [75, 85, 99] };
      default:
        return { bg: [243, 244, 246], text: [55, 65, 81] };
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 28;

    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(32, 111, 234);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Admin Dashboard - All Tickets', margin, 34);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported: ${new Date().toLocaleString()}`, margin, 46);
    let y = 72;

    if (!tickets || tickets.length === 0) {
      doc.setTextColor(102, 113, 122);
      doc.setFontSize(12);
      doc.text('No tickets available to export.', margin, y);
    } else {
      tickets.forEach((ticket, index) => {
        const cardHeight = 118;
        if (y + cardHeight > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          y = 50;
          doc.setFillColor(32, 111, 234);
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(18);
          doc.text(`Admin Dashboard - All Tickets (continued)`, margin, 32);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(102, 113, 122);
          doc.text(`Exported: ${new Date().toLocaleString()}`, margin, 44);
          y = 60;
        }

        doc.setFillColor(247, 250, 255);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, cardHeight - 10, 8, 8, 'F');
        doc.setTextColor(31, 41, 55);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(`${index + 1}. ${ticket.title}`, margin + 8, y + 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`ID: ${ticket.id}`, margin + 8, y + 36);

        const statusColors = getStatusColor(ticket.status);
        doc.setFillColor(...statusColors.bg);
        doc.setTextColor(...statusColors.text);
        const statusText = ` ${ticket.status} `;
        const statusWidth = doc.getTextWidth(statusText) + 10;
        doc.roundedRect(pageWidth - margin - statusWidth - 8, y + 18, statusWidth, 16, 4, 4, 'F');
        doc.text(statusText, pageWidth - margin - statusWidth, y + 30);

        doc.setTextColor(55, 65, 81);
        doc.text(`Priority: ${ticket.priority} | Assigned: ${ticket.assignedTo || 'Unassigned'}`, margin + 8, y + 50);
        doc.text(`Created by: ${ticket.createdBy}`, margin + 8, y + 64);

        const desc = ticket.description || 'N/A';
        const descLines = doc.splitTextToSize(`Description: ${desc}`, pageWidth - 2 * margin - 16);
        doc.setTextColor(75, 85, 99);
        doc.text(descLines, margin + 8, y + 78);

        if (ticket.resolutionNotes) {
          const resLines = doc.splitTextToSize(`Resolution Notes: ${ticket.resolutionNotes}`, pageWidth - 2 * margin - 16);
          doc.text(resLines, margin + 8, y + 92 + descLines.length * 0);
        }

        y += cardHeight;
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setFontSize(9);
      doc.setTextColor(128, 136, 143);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 16, { align: 'center' });
    }

    doc.save('all_tickets.pdf');
  };

  if (role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admin Role Required.</div>;
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm">Review all incidents, assign technicians, and update status.</p>
        </div>
        <button
          onClick={downloadPdf}
          className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-cyan-500 transition duration-300"
          type="button"
        >
          Download All Tickets PDF
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? <p className="text-slate-500">Loading...</p> : tickets.map(ticket => (
          <div
            key={ticket.id}
            className="bg-white/80 border border-slate-200 rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5"
            onClick={() => openModal(ticket)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-slate-800 text-lg">{ticket.title}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyles(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4">{ticket.description}</p>

            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-700">Priority:</span> {ticket.priority}</p>
              <p><span className="font-semibold text-slate-700">Technician:</span> {ticket.assignedTo || 'Unassigned'}</p>
              <p><span className="font-semibold text-slate-700">Reported by:</span> {ticket.createdBy}</p>
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

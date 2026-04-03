import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, User, Tag, Paperclip, Eye, Mail, Phone, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api/axiosConfig';

const TicketDetailsPage = () => {
  const { id } = useParams();
  const { role } = useOutletContext();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const pdfRef = useRef();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/comments/ticket/${id}`)
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post('/comments', {
        ticketId: id,
        content: newComment,
        author: role === 'student' ? 'StudentUser' : 'TechUser'
      });
      setNewComment('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ PDF DOWNLOAD FUNCTION - PROFESSIONAL & CREATIVE
  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let y = 15;

    // ========== HEADER SECTION ==========
    // Background color for header
    pdf.setFillColor(15, 23, 42); // Dark slate blue
    pdf.rect(0, 0, pageWidth, 30, 'F');

    // Header Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont(undefined, 'bold');
    pdf.text("TICKET DETAILS REPORT", 14, 12);

    // Header Subtitle
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    y = 45;

    // ========== TICKET ID & STATUS BANNER ==========
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(14, y - 5, pageWidth - 28, 12, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text(`#${id}`, 16, y + 2);

    // Priority & Status badges
    const statusColor = ticket.status === 'resolved' ? [34, 197, 94] : ticket.status === 'in-progress' ? [251, 146, 60] : [156, 163, 175];
    pdf.setFillColor(...statusColor);
    pdf.rect(pageWidth - 60, y - 5, 25, 12, 'F');
    pdf.setFontSize(9);
    pdf.text(ticket.status.toUpperCase(), pageWidth - 55, y + 2);

    pdf.setFillColor(168, 85, 247); // Purple for priority
    pdf.rect(pageWidth - 32, y - 5, 25, 12, 'F');
    pdf.text(ticket.priority.toUpperCase(), pageWidth - 28, y + 2);

    y += 25;

    // ========== TICKET INFORMATION GRID ==========
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.setFillColor(229, 231, 235); // Light gray background
    pdf.rect(14, y - 5, pageWidth - 28, 8, 'F');
    pdf.text("TICKET INFORMATION", 16, y);

    y += 12;

    // Two-column layout for info
    const col1X = 16;
    const col2X = pageWidth / 2 + 5;
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');

    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text("Title:", col1X, y);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    const titleLines = pdf.splitTextToSize(ticket.title, 60);
    pdf.text(titleLines, col1X + 20, y);
    y += titleLines.length * 5 + 3;

    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text("Category:", col1X, y);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(ticket.category, col1X + 20, y);
    y += 6;

    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text("Created By:", col1X, y);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(ticket.createdBy, col1X + 20, y);
    y += 6;

    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.text("Created At:", col1X, y);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(new Date(ticket.createdAt).toLocaleString(), col1X + 20, y);
    y += 12;

    // ========== CONTACT INFORMATION ==========
    if (ticket.email || ticket.phoneNumber || ticket.incidentDate) {
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(107, 114, 128); // Gray
      pdf.rect(14, y - 5, pageWidth - 28, 8, 'F');
      pdf.text("CONTACT & INCIDENT DETAILS", 16, y);

      y += 12;

      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);

      if (ticket.email) {
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(51, 65, 85);
        pdf.text("Email:", col1X, y);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(ticket.email, col1X + 20, y);
        y += 6;
      }

      if (ticket.phoneNumber) {
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(51, 65, 85);
        pdf.text("Phone:", col1X, y);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(ticket.phoneNumber, col1X + 20, y);
        y += 6;
      }

      if (ticket.incidentDate) {
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(51, 65, 85);
        pdf.text("Incident Date:", col1X, y);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(ticket.incidentDate, col1X + 20, y);
        y += 8;
      }
    }

    y += 5;

    // ========== DESCRIPTION ==========
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(15, 23, 42); // Dark slate
    pdf.rect(14, y - 5, pageWidth - 28, 8, 'F');
    pdf.setFontSize(10);
    pdf.text("DESCRIPTION", 16, y);

    y += 10;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    const descLines = pdf.splitTextToSize(ticket.description, 180);
    pdf.text(descLines, 16, y);
    y += descLines.length * 5 + 5;

    // ========== RESOLUTION NOTES ==========
    if (ticket.resolutionNotes) {
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(34, 197, 94); // Green
      pdf.rect(14, y - 5, pageWidth - 28, 8, 'F');
      pdf.setFontSize(10);
      pdf.text("RESOLUTION NOTES", 16, y);

      y += 10;

      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      const resLines = pdf.splitTextToSize(ticket.resolutionNotes, 180);
      pdf.text(resLines, 16, y);
      y += resLines.length * 5 + 5;
    }

    // ========== COMMENTS SECTION ==========
    if (comments.length > 0) {
      if (y > 250) {
        pdf.addPage();
        y = 15;
      }

      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(99, 102, 241); // Indigo
      pdf.rect(14, y - 5, pageWidth - 28, 8, 'F');
      pdf.setFontSize(10);
      pdf.text(`COMMENTS (${comments.length})`, 16, y);

      y += 12;

      pdf.setFontSize(8);

      comments.forEach((c, index) => {
        if (y > 270) {
          pdf.addPage();
          y = 15;
        }

        // Comment box background
        pdf.setFillColor(244, 245, 247);
        pdf.rect(14, y - 4, pageWidth - 28, 1, 'F');

        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(51, 65, 85);
        pdf.text(`${c.author} • ${new Date(c.createdAt).toLocaleString()}`, 16, y);

        y += 5;

        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(31, 41, 55);
        const commentLines = pdf.splitTextToSize(c.content, 175);
        pdf.text(commentLines, 18, y);
        y += commentLines.length * 4 + 5;
      });
    }

    // ========== FOOTER ==========
    const footerY = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Smart Campus Ticketing System • Page ${pdf.internal.getCurrentPageInfo().pageNumber}`, 14, footerY);
    pdf.text(`Confidential - For Official Use Only`, pageWidth - 60, footerY);

    // Save PDF
    pdf.save(`ticket-${id}.pdf`);
  };

  if (loading) return <div className="p-12 text-center">Loading ticket details...</div>;
  if (!ticket) return <div className="p-12 text-center text-red-500">Ticket not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <Link
          to={`/${role}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Tickets
        </Link>

        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
        >
          Download Ticket 
        </button>
      </div>

      {/* 📄 Ticket Content (Captured for PDF) */}
      <div ref={pdfRef} className="glass-card p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Tag size={16}/> {ticket.category}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {new Date(ticket.createdAt).toLocaleString()}</span>
              <span className="flex items-center gap-1"><User size={16}/> {ticket.createdBy}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
              {ticket.email && <span className="flex items-center gap-1"><Mail size={16}/> {ticket.email}</span>}
              {ticket.phoneNumber && <span className="flex items-center gap-1"><Phone size={16}/> {ticket.phoneNumber}</span>}
              {ticket.incidentDate && <span className="flex items-center gap-1"><Calendar size={16}/> {ticket.incidentDate}</span>}
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium mr-2">{ticket.priority}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{ticket.status}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <p>{ticket.description}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Paperclip size={18}/> Attachments
            </h3>

            <div className="flex gap-4 overflow-x-auto">
              {ticket.attachments.map((url, idx) => (
                <img key={idx} src={url} alt="attachment" className="w-32 h-32 object-cover rounded-lg border"/>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {ticket.resolutionNotes && (
          <div className="bg-emerald-50 border p-4 rounded-lg">
            <h3 className="font-semibold text-emerald-800">Resolution Notes</h3>
            <p className="text-emerald-700">{ticket.resolutionNotes}</p>
          </div>
        )}
      </div>

      {/* 💬 Discussion Section */}
      <div className="glass-card">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <MessageSquare size={20}/> Discussion
        </h3>

        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {comment.author.charAt(0)}
              </div>

              <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{comment.author}</span>
                  <span className="text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field flex-1"
            rows={2}
            placeholder="Type your message..."
          />
          <button className="btn-primary">Post</button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
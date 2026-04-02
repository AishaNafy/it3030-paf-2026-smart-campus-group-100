import React, { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, User, Tag, Paperclip, Eye, Mail, Phone, Calendar } from 'lucide-react';
import api from '../api/axiosConfig';

const TicketDetailsPage = () => {
  const { id } = useParams();
  const { role } = useOutletContext();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

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
        author: role === 'student' ? 'StudentUser' : 'TechUser' // simulate author
      });
      setNewComment('');
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading ticket details...</div>;
  if (!ticket) return <div className="p-12 text-center text-red-500">Ticket not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link to={`/${role}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary mb-2 transition">
        <ArrowLeft size={16} className="mr-1" /> Back to Tickets
      </Link>

      {/* Main Ticket Info */}
      <div className="glass-card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Tag size={16}/> {ticket.category}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {new Date(ticket.createdAt).toLocaleString()}</span>
              <span className="flex items-center gap-1"><User size={16}/> Reported by: {ticket.createdBy}</span>
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

        <div className="prose max-w-none mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p>{ticket.description}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Paperclip size={18} /> Attachments
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {ticket.attachments.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="shrink-0 w-32 h-32 rounded-lg border overflow-hidden hover:opacity-80 transition block group relative">
                    <img src={url} alt={`Attachment ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                       <Eye className="text-white" />
                    </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Notes  */}
        {ticket.resolutionNotes && (
          <div className="mt-6 bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
             <h3 className="font-semibold text-emerald-800 mb-1">Resolution Notes</h3>
             <p className="text-emerald-700">{ticket.resolutionNotes}</p>
          </div>
        )}
      </div>

      {/* Discussion Section */}
      <div className="glass-card">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-primary"/> Discussion
        </h3>

        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {comment.author.charAt(0)}
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-4">
                 <div className="flex justify-between items-start mb-1">
                   <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                   <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                 </div>
                 <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-center text-sm py-4">No comments yet. Be the first to comment!</p>}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your message..."
              className="input-field resize-none !rounded-t-2xl !rounded-bl-2xl !rounded-br-sm !py-3"
              rows={2}
            />
          </div>
          <button type="submit" disabled={!newComment.trim()} className="btn-primary !mt-0 !h-[56px] !rounded-b-2xl !rounded-tr-sm">
            Post
          </button>
        </form>

      </div>
    </div>
  );
};

export default TicketDetailsPage;

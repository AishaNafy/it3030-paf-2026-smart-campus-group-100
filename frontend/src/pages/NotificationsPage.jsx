import React, { useState, useEffect } from 'react';
import { Bell, Clock, Inbox, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?size=50${filter === 'unread' ? '&onlyUnread=true' : ''}`);
      setNotifications(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSec = Math.floor((now - date) / 1000);
    
    if (diffInSec < 60) return 'Just now';
    if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
    if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
    return `${Math.floor(diffInSec / 86400)}d ago`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="text-teal-600" size={32} />
            Your Notifications
          </h1>
          <p className="text-gray-500 mt-2">Stay updated with your tickets and facility bookings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-teal-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-teal-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Unread
            </button>
          </div>
          
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <CheckCircle2 size={16} className="text-teal-600" />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Fetching notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <Inbox size={40} className="text-gray-200" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All caught up!</h3>
              <p className="text-gray-500 mt-1">You don't have any {filter === 'unread' ? 'unread' : ''} notifications right now.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={`p-6 transition-all relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${!n.read ? 'bg-teal-50/20 border-l-4 border-l-teal-500' : 'hover:bg-gray-50'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      n.referenceType === 'TICKET' ? 'bg-blue-100 text-blue-700' : 
                      n.referenceType === 'BOOKING' ? 'bg-purple-100 text-purple-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {n.referenceType}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-1 ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${!n.read ? 'text-gray-700' : 'text-gray-500'}`}>
                    {n.message}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  {!n.read && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 transition-colors uppercase tracking-wide"
                    >
                      Mark Read
                    </button>
                  )}
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

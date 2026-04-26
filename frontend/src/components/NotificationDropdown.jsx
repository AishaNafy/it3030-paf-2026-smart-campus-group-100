import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Inbox, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?size=5');
      const data = res.data.content || [];
      console.log('Fetched notifications:', data); // Debug log
      setNotifications(data);
      
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative group"
      >
        <Bell size={20} className={`transition-colors ${unreadCount > 0 ? 'text-teal-600' : 'text-gray-500'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <h3 className="font-bold text-gray-800 text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px]">
                  {unreadCount} New
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-xs">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <Inbox size={32} className="text-gray-200" />
                <p className="text-gray-400 text-xs">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-teal-50/30' : ''}`}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className={`font-bold text-[13px] ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {n.title || 'Notification'}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                        <Clock size={10} /> {getTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed mb-2 ${!n.read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider">
                        {n.referenceType}
                      </span>
                      {!n.read && (
                        <span className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5">
                          New <ChevronRight size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate(window.location.pathname.startsWith('/admin') ? '/admin/notifications' : '/student/notifications');
              }}
              className="text-xs text-teal-600 font-semibold hover:text-teal-800"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

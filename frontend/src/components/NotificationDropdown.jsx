import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, Inbox, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?size=5');
      setNotifications(res.data.content || []);
      
      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data);
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
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getTimeAgo = (dateStr) => {
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
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px]">
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

          <div className="max-h-[350px] overflow-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-xs animate-pulse">
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
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-teal-50/30' : ''}`}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-800 text-[13px]">{n.title}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {getTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">
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
            <button className="text-xs text-gray-500 font-medium hover:text-teal-600">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

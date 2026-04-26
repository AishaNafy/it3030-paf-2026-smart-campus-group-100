import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TicketPlus, 
  List, 
  User, 
  CalendarPlus, 
  CalendarDays, 
  Settings2, 
  Building, 
  LogOut, 
  Bell 
} from 'lucide-react';
import api from '../api/axiosConfig';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    navigate('/login');
  };

  const navItems = [
    // --- Student View ---
    { path: `/student`, label: 'My Tickets', icon: <List size={20} />, roles: ['student'] },
    { path: `/student/create`, label: 'New Ticket', icon: <TicketPlus size={20} />, roles: ['student'] },
    { path: `/student/book`, label: 'New Booking', icon: <CalendarPlus size={20} />, roles: ['student'] },
    { path: `/student/my-bookings`, label: 'My Bookings', icon: <CalendarDays size={20} />, roles: ['student'] },
    { path: `/student/facilities`, label: 'Facilities', icon: <Building size={20} />, roles: ['student'] },
    
    // --- Technician View ---
    { path: `/technician`, label: 'Tech Dashboard', icon: <User size={20} />, roles: ['technician'] },
    
    // --- Admin View ---
    { path: `/admin`, label: 'Admin Dashboard', icon: <List size={20} />, roles: ['admin'] },
    { path: `/admin/reports`, label: 'Reports', icon: <LayoutDashboard size={20} />, roles: ['admin'] },
    { path: `/admin/manage-bookings`, label: 'Manage Bookings', icon: <Settings2 size={20} />, roles: ['admin'] },
    { path: `/admin/users`, label: 'User Management', icon: <User size={20} />, roles: ['admin'] },
    { path: `/admin/facilities`, label: 'Facilities', icon: <Building size={20} />, roles: ['admin'] },
  ];

  const currentNavItem = navItems.find(item => 
    location.pathname === item.path || 
    (item.path !== `/${role}` && location.pathname.startsWith(item.path))
  );

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-white/50 backdrop-blur-xl border-r border-teal-100 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-teal-100">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <LayoutDashboard size={24} />
            Smart Campus
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.filter(item => item.roles.includes(role)).map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== `/${role}` && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-teal-50 hover:text-primary'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-8 z-10 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentNavItem?.label || 'Smart Campus'}
          </h2>
          <div className="flex items-center gap-5">
            <NotificationDropdown />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {role ? role.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium text-gray-600 capitalize">{role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-50 z-0"></div>
          <div className="relative z-10 h-full max-w-6xl mx-auto">
             <Outlet context={{ role }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
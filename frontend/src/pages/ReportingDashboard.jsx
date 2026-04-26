import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const ReportingDashboard = () => {
  const { role } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        // Backend returns: { ticketsByStatus: [...], ticketsByPriority: [...], ticketsByCategory: [...] }
        setStats(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (role?.toUpperCase() !== 'ADMIN') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admin Role Required.</div>;
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading charts...</div>;
  if (!stats) return <div className="p-12 text-center text-red-500">Failed to load reports.</div>;

  const statusColors = ['#14b8a6', '#f59e0b', '#3b82f6', '#9ca3af']; // teal, amber, blue, gray
  const priorityColors = ['#ef4444', '#f97316', '#eab308', '#22c55e']; // red, orange, yellow, green
  const categoryColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981']; // purple, pink, cyan, emerald

  const formattedStatusData = stats.ticketsByStatus.map(item => ({ name: item._id || 'Unknown', value: item.count }));
  const formattedPriorityData = stats.ticketsByPriority.map(item => ({ name: item._id || 'Unknown', value: item.count }));
  const formattedCategoryData = stats.ticketsByCategory.map(item => ({ name: item._id || 'Unknown', value: item.count }));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Reporting Dashboard</h2>
        <p className="text-gray-500 text-sm">Overview of system incident reports and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Chart */}
        <div className="glass-card shadow-sm col-span-1 border border-teal-100/50">
          <h3 className="font-semibold text-gray-700 mb-4 text-center">Tickets by Status</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={formattedStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                    {formattedStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Legend iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="glass-card shadow-sm col-span-1 border border-teal-100/50">
          <h3 className="font-semibold text-gray-700 mb-4 text-center">Tickets by Priority</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={formattedPriorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                    {formattedPriorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={priorityColors[index % priorityColors.length]} />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Legend iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart (Bar) */}
        <div className="glass-card shadow-sm col-span-1 md:col-span-2 lg:col-span-1 border border-teal-100/50">
          <h3 className="font-semibold text-gray-700 mb-4 text-center">Tickets by Category</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCategoryData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="name" tick={{fontSize: 12}} />
                   <YAxis tick={{fontSize: 12}} allowDecimals={false} />
                   <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                     {formattedCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />)}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportingDashboard;

import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Building, Edit, Plus } from 'lucide-react';
import api from '../api/axiosConfig';

const FacilityListPage = () => {
  const { role } = useOutletContext();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/facilities');
      let data = response.data;
      
      // Client-side filtering since backend doesn't have it yet
      if (statusFilter) {
        data = data.filter(f => f.status === statusFilter);
      }
      if (typeFilter) {
        data = data.filter(f => f.type === typeFilter);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(f => 
          (f.name && f.name.toLowerCase().includes(query)) || 
          (f.location && f.location.toLowerCase().includes(query))
        );
      }
      if (minCapacity) {
        data = data.filter(f => f.capacity >= parseInt(minCapacity, 10));
      }
      
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, searchQuery, minCapacity]);

  // Utility for status colors
  const statusColor = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'OUT_OF_SERVICE': 'bg-red-100 text-red-800',
    'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Bar with Filters */}
      <div className="glass-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building size={20} className="text-primary"/> Facilities Catalogue
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto flex-1 ml-0 md:ml-8">
           <input 
             type="text" 
             placeholder="Search name or location..." 
             className="input-field text-sm !mt-0 w-full"
             value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
           />
           
           <input 
             type="number" 
             placeholder="Min Capacity" 
             className="input-field text-sm !mt-0 w-full"
             value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}
             min="0"
           />

           <select 
             className="input-field text-sm !mt-0 w-full"
             value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="">All Statuses</option>
             <option value="ACTIVE">Active</option>
             <option value="OUT_OF_SERVICE">Out of Service</option>
             <option value="MAINTENANCE">Maintenance</option>
           </select>

           <div className="flex gap-2">
             <select 
               className="input-field text-sm !mt-0 w-full"
               value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="">All Types</option>
               <option value="Lecture Hall">Lecture Hall</option>
               <option value="Lab">Lab</option>
               <option value="Meeting Room">Meeting Room</option>
               <option value="Equipment">Equipment</option>
               <option value="Sports Facility">Sports Facility</option>
             </select>
             
             <Link to={`/${role}/facilities/create`} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap px-4 shrink-0">
               <Plus size={16} /> Add Resource
             </Link>
           </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="glass-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/40 divide-y divide-gray-100 backdrop-blur-sm">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading facilities...</td></tr>
              ) : facilities.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No facilities found.</td></tr>
              ) : (
                facilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-primary/5 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{facility.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.capacity > 0 ? `${facility.capacity} pax` : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.availabilityWindows || 'Anytime'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor[facility.status] || 'bg-gray-100 text-gray-800'}`}>
                        {facility.status ? facility.status.replace(/_/g, ' ') : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`${role === 'admin' ? '/admin' : '/student'}/facilities/${facility.id}`} className="text-primary hover:text-teal-700 flex items-center gap-1">
                        <Edit size={16} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacilityListPage;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react';
import CreateUserModal from '../components/CreateUserModal';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between transition-colors">
    <div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${colorClass.includes('bg-') ? colorClass : 'bg-slate-100 text-slate-600'}`}>
      <Icon size={24} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/users')
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchData(); // Refresh the list
      } catch (error) {
        alert("Failed to delete user. They might have assigned tasks.");
      }
    }
  };

  const handleEditRole = async (user) => {
    const newRole = window.prompt(`Enter new role for ${user.name} (ADMIN, MANAGER, EMPLOYEE):`, user.role);
    if (newRole && ['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(newRole.toUpperCase())) {
      try {
        await api.put(`/users/${user.id}/role`, { role: newRole.toUpperCase() });
        fetchData(); // Refresh the list
      } catch (error) {
        alert("Failed to update user role.");
      }
    } else if (newRole) {
      alert("Invalid role. Must be ADMIN, MANAGER, or EMPLOYEE.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-200 rounded"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-inter text-slate-900 dark:text-white">System Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor all users and global tasks in the system.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Total Tasks" value={metrics.totalTasks} icon={CheckSquare} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="Completed" value={metrics.completedTasks} icon={CheckSquare} colorClass="bg-green-50 text-green-600" />
        <StatCard title="Pending" value={metrics.pendingTasks} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Overdue" value={metrics.overdueTasks} icon={AlertCircle} colorClass="bg-red-50 text-red-600" />
        <StatCard title="Efficiency" value={`${metrics.efficiencyScore || 0}%`} icon={CheckSquare} colorClass="bg-purple-50 text-purple-600" />
        <StatCard title="Adherence" value={`${metrics.deadlineAdherencePct || 0}%`} icon={Clock} colorClass="bg-teal-50 text-teal-600" />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-primary-500" />
            User Management
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm">
            <Plus size={16} /> New User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {Array.isArray(users) && users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                      {(user.name || '?').charAt(0).toUpperCase()}
                    </div>
                    {user.name || 'Unnamed User'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      user.role === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEditRole(user)}
                      className="text-primary-600 hover:text-primary-500 hover:underline font-medium text-sm transition-colors"
                    >
                      Edit Role
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-500 hover:text-red-400 hover:underline font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!Array.isArray(users) || users.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-transparent">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUserCreated={fetchData} 
      />
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users as UsersIcon, Plus, Shield, UserMinus } from 'lucide-react';
import CreateUserModal from '../components/CreateUserModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchUsers();
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
        fetchUsers();
      } catch (error) {
        alert("Failed to update user role.");
      }
    } else if (newRole) {
      alert("Invalid role. Must be ADMIN, MANAGER, or EMPLOYEE.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="animate-pulse p-6 text-white text-center">Loading User Management...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UsersIcon size={28} className="text-blue-500" />
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage system access and roles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-primary-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 shadow-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      user.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => handleEditRole(user)}
                      className="text-primary-600 dark:text-blue-400 hover:text-primary-700 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1 inline-flex transition-colors"
                    >
                      <Shield size={14} /> Edit Role
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs font-bold flex items-center gap-1 inline-flex transition-colors"
                      >
                        <UserMinus size={14} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUserCreated={fetchUsers} 
      />
    </div>
  );
};

export default Users;

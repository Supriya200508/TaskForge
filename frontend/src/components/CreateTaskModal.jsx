import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dependencyIds, setDependencyIds] = useState([]);
  
  const [employees, setEmployees] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      const fetchData = async () => {
        try {
          // Dynamic endpoints based on role
          const userUrl = currentUser.role === 'ADMIN' ? '/users' : '/users/role/EMPLOYEE';
          const taskUrl = currentUser.role === 'ADMIN' ? '/tasks' : '/tasks/my-tasks';

          const [usersRes, tasksRes] = await Promise.all([
            api.get(userUrl),
            api.get(taskUrl)
          ]);

          // Handle Users (Frontend filter if ADMIN, or use direct list)
          const userData = usersRes.data.content ? usersRes.data.content : usersRes.data;
          const filteredEmployees = currentUser.role === 'ADMIN' 
            ? userData.filter(u => u.role === 'EMPLOYEE' || u.role === 'MANAGER')
            : userData;
          setEmployees(filteredEmployees);

          // Handle Tasks
          setAvailableTasks(tasksRes.data.content ? tasksRes.data.content : tasksRes.data);
        } catch (error) {
          console.error("Failed to load modal data", error);
        }
      };
      fetchData();
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newTask = {
        title,
        description,
        priority,
        deadline: deadline || null,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        dependencyIds: dependencyIds.map(id => parseInt(id))
      };
      await api.post('/tasks', newTask);
      onTaskCreated();
      onClose();
      // Reset form
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setDeadline(''); setAssignedToId(''); setDependencyIds([]);
    } catch (error) {
      console.error("Failed to create task", error);
      alert("Error creating task");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDependencyChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setDependencyIds(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title <span className="text-red-500">*</span></label>
            <input 
              required
              type="text" 
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 dark:text-white transition"
              placeholder="e.g., Update Login Page UI"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 dark:text-white transition min-h-[80px]"
              placeholder="Task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 dark:text-white transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
              <input 
                type="date" 
                value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 dark:text-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
            <select 
              value={assignedToId} onChange={e => setAssignedToId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 dark:text-white transition"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Dependencies (Hold Ctrl to select multiple)</label>
            <select 
              multiple
              value={dependencyIds} onChange={handleDependencyChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 dark:text-white transition h-24"
            >
              {availableTasks && availableTasks.length > 0 ? availableTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.status})
                </option>
              )) : (
                <option disabled>No tasks available</option>
              )}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dependent tasks must be COMPLETED before this task can be marked as COMPLETED.
            </p>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700 mt-4">
            <button 
              type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;

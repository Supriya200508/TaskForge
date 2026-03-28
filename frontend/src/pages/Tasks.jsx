import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Clock, AlertCircle, Plus, Filter, Search, Calendar, MessageCircle, Activity } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCommentsModal from '../components/TaskCommentsModal';
import TaskAuditLogModal from '../components/TaskAuditLogModal';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentsTaskId, setCommentsTaskId] = useState(null);
  const [auditLogTaskId, setAuditLogTaskId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchTasks = async () => {
    try {
      // Logic: Admin/Manager can see more, but /tasks/my-tasks might be sufficient if backend handles roles
      // For now, let's use /tasks/my-tasks as it seems to be the main endpoint for user-relevant tasks
      const response = await api.get('/tasks/my-tasks');
      const data = response.data?.content ? response.data.content : response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Status update failed. Check constraints.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  if (loading) return <div className="animate-pulse p-6 text-white text-center">Loading Tasks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare size={28} className="text-emerald-500" />
            Task Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and update progress of all assigned tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === f ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {f === 'IN_PROGRESS' ? 'WIP' : f}
              </button>
            ))}
          </div>
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <Plus size={18} /> New Task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length > 0 ? filteredTasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-primary-200 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 group shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  task.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20' :
                  task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20' :
                  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20'
                }`}>
                  {task.priority || 'NORMAL'}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  task.status === 'COMPLETED' ? 'bg-emerald-500' : 
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-400'
                }`}></span>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">{task.title}</h3>
              </div>
              <p className="text-sm text-slate-400 line-clamp-1 mb-3">{task.description || 'No description provided'}</p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-600" />
                  Due: {task.deadline || 'Flexible'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-slate-600" />
                  Assignee: {task.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50">
               <button 
                onClick={() => setAuditLogTaskId(task.id)}
                className="p-2 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                title="Audit Log"
              >
                <Activity size={18} />
              </button>
              <button 
                onClick={() => setCommentsTaskId(task.id)}
                className="p-2 text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                title="Comments"
              >
                <MessageCircle size={18} />
              </button>
              
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <select 
                value={task.status} 
                onChange={(e) => updateStatus(task.id, e.target.value)}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer shadow-sm transition-all ${
                  task.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-500 border-emerald-500/30' : 
                  task.status === 'IN_PROGRESS' ? 'text-primary-600 dark:text-primary-500 border-primary-500/30' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 text-slate-500">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No tasks found in this category.</p>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={fetchTasks} 
      />
      
      <TaskCommentsModal 
        isOpen={!!commentsTaskId} 
        onClose={() => setCommentsTaskId(null)} 
        taskId={commentsTaskId} 
        currentUser={user} 
      />
      
      <TaskAuditLogModal
        isOpen={!!auditLogTaskId}
        onClose={() => setAuditLogTaskId(null)}
        taskId={auditLogTaskId}
      />
    </div>
  );
};

export default Tasks;

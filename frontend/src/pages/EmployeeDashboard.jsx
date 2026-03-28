import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, ListTodo, Clock, CheckCircle2, MessageCircle, Activity } from 'lucide-react';
import TaskCommentsModal from '../components/TaskCommentsModal';
import TaskAuditLogModal from '../components/TaskAuditLogModal';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsTaskId, setCommentsTaskId] = useState(null);
  const [auditLogTaskId, setAuditLogTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        setTasks(response.data?.content ? response.data.content : response.data);
      } catch (error) {
        console.error("Failed to fetch assigned tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const todoTasks = safeTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = safeTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = safeTasks.filter(t => t.status === 'COMPLETED');

  if (loading) return <div className="animate-pulse p-4">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-inter text-slate-900 dark:text-white">Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here is the status of your assigned tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TODO Column */}
        <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[500px] transition-colors">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ListTodo size={18} className="text-slate-500 dark:text-slate-400" />
              To Do
            </h3>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full">{todoTasks.length}</span>
          </div>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onCommentClick={() => setCommentsTaskId(task.id)} onActivityClick={() => setAuditLogTaskId(task.id)} />
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 min-h-[500px] transition-colors">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <Clock size={18} className="text-blue-500 dark:text-blue-400" />
              In Progress
            </h3>
            <span className="bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">{inProgressTasks.length}</span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onCommentClick={() => setCommentsTaskId(task.id)} onActivityClick={() => setAuditLogTaskId(task.id)} />
            ))}
          </div>
        </div>

        {/* COMPLETED Column */}
        <div className="bg-green-50/30 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/50 min-h-[500px] transition-colors">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500 dark:text-green-400" />
              Completed
            </h3>
            <span className="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full">{completedTasks.length}</span>
          </div>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onCommentClick={() => setCommentsTaskId(task.id)} onActivityClick={() => setAuditLogTaskId(task.id)} />
            ))}
          </div>
        </div>

      </div>
      
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

// Internal Component for Employee
const TaskCard = ({ task, onStatusChange, onCommentClick, onActivityClick }) => {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border ${isOverdue ? 'border-red-500 dark:border-red-500 shadow-red-500/10' : 'border-slate-200 dark:border-slate-700'} hover:shadow-md transition duration-200 group relative`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
          task.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50' :
          task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' :
          'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
        }`}>
          {task.priority}
        </span>
        {isOverdue && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-300 animate-pulse">
              OVERDUE
            </span>
        )}
      </div>
      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-4">
        <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${isOverdue ? 'text-red-600 bg-red-50' : 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50'}`}>
          <Calendar size={12} />
          {task.deadline || 'No Date'}
        </span>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onActivityClick}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
            title="View Activity Log"
          >
            <Activity size={16} />
          </button>
          <button 
            onClick={onCommentClick}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
          >
            <MessageCircle size={16} />
          </button>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <select 
            className="text-xs font-semibold bg-transparent dark:bg-slate-900 border-none text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer outline-none"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">WIP</option>
            <option value="COMPLETED">Done</option>
          </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

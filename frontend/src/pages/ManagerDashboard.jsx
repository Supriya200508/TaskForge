import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, CheckSquare, Clock, AlertCircle, Plus, Calendar, MessageCircle, Activity } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCommentsModal from '../components/TaskCommentsModal';
import TaskAuditLogModal from '../components/TaskAuditLogModal';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
// ... (I need to replace the imports correctly and the state, let's target specific lines instead of the whole)
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between transition-colors">
    <div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsTaskId, setCommentsTaskId] = useState(null);
  const [auditLogTaskId, setAuditLogTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [metricsRes, tasksRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/tasks/my-tasks')
      ]);
      setMetrics(metricsRes.data);
      setTasks(tasksRes.data?.content ? tasksRes.data.content : tasksRes.data);
    } catch (error) {
      console.error("Failed to fetch manager data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold font-inter text-slate-900 dark:text-white">Manager Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your team's tasks and performance metrics.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-primary-500/20">
          <Plus size={18} /> Create Task
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Total Created" value={metrics.totalTasks} icon={Target} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="Completed" value={metrics.completedTasks} icon={CheckSquare} colorClass="bg-green-50 text-green-600" />
        <StatCard title="In Progress" value={metrics.pendingTasks} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Overdue" value={metrics.overdueTasks} icon={AlertCircle} colorClass="bg-red-50 text-red-600" />
        <StatCard title="Efficiency" value={`${metrics.efficiencyScore || 0}%`} icon={CheckSquare} colorClass="bg-purple-50 text-purple-600" />
        <StatCard title="Adherence" value={`${metrics.deadlineAdherencePct || 0}%`} icon={Clock} colorClass="bg-teal-50 text-teal-600" />
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recently Assigned Tasks</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.isArray(tasks) && tasks.length > 0 ? tasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all flex justify-between items-center group bg-white dark:bg-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-green-500' : 
                        task.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-300'
                      }`}></div>
                      {(task.status || '').replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {task.deadline || 'No deadline'}
                    </span>
                    <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                    task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {task.priority}
                  </span>
                  <button 
                    onClick={() => setAuditLogTaskId(task.id)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                    title="View Activity Log"
                  >
                    <Activity size={16} />
                  </button>
                  <button 
                    onClick={() => setCommentsTaskId(task.id)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                You haven't created any tasks yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={fetchData} 
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

export default ManagerDashboard;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Activity } from 'lucide-react';

const TaskAuditLogModal = ({ isOpen, onClose, taskId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !taskId) return;
    
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/audit-logs/tasks/${taskId}`);
        setLogs(res.data);
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity size={20} className="text-primary-500" />
            Task Activity Log
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/20">
          {loading ? (
            <div className="text-center text-slate-500 animate-pulse">Loading activity logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400">No activity recorded for this task.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
              {logs.map((log, idx) => (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-primary-500"></span>
                  
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        log.action.includes('CREATED') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        log.action.includes('STATUS') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        log.action.includes('ASSIGN') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                      }`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{log.details}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                      By: <span className="text-slate-600 dark:text-slate-400">{log.user?.name || 'Unknown User'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskAuditLogModal;

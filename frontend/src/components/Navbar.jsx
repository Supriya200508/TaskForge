import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, LogOut, Menu, Bell, Sun, Moon, Check } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ user }) => {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 transition-colors duration-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu button could go here */}
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white md:hidden">TaskForge</h2>
        </div>

        <div className="flex items-center justify-end w-full gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-500 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="relative mr-4">
            <button 
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (dropdownOpen) setDropdownOpen(false);
              }}
              className="p-2 text-slate-400 hover:text-slate-500 dark:text-slate-300 dark:hover:text-white relative transition-colors"
            >
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <Bell size={20} />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      You're all caught up!
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                        onClick={() => !n.read && markAsRead(n.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${!n.read ? 'bg-primary-500 shadow-sm shadow-primary-500/50' : 'bg-transparent'}`}></div>
                          <div>
                            <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 uppercase font-bold tracking-wide">
                              {new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                if (notifOpen) setNotifOpen(false);
              }}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{user?.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800 shadow-sm">
                {(user?.name?.charAt(0) || 'U').toUpperCase()}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700 z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 md:hidden">
                  <p className="text-sm text-slate-900 dark:text-white font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">{user?.role}</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

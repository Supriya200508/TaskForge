import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Menu
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const role = user?.role;

  // 🔥 Determine base path dynamically
  const basePath =
    role === "ADMIN"
      ? "/admin"
      : role === "MANAGER"
      ? "/manager"
      : "/employee";

  // 🔥 Menu configuration
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: `${basePath}/dashboard`
    },
    {
      name: "Tasks",
      icon: CheckSquare,
      path: `${basePath}/tasks`
    },
    {
      name: "Users",
      icon: Users,
      path: `${basePath}/users`,
      roles: ["ADMIN"] // only visible to admin
    }
  ];

  return (
    <div
      className={`h-screen bg-white dark:bg-[#0f172a] text-slate-600 dark:text-white border-r border-slate-200 dark:border-gray-700 transition-all duration-300
      ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* Header */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 border-b border-slate-200 dark:border-gray-700`}>
        {!collapsed && <h1 className="text-xl font-bold tracking-tight text-primary-600 dark:text-white">TaskForge</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {menuItems.map((item, index) => {
          // 🔥 Role-based visibility
          if (item.roles && !item.roles.includes(role)) return null;

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? "justify-center px-0" : "gap-3 p-3"} mx-2 rounded-lg transition-all h-11 
                ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700"
                }`
              }
            >
              <item.icon size={20} className={collapsed ? "" : "min-w-[20px]"} />
              {!collapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
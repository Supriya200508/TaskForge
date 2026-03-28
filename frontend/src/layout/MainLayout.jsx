import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - Full Length from top to bottom */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar - Sits beside the sidebar at the top */}
        <Navbar user={user} />
        
        {/* Page Content - Independent scroll area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 text-slate-800 dark:text-white transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image as ImageIcon, 
  Megaphone, 
  Mail, 
  FileText, 
  CreditCard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
  Shield,
  HelpCircle
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, currentPath, title }) => {
  const isActive = currentPath === to;
  return (
    <Link 
      to={to} 
      title={title}
      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
        isActive 
          ? 'bg-white/20 text-white shadow-lg' 
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6" />
    </Link>
  );
};

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0f1c] text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-20 bg-brand-500 dark:bg-[#38bdf8] flex flex-col items-center py-6 shadow-2xl relative z-20 h-full rounded-r-3xl">
        <Link to="/dashboard" className="mb-8" title="AI Chatbot">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </Link>
        
        <nav className="flex-1 flex flex-col items-center gap-1 w-full">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} currentPath={location.pathname} title="Dashboard" />
          <SidebarLink to="/dashboard/social" icon={MessageSquare} currentPath={location.pathname} title="Social Media" />
          <SidebarLink to="/dashboard/ads" icon={Megaphone} currentPath={location.pathname} title="Ad Copy" />
          <SidebarLink to="/dashboard/email" icon={Mail} currentPath={location.pathname} title="Email Campaigns" />
          <SidebarLink to="/dashboard/seo" icon={FileText} currentPath={location.pathname} title="SEO Articles" />
          <SidebarLink to="/dashboard/banner" icon={ImageIcon} currentPath={location.pathname} title="Banner Generator" />
        </nav>

        <div className="mt-auto flex flex-col gap-1 w-full items-center">
          <button 
            onClick={logout}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
            title="Sign Out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-gradient-to-r dark:from-brand-600/10 dark:to-transparent relative z-10 rounded-t-3xl mt-4 mr-4 backdrop-blur-md border-b border-gray-200 dark:border-transparent">
          <div className="flex-1 max-w-2xl relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              className="w-full bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white pl-12 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4 ml-6 relative">
            
            {/* Settings */}
            <div className="relative">
              <button 
                onClick={() => { setShowSettingsDropdown(!showSettingsDropdown); }}
                className="p-2.5 rounded-full bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showSettingsDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <User className="w-4 h-4" /> Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Shield className="w-4 h-4" /> Security
                      </button>
                      <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <HelpCircle className="w-4 h-4" /> Help Center
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white font-bold cursor-pointer shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 relative z-0 mt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

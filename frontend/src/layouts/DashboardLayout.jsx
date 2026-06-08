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
  HelpCircle,
  Menu,
  X
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
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => window.innerWidth < 768);
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0f1c] text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Mobile overlay backdrop */}
      {!isSidebarHidden && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-10 backdrop-blur-sm"
          onClick={() => setIsSidebarHidden(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-brand-500 dark:bg-[#38bdf8] flex flex-col items-center py-6 shadow-2xl z-20 h-full rounded-r-3xl transition-all duration-300 md:relative absolute md:left-auto left-0 md:top-auto top-0 md:bottom-auto bottom-0 md:h-full h-screen ${
        isSidebarHidden ? 'w-0 overflow-hidden opacity-0 pointer-events-none' : 'w-20'
      }`}>
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
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white/50 dark:bg-gradient-to-r dark:from-brand-600/10 dark:to-transparent relative z-10 rounded-t-3xl md:mt-4 md:mr-4 backdrop-blur-md border-b border-gray-200 dark:border-transparent gap-4">
          <button
            onClick={() => setIsSidebarHidden(!isSidebarHidden)}
            className="p-2.5 rounded-full bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm flex items-center justify-center shrink-0"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block flex-1 max-w-2xl relative">
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
                      <button 
                        onClick={() => { setActiveModal('profile'); setShowSettingsDropdown(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile Settings
                      </button>
                      <button 
                        onClick={() => { setActiveModal('security'); setShowSettingsDropdown(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Security
                      </button>
                      <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
                      <button 
                        onClick={() => { setActiveModal('help'); setShowSettingsDropdown(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" /> Help Center
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div 
              onClick={() => setActiveModal('profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:scale-105 transition-transform"
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 relative z-0 mt-4">
          <Outlet />
        </div>
      </main>

      {/* Interactive Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 relative overflow-hidden text-gray-900 dark:text-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading capitalize flex items-center gap-2">
                  {activeModal === 'profile' && <User className="w-5 h-5 text-brand-500" />}
                  {activeModal === 'security' && <Shield className="w-5 h-5 text-brand-500" />}
                  {activeModal === 'help' && <HelpCircle className="w-5 h-5 text-brand-500" />}
                  {activeModal} Settings
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Modal View */}
              {activeModal === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user?.name || 'Guest User'}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'guest@forgeai.com'}</p>
                      <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        Pro Tier Member
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name || 'Guest User'} 
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email || 'guest@forgeai.com'} 
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none text-sm"
                        disabled
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => { alert('Profile successfully saved!'); setActiveModal(null); }}
                    className="w-full mt-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-brand-500/10"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* Security Modal View */}
              {activeModal === 'security' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-950 text-blue-700 dark:text-blue-400 text-xs leading-normal">
                    <Shield className="w-5 h-5 shrink-0" />
                    <span>Two-Factor Authentication is currently recommended to protect your generation limits.</span>
                  </div>
                  <button 
                    onClick={() => { alert('Password updated successfully!'); setActiveModal(null); }}
                    className="w-full mt-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-brand-500/10"
                  >
                    Update Password
                  </button>
                </div>
              )}

              {/* Help Center Modal View */}
              {activeModal === 'help' && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Frequently Asked Questions & Support resources.</p>
                  <div className="space-y-3">
                    <details className="group border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/20">
                      <summary className="font-semibold text-sm cursor-pointer list-none flex justify-between items-center">
                        How do I generate SEO content?
                        <span className="transition group-open:rotate-180 text-gray-400">▾</span>
                      </summary>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                        Go to the SEO Articles tab on the sidebar. Select a target keyword, enter your niche/industry, select your word count, and click Generate!
                      </p>
                    </details>

                    <details className="group border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/20">
                      <summary className="font-semibold text-sm cursor-pointer list-none flex justify-between items-center">
                        Is there a generation limit?
                        <span className="transition group-open:rotate-180 text-gray-400">▾</span>
                      </summary>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                        Free tiers can generate up to 20 content campaigns per month. Pro and Enterprise accounts have unlimited content generations.
                      </p>
                    </details>

                    <details className="group border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/20">
                      <summary className="font-semibold text-sm cursor-pointer list-none flex justify-between items-center">
                        How to reset password/access details?
                        <span className="transition group-open:rotate-180 text-gray-400">▾</span>
                      </summary>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                        You can update your login password in the Security settings panel. For email changes, please contact support.
                      </p>
                    </details>
                  </div>
                  <div className="p-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center mt-4">
                    <p className="text-xs text-gray-500 mb-2">Need human assistance?</p>
                    <a 
                      href="mailto:support@forgeai.com"
                      className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Email support@forgeai.com
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Transition from './pages/Transition';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import SocialMedia from './pages/tools/SocialMedia';
import AdCopy from './pages/tools/AdCopy';
import EmailCampaign from './pages/tools/EmailCampaign';
import SEOContent from './pages/tools/SEOContent';
import BannerGenerator from './pages/tools/BannerGenerator';
import ContentHistory from './pages/ContentHistory';
import { useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function App() {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darker text-gray-900 dark:text-gray-100 font-sans relative">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="social" element={<SocialMedia />} />
          <Route path="ads" element={<AdCopy />} />
          <Route path="email" element={<EmailCampaign />} />
          <Route path="seo" element={<SEOContent />} />
          <Route path="banner" element={<BannerGenerator />} />
          <Route path="history" element={<ContentHistory />} />
        </Route>
        <Route path="/transition" element={<Transition />} />
        <Route path="/" element={<Landing />} />
      </Routes>

      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-xl shadow-brand-500/20 hover:scale-110 transition-all z-50 flex items-center justify-center group"
        aria-label="Toggle Theme"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </div>
  );
}

export default App;

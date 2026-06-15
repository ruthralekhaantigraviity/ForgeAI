import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, KeyRound } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Password reset states
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: resetEmail,
        newPassword,
      });
      setResetMessage(data.message || 'Password reset successfully. You can now log in.');
      setNewPassword('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-darker relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-brand-dark/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-accent rounded-xl flex items-center justify-center shadow-lg">
            {showReset ? (
              <KeyRound className="text-white w-6 h-6" />
            ) : (
              <LogIn className="text-white w-6 h-6" />
            )}
          </div>
        </div>

        {!showReset ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Sign in to your Forge AI account</p>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="you@company.com"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">
                  <input type="checkbox" className="mr-2 rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-brand-500 focus:ring-brand-500" />
                  Remember me
                </label>
                <button 
                  type="button"
                  onClick={() => { setShowReset(true); setError(''); }}
                  className="text-brand-500 hover:text-brand-400 transition-colors font-medium bg-transparent border-none outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <button 
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-medium shadow-lg hover:shadow-brand-500/25 transition-all duration-200"
              >
                Sign In
              </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account? <Link to="/register" className="text-brand-500 hover:text-brand-400 font-medium transition-colors">Create one</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Reset Password</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Enter your registered email and a new password</p>

            {resetError && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{resetError}</div>}
            {resetMessage && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 text-sm text-center">{resetMessage}</div>}

            <form onSubmit={handleResetSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="you@company.com"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-medium shadow-lg hover:shadow-brand-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Remembered your password?{' '}
              <button 
                onClick={() => { setShowReset(false); setResetError(''); setResetMessage(''); }} 
                className="text-brand-500 hover:text-brand-400 font-medium transition-colors bg-transparent border-none outline-none cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Login;


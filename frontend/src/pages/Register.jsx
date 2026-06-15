import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-darker relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-brand-dark/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-500 rounded-xl flex items-center justify-center shadow-lg">
            <UserPlus className="text-white w-6 h-6" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Create Account</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Start your Forge AI journey</p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="you@company.com"
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
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-medium shadow-lg hover:shadow-brand-500/25 transition-all duration-200"
          >
            Create Account
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-400 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

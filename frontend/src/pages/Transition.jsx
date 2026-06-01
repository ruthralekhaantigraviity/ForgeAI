import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Zap } from 'lucide-react';

const Transition = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to dashboard after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-brand-darker flex items-center justify-center overflow-hidden relative">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(167, 139, 250, 0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Animated Rings */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border border-brand-500/10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full border border-brand-400/20"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: [0, 0.8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
      />

      {/* Core AI Processing Node */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative w-32 h-32 mb-8 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {/* Glowing Orb */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-brand-500 rounded-full blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full"></div>
          
          {/* Center Icon */}
          <motion.div 
            className="absolute z-20 text-white"
            animate={{ rotate: -360 }} // Counter-rotate to stay upright
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="w-10 h-10" />
          </motion.div>

          {/* Orbiting Elements */}
          <motion.div className="absolute -top-4 -left-4 text-brand-400">
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <motion.div className="absolute -bottom-4 -right-4 text-brand-500">
            <Zap className="w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Text Animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2 tracking-wide font-heading">
            Initializing AI Workspace
          </h2>
          <div className="flex items-center justify-center gap-1">
            <motion.div
              className="w-2 h-2 bg-brand-400 rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-brand-500 rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-brand-600 rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Laser Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)]"
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default Transition;

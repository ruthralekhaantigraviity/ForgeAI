import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, MessageSquare, Megaphone, Mail, FileText,
  Image as ImageIcon, Zap, Shield, Clock, ArrowRight,
  Check, Star, Crown, ChevronRight
} from 'lucide-react';
import RoboticBackground from '../components/RoboticBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
  <motion.div
    variants={fadeUp}
    custom={delay}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    className="p-6 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-300 dark:border-gray-700 transition-all group shadow-sm dark:shadow-none"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Landing = () => {
  const { loginAsGuest } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStart = () => {
    loginAsGuest();
    navigate('/transition');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darker text-gray-900 dark:text-gray-100 overflow-hidden">

      {/* ───── Navbar ───── */}
      <nav className="relative z-20 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-brand-accent">
          Forge AI
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium">
            Log In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 border border-gray-300 dark:border-gray-700 hover:border-brand-500 text-gray-900 dark:text-white rounded-xl text-sm font-medium transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        {/* Background gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-15 pointer-events-none"></div>
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-accent rounded-full mix-blend-multiply filter blur-[140px] opacity-15 pointer-events-none"></div>

        <RoboticBackground />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600/10 border border-brand-500/20 rounded-full text-brand-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Advanced AI Models
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-gray-900 dark:text-white">AI-Powered</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 dark:from-brand-400 dark:via-brand-500 dark:to-brand-accent">
              Marketing Automation
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate social media posts, ad copy, email campaigns, SEO articles, and marketing banners — all in seconds with the power of AI.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all duration-300 transform hover:-translate-y-1 text-lg flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="px-8 py-4 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl font-medium transition-all text-lg"
            >
              Sign In
            </Link>
          </div>

          
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16"
        >
          {[
            { num: '10K+', label: 'Users' },
            { num: '1M+', label: 'Content Generated' },
            { num: '99%', label: 'Satisfaction' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{s.num}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ───── Features Grid ───── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Scale</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            One platform. Five powerful AI tools. Unlimited creative potential.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={MessageSquare} title="Social Media Posts" desc="Auto-generate captions, hashtags, and CTAs for Instagram, LinkedIn, Twitter, and Facebook." color="bg-purple-400" delay={1} />
          <FeatureCard icon={Megaphone} title="Ad Copy Generator" desc="Create high-converting ad copy for Facebook, Google, and Meta campaigns in one click." color="bg-purple-500" delay={2} />
          <FeatureCard icon={Mail} title="Email Campaigns" desc="Write professional newsletters, sales emails, welcome sequences, and re-engagement flows." color="bg-green-500" delay={3} />
          <FeatureCard icon={FileText} title="SEO Content Writer" desc="Generate SEO-optimized blog posts, articles, and landing page copy targeting your keywords." color="bg-orange-500" delay={4} />
          <FeatureCard icon={ImageIcon} title="Banner Generator" desc="Design stunning marketing banners for any platform with AI-powered gradient designs." color="bg-pink-500" delay={5} />
          <FeatureCard icon={Clock} title="Content History" desc="All your generated content is saved and searchable — copy, reuse, or refine anytime." color="bg-cyan-500" delay={6} />
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Three simple steps to marketing magic.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Choose a Tool', desc: 'Select from social media, ad copy, email, SEO, or banner generators.' },
            { step: '02', title: 'Describe Your Needs', desc: 'Enter your topic, tone, audience, and preferences into the form.' },
            { step: '03', title: 'Get AI Results', desc: 'Receive polished, professional content in seconds — copy, download, or regenerate.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              variants={fadeUp}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-accent/20 border border-brand-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-brand-400">{item.step}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ───── CTA ───── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-brand-900/50 to-brand-dark border border-brand-500/20 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-500 rounded-full filter blur-[120px] opacity-10 pointer-events-none"></div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto relative z-10">
            Join 10,000+ businesses already using Forge AI to create content 10x faster.
          </p>
          <button
            onClick={handleStart}
            className="relative z-10 px-10 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all duration-300 transform hover:-translate-y-1 text-lg flex items-center gap-2 mx-auto"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-4">Forge AI</h4>
              <p className="text-gray-500 text-sm leading-relaxed">AI-powered marketing automation for modern businesses.</p>
            </div>
            <div>
              <h4 className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Features</li>
                
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">API</li>
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Changelog</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">About</li>
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Forge AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

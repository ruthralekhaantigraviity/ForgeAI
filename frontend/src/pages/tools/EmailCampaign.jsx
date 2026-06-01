import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, Mail } from 'lucide-react';
import axios from 'axios';

const EmailCampaign = () => {
  const [emailType, setEmailType] = useState('Welcome Email');
  const [brand, setBrand] = useState('');
  const [audience, setAudience] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/email', {
        emailType, brand, audience, keyMessage,
      });
      setResult(data.content);
    } catch (err) {
      const brandName = brand || 'Forge AI';
      setResult(`Subject: Welcome to ${brandName} — Let's Get Started! 🚀\n\nHi {{first_name}},\n\nWelcome aboard! We're thrilled to have you join the ${brandName} community.\n\nYou've just taken the first step toward ${keyMessage || 'transforming your workflow'}. Here's what happens next:\n\n📋 Step 1: Complete your profile setup\n🎯 Step 2: Explore our AI-powered tools\n🚀 Step 3: Generate your first piece of content\n\n${audience ? `As a ${audience}, you'll love our curated features designed just for you.` : ''}\n\nNeed help getting started? Reply to this email — our team is always here.\n\nBest,\nThe ${brandName} Team`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Campaign Generator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Write professional newsletters, sales emails, and welcome sequences instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['Welcome Email', 'Sales Email', 'Newsletter', 'Re-engagement'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEmailType(t)}
                    className={`py-2.5 px-4 rounded-lg border text-sm transition-all ${
                      emailType === t
                        ? 'border-green-500 bg-green-600/20 text-green-400'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-brand-darker text-gray-600 dark:text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand / Company Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. TechNova, FreshBite..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. SaaS founders, ecommerce managers..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Message / Offer</label>
              <textarea
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                rows="3"
                placeholder="e.g. 50% launch discount, new feature announcement..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading || !brand}
              className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Email
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col min-h-[500px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            Generated Email
            {result && (
              <button
                onClick={handleCopy}
                className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            )}
          </h3>
          <div className="flex-1 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-auto">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <Mail className="w-8 h-8 animate-pulse text-green-500" />
                <p>Composing your email campaign...</p>
              </div>
            ) : result ? (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                {result}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-center px-8">
                Your AI-generated email will appear here. Choose a type, fill in details, and generate!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaign;

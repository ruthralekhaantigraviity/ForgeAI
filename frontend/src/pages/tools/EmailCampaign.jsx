import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const EMAIL_TYPES = [
  { group: 'Marketing', options: ['Welcome Email', 'Sales Email', 'Promotional Email', 'Newsletter', 'Re-engagement'] },
  { group: 'HR / Corporate', options: ['Offer Letter', 'Termination Letter', 'Promotion Announcement', 'Warning Letter', 'Leave Approval', 'Appraisal Letter'] },
  { group: 'PR / Business', options: ['Press Release', 'Partnership Request', 'Follow-up Email', 'Thank You Email', 'Meeting Request', 'Apology Email'] },
  { group: 'Other', options: ['Custom'] },
];

const TONES = ['Formal', 'Professional', 'Friendly', 'Empathetic', 'Assertive', 'Concise'];

const EmailCampaign = () => {
  const [emailType, setEmailType]     = useState('Welcome Email');
  const [customType, setCustomType]   = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName]   = useState('');
  const [companyName, setCompanyName] = useState('');
  const [purpose, setPurpose]         = useState('');
  const [tone, setTone]               = useState('Professional');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [copied, setCopied]           = useState(false);
  const [error, setError]             = useState('');

  const resolvedType = emailType === 'Custom' ? customType : emailType;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!resolvedType || !purpose.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/ai/email`, {
        emailType: resolvedType,
        recipientName: recipientName || 'Sir/Madam',
        senderName: senderName || 'The Team',
        companyName: companyName || '',
        purpose,
        tone,
      });
      setResult(data.content);
    } catch (err) {
      setError('Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = 'w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white transition-colors';
  const labelCls = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Professional Email Generator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Generate professional, context-aware emails tailored to your exact situation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit space-y-5">
          <form onSubmit={handleGenerate} className="space-y-5">

            {/* Email Type */}
            <div>
              <label className={labelCls}>Email Type</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className={inputCls}
              >
                {EMAIL_TYPES.map(group => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {emailType === 'Custom' && (
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Internship Completion Letter, Contract Renewal..."
                  className={`${inputCls} mt-2`}
                  required
                />
              )}
            </div>

            {/* Recipient + Sender row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. John Smith, HR Team..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Your Name / Sender</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className={labelCls}>Company / Organization Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TechNova Inc., Acme Corp..."
                className={inputCls}
              />
            </div>

            {/* Purpose */}
            <div>
              <label className={labelCls}>
                Purpose / Key Details
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows="4"
                placeholder={
                  resolvedType === 'Termination Letter'
                    ? 'e.g. Terminating John due to repeated policy violations. Final working day is June 30.'
                    : resolvedType === 'Offer Letter'
                    ? 'e.g. Offering the position of Senior Developer at $90,000/year, starting July 1.'
                    : resolvedType === 'Meeting Request'
                    ? 'e.g. Requesting a 30-minute call to discuss Q3 marketing strategy.'
                    : 'Describe what this email is about. Be specific — the more detail, the better the output.'
                }
                className={`${inputCls} resize-none`}
                required
              />
            </div>

            {/* Tone */}
            <div>
              <label className={labelCls}>Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      tone === t
                        ? 'border-green-500 bg-green-600/20 text-green-400'
                        : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 bg-gray-50 dark:bg-brand-darker'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !purpose.trim() || (emailType === 'Custom' && !customType.trim())}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Composing Email...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Professional Email
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Result ── */}
        <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col min-h-[560px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-500" />
              Generated Email
            </h3>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  className="p-2 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-green-500 transition-all"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-auto font-mono text-sm leading-relaxed">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="relative">
                  <Mail className="w-10 h-10 text-green-500/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-600 dark:text-gray-400">Composing your {resolvedType}...</p>
                  <p className="text-xs text-gray-400 mt-1">Adapting tone to: {tone}</p>
                </div>
              </div>
            ) : result ? (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {result}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-center px-8 gap-3">
                <Mail className="w-10 h-10 opacity-20" />
                <p className="text-sm">
                  Fill in the details and click <span className="text-green-500 font-semibold">Generate</span> to compose your {resolvedType || 'email'}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaign;

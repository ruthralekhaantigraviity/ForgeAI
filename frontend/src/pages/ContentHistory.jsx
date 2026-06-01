import { useState } from 'react';
import { History, Trash2, Copy, CheckCircle2, Search, Filter, MessageSquare, Megaphone, Mail, FileText, Image as ImageIcon } from 'lucide-react';

const iconMap = {
  'Social Media': MessageSquare,
  'Ad Copy': Megaphone,
  'Email': Mail,
  'SEO': FileText,
  'Banner': ImageIcon,
};

const colorMap = {
  'Social Media': 'bg-purple-400',
  'Ad Copy': 'bg-purple-500',
  'Email': 'bg-green-500',
  'SEO': 'bg-orange-500',
  'Banner': 'bg-pink-500',
};

// Mock data for demo
const mockHistory = [
  {
    id: 1,
    type: 'Social Media',
    title: 'Instagram post about summer collection launch',
    preview: '🚀 Exciting news! Our summer collection is here...',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    type: 'Ad Copy',
    title: 'Facebook conversion ad for SaaS product',
    preview: '📢 Tired of wasting time on manual tasks? Discover...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    type: 'Email',
    title: 'Welcome email sequence for new subscribers',
    preview: 'Subject: Welcome — Let\'s Get Started!...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 4,
    type: 'SEO',
    title: 'Blog post: Content Marketing Strategies 2025',
    preview: '# The Ultimate Guide to Content Marketing in 2025...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 5,
    type: 'Social Media',
    title: 'LinkedIn post about team culture',
    preview: '💼 At our company, we believe in empowering every team member...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 6,
    type: 'Banner',
    title: 'Black Friday sale banner 1200x628',
    preview: '[Image] Black Friday — Up to 60% Off Everything!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const ContentHistory = () => {
  const [items, setItems] = useState(mockHistory);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const formatTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                        item.preview.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content History</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Browse, copy, or delete your previously generated content.</p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Social Media', 'Ad Copy', 'Email', 'SEO', 'Banner'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                filter === f
                  ? 'border-brand-500 bg-brand-600/20 text-brand-400'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-brand-dark text-gray-600 dark:text-gray-400 hover:border-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">No content found</p>
          <p className="text-sm mt-2">Generate some content using the AI tools to see it here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const Icon = iconMap[item.type] || FileText;
            const color = colorMap[item.type] || 'bg-gray-500';
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:border-gray-700 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-gray-900 dark:text-white font-medium truncate">{item.title}</h3>
                      <span className="text-xs text-gray-500 shrink-0">{formatTime(item.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{item.preview}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item.id, item.preview)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      title="Copy"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle2 className="w-4 h-4 text-brand-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentHistory;

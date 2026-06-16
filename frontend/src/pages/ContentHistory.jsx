import { useState, useEffect, useContext } from 'react';
import { History, Trash2, Copy, CheckCircle2, Search, MessageSquare, Megaphone, Mail, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const iconMap = {
  'Social Media': MessageSquare,
  'Ad Copy': Megaphone,
  'Email': Mail,
  'SEO': FileText,
  'Banner': ImageIcon,
};

const colorMap = {
  'Social Media': 'bg-purple-500',
  'Ad Copy': 'bg-blue-500',
  'Email': 'bg-green-500',
  'SEO': 'bg-orange-500',
  'Banner': 'bg-pink-500',
};

const ContentHistory = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const isGuest = !user || !user.token || user.token.startsWith('guest');

  const fetchHistory = async () => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const formatTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
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

  const handleDelete = async (id) => {
    if (isGuest) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE_URL}/api/history/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + (err?.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.content?.toLowerCase().includes(search.toLowerCase()) ||
      item.metadata?.userMessage?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.type === filter;
    return matchSearch && matchFilter;
  });

  // --- Guest state ---
  if (isGuest) {
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
        <div className="text-center py-20 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">Sign in to save your history</p>
          <p className="text-sm mt-2">Create a free account to automatically save every generation.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content History</h1>
          <button
            onClick={fetchHistory}
            className="ml-auto p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg">{error}</p>
          <button onClick={fetchHistory} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">{items.length === 0 ? 'No history yet' : 'No results found'}</p>
          <p className="text-sm mt-2">
            {items.length === 0
              ? 'Generate some content using the AI tools and it will be saved here automatically!'
              : 'Try a different search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const Icon = iconMap[item.type] || FileText;
            const color = colorMap[item.type] || 'bg-gray-500';
            const isExpanded = expandedId === item._id;
            const preview = item.content?.substring(0, 120) || '';
            return (
              <div
                key={item._id}
                className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all group cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item._id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{item.type}</span>
                      <span className="text-xs text-gray-500 shrink-0">{formatTime(item.createdAt)}</span>
                      {item.metadata?.imageUrl && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Image
                        </span>
                      )}
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-medium truncate mb-1">{item.title}</h3>
                    
                    {isExpanded ? (
                      <div className="mt-3">
                        {item.metadata?.imageUrl && (
                          <div className="mb-4">
                            <img src={item.metadata.imageUrl} alt="Generated" className="w-full max-w-md rounded-xl object-contain shadow-md border border-gray-200 dark:border-gray-700" />
                          </div>
                        )}
                        <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                          {item.content}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{preview}...</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(item._id, item.content); }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      title="Copy"
                    >
                      {copiedId === item._id ? (
                        <CheckCircle2 className="w-4 h-4 text-brand-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      disabled={deletingId === item._id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className={`w-4 h-4 ${deletingId === item._id ? 'animate-pulse' : ''}`} />
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

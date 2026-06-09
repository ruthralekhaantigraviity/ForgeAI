import { useState, useContext, useRef } from 'react';
import { Sparkles, Copy, CheckCircle2, Hash, ImageIcon, Tag } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

// Always point to local backend
const API_BASE_URL = 'http://localhost:5000';

const PLATFORM_ICONS = {
  Instagram: '📸',
  LinkedIn: '💼',
  'Twitter / X': '🐦',
  Facebook: '👥',
};

const SocialMedia = () => {
  const { user } = useContext(AuthContext);
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copiedTag, setCopiedTag] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Track what was generated so the result panel shows context
  const [generatedFor, setGeneratedFor] = useState({ platform: '', topic: '' });
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);
  const imgRef = useRef(null);

  const handleEditImage = async () => {
    if (!editInstructions.trim()) return;
    setEditingLoading(true);
    try {
      const token = user?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token && !token.startsWith('guest')) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const { data } = await axios.post(`${API_BASE_URL}/api/ai/edit-image`, {
        prompt: generatedFor.topic || topic,
        instructions: editInstructions,
        generatorType: 'social'
      }, { headers });

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImageLoaded(false);
        setIsEditingImage(false);
        setEditInstructions('');
      } else {
        throw new Error('No image returned from server');
      }
    } catch (err) {
      console.error('Error editing image:', err);
      alert(err?.response?.data?.message || err.message || 'Failed to edit image');
    } finally {
      setEditingLoading(false);
    }
  };

  const handleImageAction = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) { window.open(imageUrl, '_blank'); return; }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `ai-generated-${Date.now()}.jpeg`;
        link.href = blobUrl;
        link.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }, 'image/jpeg', 0.95);
    } catch {
      const link = document.createElement('a');
      link.download = `ai-generated-${Date.now()}.jpeg`;
      link.href = imageUrl;
      link.click();
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setImageUrl(null);
    setHashtags([]);
    setImageLoaded(false);
    setGeneratedFor({ platform: '', topic: '' });

    try {
      const token = user?.token;
      const headers = token && !token.startsWith('guest')
        ? { Authorization: `Bearer ${token}` }
        : {};

      const { data } = await axios.post(`${API_BASE_URL}/api/ai/social`, {
        platform, topic, tone,
      }, { headers });

      setResult(data.content || '');
      setHashtags(data.hashtags || []);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      // Store what this result was generated for
      setGeneratedFor({ platform, topic });

    } catch (err) {
      console.error('API Error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      setResult(`❌ Generation failed: ${errMsg}\n\nMake sure the backend is running on port 5000.`);
      setHashtags([]);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `${result}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const hasContent = result || imageUrl || hashtags.length > 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Social Media Post Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">Instantly generate high-converting captions, images & hashtags for any platform.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white appearance-none"
              >
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Twitter / X</option>
                <option>Facebook</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What is the post about?</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows="4"
                placeholder="e.g. A golden sunflower field at sunrise, pizza night with friends..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tone of Voice</label>
              <div className="grid grid-cols-2 gap-3">
                {['Professional', 'Friendly', 'Funny', 'Luxury'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 px-4 rounded-lg border transition-all ${
                      tone === t
                        ? 'border-brand-500 bg-brand-600/20 text-brand-400'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-brand-darker text-gray-600 dark:text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !topic}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white rounded-xl font-medium shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Post + Image
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Area */}
        <div className="space-y-4">

          {/* Context Banner — shows what topic/platform was generated for */}
          {(hasContent || loading) && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
              <span className="text-lg">{PLATFORM_ICONS[loading ? platform : generatedFor.platform] || '📱'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-600 dark:text-brand-400 font-medium uppercase tracking-wide">
                  {loading ? platform : generatedFor.platform}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {loading ? topic : generatedFor.topic}
                </p>
              </div>
              {loading && (
                <div className="w-4 h-4 border-2 border-brand-400/40 border-t-brand-500 rounded-full animate-spin flex-shrink-0" />
              )}
            </div>
          )}

          {/* Generated Image */}
          <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Generated Image</span>
              {generatedFor.topic && !loading && (
                <span className="ml-auto text-xs text-gray-400 truncate max-w-[140px]">for: {generatedFor.topic}</span>
              )}
            </div>
            <div className="relative min-h-[220px] flex items-center justify-center bg-gray-50 dark:bg-brand-darker">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-gray-400 py-10">
                  <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  <p className="text-sm">Generating realistic image...</p>
                </div>
              ) : imageUrl ? (
                <div className="relative group w-full">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  )}
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="AI Generated"
                    className="w-full h-auto object-cover"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={handleImageAction}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-md text-xs font-medium border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      ⬇ Download
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingImage(true)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 py-10">
                  <ImageIcon className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Your image will appear here</p>
                </div>
              )}
            </div>
            {imageUrl && isEditingImage && (
              <div className="p-4 bg-gray-50 dark:bg-brand-darker border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Describe the changes you want to make to the image:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    placeholder="e.g. Add a red coffee mug on the desk, warmer colors"
                    className="flex-1 px-3 py-2 bg-white dark:bg-brand-dark border border-gray-300 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                    disabled={editingLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditImage();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleEditImage}
                    disabled={editingLoading || !editInstructions.trim()}
                    className="px-3 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {editingLoading ? (
                      <>
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : 'Apply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingImage(false);
                      setEditInstructions('');
                    }}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-xl hover:bg-gray-300 transition-colors"
                    disabled={editingLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Caption
                  {generatedFor.platform && !loading && (
                    <span className="ml-1.5 text-xs font-normal text-gray-400">
                      — {generatedFor.platform}
                    </span>
                  )}
                </span>
              </div>
              {hasContent && (
                <button
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>
            <div className="p-5 min-h-[100px]">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>
              ) : result ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{result}</p>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Your caption will appear here</p>
              )}
            </div>
          </div>

          {/* Hashtags */}
          <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hashtags
                {generatedFor.topic && !loading && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    — for "{generatedFor.topic}"
                  </span>
                )}
              </span>
              {hashtags.length > 0 && <span className="text-xs text-gray-400 ml-auto">{hashtags.length} tags — click to copy</span>}
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full" style={{ width: `${60 + Math.random() * 50}px` }} />
                  ))}
                </div>
              ) : hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopyTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                        copiedTag === tag
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/40'
                      }`}
                    >
                      {copiedTag === tag ? '✓ Copied' : tag}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-3">Hashtags will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;

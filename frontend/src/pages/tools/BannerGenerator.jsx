import { useState, useRef } from 'react';
import { Sparkles, Download, Image as ImageIcon, RefreshCw, Wand2 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const STYLES = ['Modern', 'Minimal', 'Bold', 'Gradient', 'Corporate', 'Playful'];

const SIZES = [
  { label: 'Facebook / LinkedIn', value: '1200x628', aspect: '1200/628' },
  { label: 'Instagram Post',      value: '1080x1080', aspect: '1/1' },
  { label: 'Instagram Story',     value: '1080x1920', aspect: '9/16' },
  { label: 'Twitter Header',      value: '1500x500',  aspect: '1500/500' },
  { label: 'Leaderboard Ad',      value: '728x90',    aspect: '728/90' },
];

const BannerGenerator = () => {
  const [prompt, setPrompt]       = useState('');
  const [style, setStyle]         = useState('Modern');
  const [size, setSize]           = useState('1200x628');
  const [loading, setLoading]     = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError]         = useState('');
  const imgRef = useRef(null);

  const selectedSize = SIZES.find(s => s.value === size) || SIZES[0];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBannerUrl('');
    setEnhancedPrompt('');
    setImageLoaded(false);
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token && !token.startsWith('guest')) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/api/ai/banner`,
        { prompt, style, size },
        { headers, timeout: 60000 }
      );

      if (data.imageUrl) {
        setBannerUrl(data.imageUrl);
        if (data.enhancedPrompt) setEnhancedPrompt(data.enhancedPrompt);
      } else {
        throw new Error('No image returned from server');
      }
    } catch (err) {
      console.error('Banner generation error:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to generate banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!bannerUrl) return;
    const img = imgRef.current;
    if (!img) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          const link = document.createElement('a');
          link.download = `banner-${Date.now()}.jpeg`;
          link.href = bannerUrl;
          link.click();
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `banner-${size}-${Date.now()}.jpeg`;
        link.href = blobUrl;
        link.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }, 'image/jpeg', 0.95);
    } catch {
      const link = document.createElement('a');
      link.download = `banner-${Date.now()}.jpeg`;
      link.href = bannerUrl;
      link.click();
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Banner Generator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Create stunning marketing banners with AI-powered image generation using Hugging Face FLUX.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner Text / Message
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows="4"
                placeholder="e.g. Summer Sale — Up to 50% Off All Products! Vibrant storefront with colorful clothes..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900 dark:text-white resize-none"
                required
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Design Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                      style === s
                        ? 'border-pink-500 bg-pink-600/20 text-pink-400'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-brand-darker text-gray-600 dark:text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900 dark:text-white appearance-none"
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} ({s.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Banner Image
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                ❌ {error}
              </div>
            )}
          </form>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-500" />
              Generated Banner
              {bannerUrl && (
                <span className="text-xs font-normal text-gray-500">— {selectedSize.label} ({size})</span>
              )}
            </h3>
            {bannerUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  className="p-2 rounded-lg text-gray-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>

          {/* Image Area */}
          <div
            className="flex-1 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl relative flex items-center justify-center overflow-hidden"
            style={{ minHeight: '320px' }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-4 py-10">
                <div className="relative">
                  <ImageIcon className="w-12 h-12 text-pink-500/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Generating your banner...</p>
                  <p className="text-xs text-gray-500 mt-1">Hugging Face FLUX is creating your image</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : bannerUrl ? (
              <div className="relative w-full group">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                )}
                <img
                  ref={imgRef}
                  src={bannerUrl}
                  alt="AI Generated Banner"
                  className="w-full h-auto max-h-[480px] object-contain rounded-lg shadow-2xl"
                  crossOrigin="anonymous"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-pink-500/90 hover:bg-pink-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400 py-10 px-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Your AI-generated banner will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Prompt (AI used this) */}
          {enhancedPrompt && !loading && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-500" />
                AI-Enhanced Prompt Used:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {enhancedPrompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerGenerator;

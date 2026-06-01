import { useState } from 'react';
import { Sparkles, Download, Image as ImageIcon } from 'lucide-react';

const BannerGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Modern');
  const [size, setSize] = useState('1200x628');
  const [loading, setLoading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Defaulting to relative or localhost depending on proxy, but we'll use localhost:5000 for safety based on backend setup
      const response = await fetch('http://localhost:5000/api/ai/banner', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, style, size })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate banner');
      }
      
      if (data.imageUrl) {
        setBannerUrl(data.imageUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err) {
      console.error("Error generating banner:", err);
      alert(err.message || "Failed to generate banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `banner-${Date.now()}.png`;
    link.href = bannerUrl;
    link.click();
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
        <p className="text-gray-600 dark:text-gray-400">Create stunning marketing banners with AI-powered design.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Text / Message</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows="4"
                placeholder="e.g. Summer Sale — Up to 50% Off All Products!"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Design Style</label>
              <div className="grid grid-cols-3 gap-3">
                {['Modern', 'Minimal', 'Bold', 'Gradient', 'Corporate', 'Playful'].map((s) => (
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900 dark:text-white appearance-none"
              >
                <option value="1200x628">Facebook / LinkedIn (1200×628)</option>
                <option value="1080x1080">Instagram Post (1080×1080)</option>
                <option value="1080x1920">Instagram Story (1080×1920)</option>
                <option value="1500x500">Twitter Header (1500×500)</option>
                <option value="728x90">Leaderboard Ad (728×90)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Banner
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col min-h-[500px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            Generated Banner
            {bannerUrl && (
              <button
                onClick={handleDownload}
                className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            )}
          </h3>
          <div className="flex-1 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl p-4 relative flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                <ImageIcon className="w-8 h-8 animate-pulse text-pink-500" />
                <p>Designing your banner...</p>
              </div>
            ) : bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Generated banner"
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
              />
            ) : (
              <div className="text-gray-600 text-center px-8">
                Your AI-generated banner will appear here. Enter your message and preferences, then generate!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerGenerator;

import { useState, useRef } from 'react';
import { Sparkles, Copy, CheckCircle2, Megaphone, Image as ImageIcon, Download } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const AdCopy = () => {
  const [adType, setAdType] = useState('Facebook');
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('Conversions');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Image states
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);
  const imgRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setImageUrl(null);
    setImagePrompt('');
    setImageLoaded(false);
    setIsEditingImage(false);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/ai/ad-copy`, {
        adType, product, audience, goal,
      });
      setResult(data.content);
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImagePrompt(data.imagePrompt || '');
      }
    } catch (err) {
      setResult(
`📢 ${adType} Ad — ${goal}

🎯 Headline:
"Unlock the Future of ${product || 'Your Business'} — Limited Time Offer!"

📝 Primary Text:
Tired of wasting time and money on ${product ? product.toLowerCase() : 'solutions'} that don't deliver? We get it.

${audience ? `Perfect for ${audience}.` : ''}

✅ AI-powered optimization
✅ Results in 48 hours or less
✅ Loved by 10,000+ businesses

👉 CTA: "Get Started Free →"

📌 Description:
Join thousands of businesses already using our platform. Start your free trial today.`
      );
    } finally {
      setLoading(false);
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
        link.download = `ad-image-${Date.now()}.jpeg`;
        link.href = blobUrl;
        link.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }, 'image/jpeg', 0.95);
    } catch {
      const link = document.createElement('a');
      link.download = `ad-image-${Date.now()}.jpeg`;
      link.href = imageUrl;
      link.click();
    }
  };

  const handleEditImage = async () => {
    if (!editInstructions.trim()) return;
    setEditingLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/ai/edit-image`, {
        prompt: imagePrompt || product,
        instructions: editInstructions,
        generatorType: 'ad'
      });

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        if (data.enhancedPrompt) setImagePrompt(data.enhancedPrompt);
        setImageLoaded(false);
        setIsEditingImage(false);
        setEditInstructions('');
      } else {
        throw new Error('No image returned from server');
      }
    } catch (err) {
      console.error('Error editing ad image:', err);
      alert(err?.response?.data?.message || err.message || 'Failed to edit ad image');
    } finally {
      setEditingLoading(false);
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
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ad Copy Generator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Create high-converting ad copy for Facebook, Google & Meta campaigns.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Platform</label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white appearance-none"
              >
                <option>Facebook</option>
                <option>Google Ads</option>
                <option>Instagram</option>
                <option>LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product / Service</label>
              <textarea
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                rows="3"
                placeholder="e.g. An AI-powered email marketing tool for small businesses..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Startup founders, ecommerce store owners..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Goal</label>
              <div className="grid grid-cols-3 gap-3">
                {['Conversions', 'Brand Awareness', 'Traffic'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                      goal === g
                        ? 'border-purple-500 bg-purple-600/20 text-purple-400'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-brand-darker text-gray-600 dark:text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !product}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Ad Copy
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Area */}
        <div className="space-y-6">
          {/* Ad Image Card */}
          {(imageUrl || loading) && (
            <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Generated Ad Image</span>
              </div>
              <div className="relative min-h-[220px] flex items-center justify-center bg-gray-50 dark:bg-brand-darker">
                {loading ? (
                  <div className="flex flex-col items-center gap-3 text-gray-400 py-10">
                    <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-sm">Generating ad image...</p>
                  </div>
                ) : imageUrl ? (
                  <div className="relative group w-full">
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    )}
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="AI Generated Ad"
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
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              {imageUrl && isEditingImage && (
                <div className="p-4 bg-gray-50 dark:bg-brand-darker border-t border-gray-100 dark:border-gray-800">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Describe the changes you want to make to the ad image:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      placeholder="e.g. Make colors warmer, add product packaging"
                      className="flex-1 px-3 py-2 bg-white dark:bg-brand-dark border border-gray-300 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      disabled={editingLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditImage();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleEditImage}
                      disabled={editingLoading || !editInstructions.trim()}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
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
          )}

          {/* Ad Copy Card */}
          <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col min-h-[300px]">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              Generated Ad Copy
              {result && (
                <button
                  onClick={handleCopy}
                  className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-purple-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              )}
            </h3>

            <div className="flex-1 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <Megaphone className="w-8 h-8 animate-pulse text-purple-500" />
                  <p>Writing high-converting copy...</p>
                </div>
              ) : result ? (
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {result}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-center px-8">
                  Your AI-generated ad copy and marketing images will appear here. Fill out the form and click generate to begin!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCopy;

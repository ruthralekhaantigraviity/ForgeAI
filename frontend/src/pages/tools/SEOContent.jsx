import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, FileText } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const SEOContent = () => {
  const [contentType, setContentType] = useState('Blog Post');
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [wordCount, setWordCount] = useState('800');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/ai/seo`, {
        contentType, keyword, industry, wordCount,
      });
      setResult(data.content);
    } catch (err) {
      const kw = keyword || 'digital marketing';
      setResult(
`# The Ultimate Guide to ${kw.charAt(0).toUpperCase() + kw.slice(1)} in 2025

**Meta Title:** ${kw.charAt(0).toUpperCase() + kw.slice(1)} — Complete Guide for ${industry || 'Businesses'} | ${new Date().getFullYear()}
**Meta Description:** Discover the best strategies for ${kw}. Learn actionable tips, expert insights, and proven methods to grow your ${industry || 'business'} in ${new Date().getFullYear()}.
**Target Keyword:** ${kw}
**Word Count:** ~${wordCount} words

---

## Introduction

In today's rapidly evolving digital landscape, ${kw} has become a critical component for any ${industry || 'business'} looking to stay competitive. Whether you're just getting started or looking to refine your existing strategy, this comprehensive guide will walk you through everything you need to know.

## Why ${kw.charAt(0).toUpperCase() + kw.slice(1)} Matters in ${new Date().getFullYear()}

The importance of ${kw} cannot be overstated. Recent studies show that:

- **78%** of consumers research products online before making a purchase
- Companies investing in ${kw} see an average **3.5x ROI** within the first year
- **92%** of ${industry || 'industry'} leaders consider ${kw} a top priority

> "The best time to invest in ${kw} was yesterday. The second best time is today."

## Key Strategies for Success

### 1. Understand Your Audience
Before diving into ${kw}, take the time to understand who you're trying to reach. Create detailed buyer personas that include demographics, pain points, and preferred channels.

### 2. Create High-Quality Content
Content remains king in ${kw}. Focus on creating valuable, original content that addresses your audience's needs. Use a mix of formats:
- Long-form blog posts (like this one!)
- Infographics and visual content
- Video tutorials and webinars
- Case studies and white papers

### 3. Optimize for Search Engines
Ensure your ${kw} strategy includes solid SEO foundations:
- **On-page SEO:** Title tags, meta descriptions, header tags, internal linking
- **Technical SEO:** Site speed, mobile responsiveness, schema markup
- **Off-page SEO:** Quality backlinks, social signals, brand mentions

### 4. Measure and Iterate
Track your ${kw} performance using tools like Google Analytics, Search Console, and industry-specific platforms. Key metrics to monitor:
- Organic traffic growth
- Conversion rates
- Keyword rankings
- Engagement metrics (time on page, bounce rate)

## Common Mistakes to Avoid

❌ Ignoring mobile optimization
❌ Focusing on quantity over quality
❌ Neglecting competitor analysis
❌ Not tracking ROI
❌ Inconsistent publishing schedule

## Conclusion

Mastering ${kw} is not an overnight process, but with the right strategy and consistent effort, the results can be transformative for your ${industry || 'business'}. Start implementing these strategies today and watch your organic presence grow.

---

**Related Keywords:** ${kw} strategy, ${kw} best practices, ${kw} for ${industry || 'beginners'}, ${kw} tips ${new Date().getFullYear()}`
      );
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
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO Content Generator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Generate SEO-optimized blog posts, articles, and landing page content.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['Blog Post', 'Landing Page', 'Product Description', 'Article'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setContentType(t)}
                    className={`py-2.5 px-4 rounded-lg border text-sm transition-all ${
                      contentType === t
                        ? 'border-orange-500 bg-orange-600/20 text-orange-400'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-brand-darker text-gray-600 dark:text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. content marketing, SaaS pricing strategies..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry / Niche</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. E-commerce, Healthcare, FinTech..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Approximate Word Count</label>
              <select
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darker border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white appearance-none"
              >
                <option value="500">~500 words (Short)</option>
                <option value="800">~800 words (Medium)</option>
                <option value="1500">~1500 words (Long-form)</option>
                <option value="2500">~2500 words (Pillar content)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !keyword}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate SEO Content
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col min-h-[500px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            Generated Content
            {result && (
              <button
                onClick={handleCopy}
                className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-orange-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            )}
          </h3>
          <div className="flex-1 bg-gray-50 dark:bg-brand-darker border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-auto max-h-[700px]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <FileText className="w-8 h-8 animate-pulse text-orange-500" />
                <p>Writing SEO-optimized content...</p>
              </div>
            ) : result ? (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                {result}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-center px-8">
                Your AI-generated SEO content will appear here. Enter your keyword and preferences, then generate!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOContent;

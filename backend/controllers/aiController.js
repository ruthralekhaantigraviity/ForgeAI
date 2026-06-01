const GeneratedContent = require('../models/GeneratedContent');
const axios = require('axios');

const FormData = require('form-data');

// ─── Image generation via Stability AI ───────────────────────────────────────────
const generateImage = async (prompt) => {
  require('dotenv').config({ override: true });
  const stabilityKey = process.env.STABILITY_API_KEY;

  if (!stabilityKey || stabilityKey === 'your_stability_api_key_here') {
    throw new Error('STABILITY_API_KEY is missing or invalid.');
  }

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('output_format', 'jpeg');

  const response = await axios.post(
    'https://api.stability.ai/v2beta/stable-image/generate/core',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${stabilityKey}`,
        Accept: 'image/*',
      },
      responseType: 'arraybuffer',
      timeout: 60000,
    }
  );

  const base64Image = Buffer.from(response.data).toString('base64');
  console.log('✅ Image generated via Stability AI');
  return `data:image/jpeg;base64,${base64Image}`;
};

// Helper: generate AI text using Gemini API
const generateText = async (systemPrompt, userPrompt) => {
  require('dotenv').config({ override: true });
  
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [{
          parts: [
            { text: systemPrompt + '\n\n' + userPrompt }
          ]
        }]
      }
    );
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return null;
  }
};

// @desc    Generate social media post
// @route   POST /api/ai/social
const generateSocialPost = async (req, res) => {
  try {
    require('dotenv').config({ override: true });
    const geminiKey = process.env.GEMINI_API_KEY;

    const { platform, topic, tone } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    if (!geminiKey) {
      return res.json({ 
        content: `⚠️ **Gemini API Key Missing!**\n\nTo generate real AI content and images for your **${platform}** post about **"${topic}"**, you must add a valid \`GEMINI_API_KEY\` to your \`backend/.env\` file.`, 
        imageUrl: null, 
        hashtags: ['#SetupRequired', '#APIKeyMissing'] 
      });
    }

    // ─── Step 1 & 2: Enhance image prompt using AI ─────────────────────────────
    const imageEnhanceSystemPrompt = `Convert the following user input into a highly detailed, descriptive image generation prompt.
Make it suitable for AI image generation.
If the user asks for a 'poster', 'flyer', 'ad', or 'graphic design', instruct the AI to generate a "modern corporate graphic design poster template, featuring bold typography, clean vector layouts, UI/UX elements, icons, and structured text sections", similar to a high-quality DALL-E 3 graphic design. Emphasize that it must NOT be a photograph of a person, but an actual digital poster layout.
If the user asks for a specific style (like '3d render', 'cartoon'), ensure the prompt strongly reflects that style. 
If no style is specified, default to professional, high-quality photography.
Avoid adding any futuristic, robotic, cyberpunk, neon or artificial elements unless explicitly mentioned.
Return ONLY the final prompt text, nothing else.`;

    let imagePrompt = await generateText(imageEnhanceSystemPrompt, topic);
    if (!imagePrompt) {
      imagePrompt = topic;
    }

    // ─── Step 3: Generate image (Hugging Face) ───
    let imageUrl = null;
    try {
      imageUrl = await generateImage(imagePrompt);
      console.log('✅ Image URL generated via Hugging Face');
    } catch (err) {
      console.error('Hugging Face image error:', err.message);
    }

    // ─── Step 4: Generate hashtags ─────────────────────────────────────────────
    let hashtags = [];
    const hashtagSystemPrompt = `Generate 15 trending and relevant Instagram hashtags for the given topic. Mix popular and niche hashtags. No spammy tags. Return only hashtags separated by spaces, no explanations.`;
    const hashtagContent = await generateText(hashtagSystemPrompt, `Generate hashtags for: ${topic}`);

    if (hashtagContent) {
      hashtags = hashtagContent.match(/#\w+/g) || [];
    }

    if (hashtags.length === 0) {
      const tag = topic.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      hashtags = [
        `#${tag}`, `#${tag}Photography`, `#${tag}Vibes`,
        '#Photography', '#NaturalLight', '#CinematicShots',
        '#4KPhotography', '#ContentCreator', '#VisualStorytelling',
        '#ProfessionalPhoto', '#Aesthetic', '#DailyInspiration',
        '#BrandForge', '#Marketing', '#TrendingNow',
      ];
    }

    // ─── Step 5: Generate post caption ────────────────────────────────────────
    const systemPrompt = `You are an expert social media marketer. Generate an engaging ${platform || 'Instagram'} post caption in a ${tone || 'Professional'} tone. Include emojis and a call-to-action. Do NOT include hashtags (they are added separately). Keep it concise and compelling.`;
    const userPrompt = `Create a ${platform || 'Instagram'} post caption about: ${topic}`;

    let content = await generateText(systemPrompt, userPrompt);

    if (!content) {
      content = `✨ Discover the beauty of ${topic}!\n\nEvery moment tells a story — and this one is worth sharing. Whether you're just starting or leveling up, ${topic} is here to inspire.\n\nSave this for later 📌 and tag someone who needs to see this! 👇`;
    }

    // Save to history
    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'Social Media',
        title: `${platform} post about ${topic.substring(0, 50)}`,
        content: `${content}\n\n${hashtags.join(' ')}`,
        metadata: { platform, tone, imageUrl },
      });
    }

    res.json({ content, imageUrl, hashtags });
  } catch (error) {
    console.error('Social media generation error:', error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
};

// @desc    Generate ad copy
// @route   POST /api/ai/ad-copy
const generateAdCopy = async (req, res) => {
  try {
    const { adType, product, audience, goal } = req.body;

    if (!product) {
      return res.status(400).json({ message: 'Product description is required' });
    }

    const systemPrompt = `You are an expert advertising copywriter. Generate a compelling ${adType || 'Facebook'} ad copy optimized for ${goal || 'Conversions'}. Include a headline, primary text, CTA, and description. Make it persuasive and action-oriented.`;
    const userPrompt = `Create ad copy for: ${product}. Target audience: ${audience || 'general audience'}. Campaign goal: ${goal || 'Conversions'}.`;

    let content = await generateText(systemPrompt, userPrompt);

    if (!content) {
      content = `📢 ${adType || 'Facebook'} Ad — ${goal || 'Conversions'}\n\n🎯 Headline:\n"Unlock the Future of ${product} — Limited Time Offer!"\n\n📝 Primary Text:\nTired of solutions that don't deliver? We built something different.\n\n${audience ? `Perfect for ${audience}.` : ''}\n\n✅ AI-powered optimization\n✅ Results in 48 hours\n✅ Loved by 10,000+ businesses\n\n👉 CTA: "Get Started Free →"\n\n📌 Description:\nJoin thousands using our platform. Free trial — no credit card required.`;
    }

    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'Ad Copy',
        title: `${adType} ad for ${product.substring(0, 50)}`,
        content,
        metadata: { adType, audience, goal },
      });
    }

    res.json({ content });
  } catch (error) {
    console.error('Ad copy generation error:', error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
};

// @desc    Generate email campaign
// @route   POST /api/ai/email
const generateEmail = async (req, res) => {
  try {
    const { emailType, brand, audience, keyMessage } = req.body;

    if (!brand) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const systemPrompt = `You are an expert email marketing copywriter. Generate a professional ${emailType || 'Welcome Email'} for the brand "${brand}". Include subject line, body text with proper formatting, merge tags like {{first_name}}, and a clear CTA.`;
    const userPrompt = `Create a ${emailType} for brand "${brand}". Target audience: ${audience || 'subscribers'}. Key message: ${keyMessage || 'engagement'}.`;

    let content = await generateText(systemPrompt, userPrompt);

    if (!content) {
      content = `Subject: Welcome to ${brand} — Let's Get Started! 🚀\n\nHi {{first_name}},\n\nWelcome aboard! We're thrilled to have you join the ${brand} community.\n\nYou've just taken the first step toward ${keyMessage || 'transforming your workflow'}.\n\n📋 Step 1: Complete your profile\n🎯 Step 2: Explore our tools\n🚀 Step 3: Create your first piece of content\n\n${audience ? `As a ${audience}, you'll love our curated features.` : ''}\n\nBest,\nThe ${brand} Team`;
    }

    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'Email',
        title: `${emailType} for ${brand}`,
        content,
        metadata: { emailType, audience },
      });
    }

    res.json({ content });
  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
};

// @desc    Generate SEO content
// @route   POST /api/ai/seo
const generateSEO = async (req, res) => {
  try {
    const { contentType, keyword, industry, wordCount } = req.body;

    if (!keyword) {
      return res.status(400).json({ message: 'Target keyword is required' });
    }

    const systemPrompt = `You are an expert SEO content writer. Generate a ${contentType || 'Blog Post'} of approximately ${wordCount || 800} words targeting the keyword "${keyword}". Include a meta title, meta description, proper heading structure (H1, H2, H3), internal linking suggestions, and related keywords. Write for the ${industry || 'general'} industry.`;
    const userPrompt = `Write a ${wordCount || 800}-word ${contentType} targeting the keyword "${keyword}" in the ${industry || 'general'} industry.`;

    let content = await generateText(systemPrompt, userPrompt);

    if (!content) {
      content = `# The Ultimate Guide to ${keyword}\n\n**Meta Title:** ${keyword} — Complete Guide | ${new Date().getFullYear()}\n**Meta Description:** Discover the best strategies for ${keyword}. Actionable tips for ${industry || 'businesses'}.\n**Target Keyword:** ${keyword}\n\n## Introduction\n\nIn today's digital landscape, ${keyword} has become critical for any ${industry || 'business'}.\n\n## Why ${keyword} Matters\n\n- 78% of consumers research online before purchasing\n- Companies investing in ${keyword} see 3.5x ROI\n\n## Key Strategies\n\n### 1. Understand Your Audience\n### 2. Create High-Quality Content\n### 3. Optimize for Search Engines\n### 4. Measure and Iterate\n\n## Conclusion\n\nMastering ${keyword} takes time but delivers transformative results.`;
    }

    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'SEO',
        title: `${contentType}: ${keyword}`,
        content,
        metadata: { contentType, keyword, industry, wordCount },
      });
    }

    res.json({ content });
  } catch (error) {
    console.error('SEO generation error:', error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
};

// @desc    General chat / free-form AI query
// @route   POST /api/ai/chat
const generateChat = async (req, res) => {
  try {
    require('dotenv').config({ override: true });
    const geminiKey = process.env.GEMINI_API_KEY;

    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!geminiKey) {
      return res.json({ 
        content: `⚠️ **Gemini API Key Missing**\nI cannot generate responses or images until you provide a valid \`GEMINI_API_KEY\` in the \`backend/.env\` file.` 
      });
    }

    const lowerMsg = message.toLowerCase();

    // ─── Detect image generation intent ───────────────────────────────────────
    const imageKeywords = [
      'image', 'picture', 'photo', 'illustration', 'artwork', 'banner',
      'poster', 'thumbnail', 'visual', 'graphic', 'generate image',
      'create image', 'make image', 'show me', 'draw', 'design',
    ];
    const wantsImage = imageKeywords.some(kw => lowerMsg.includes(kw));

    // ─── Build image prompt from message ──────────────────────────────────────
    let imageUrl = null;
    if (wantsImage) {
      let imageTopic = message
        .replace(/create|generate|make|show me|give me|an?|the|for|with|and|please|can you|i want/gi, '')
        .trim() || message;
      
      const chatImageEnhanceSystemPrompt = `Convert the following user input into a highly detailed, descriptive image generation prompt.
Make it suitable for AI image generation.
If the user asks for a 'poster', 'flyer', 'ad', or 'graphic design', instruct the AI to generate a "modern corporate graphic design poster template, featuring bold typography, clean vector layouts, UI/UX elements, icons, and structured text sections". Emphasize that it must NOT be a photograph of a person, but an actual digital poster layout.
If the user asks for a specific style (like '3d render', 'cartoon', 'illustration'), ensure the prompt strongly reflects that style. 
If no style is specified, default to professional, high-quality photography.
Return ONLY the final prompt text, nothing else.`;
      
      let imagePrompt = await generateText(chatImageEnhanceSystemPrompt, imageTopic);
      if (!imagePrompt) imagePrompt = imageTopic;

      try {
        imageUrl = await generateImage(imagePrompt);
        console.log('✅ Chat image generated via Hugging Face');
      } catch (err) {
        console.error('Hugging Face image error in chat:', err.message);
      }
    }

    // ─── Generate text content ─────────────────────────────────────────────────
    const systemPrompt = `You are BrandForge AI — a world-class AI marketing assistant. You help users create social media captions, ad copy, email campaigns, SEO content, brand strategies, content calendars, and more. You are creative, concise, and always deliver high-quality marketing content. When a user asks for something specific (like an Instagram caption, ad copy, email, image idea, blog post, etc.), deliver the actual content — not a description of what you would do. Format your response with clear sections, bullet points, and emojis where appropriate to make it scannable and actionable. If an image is being generated alongside your response, focus on providing captions, hashtags, and usage tips for that image.`;

    let historyText = "";
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        historyText += `${msg.role === 'ai' ? 'Assistant' : 'User'}: ${msg.content}\n\n`;
      });
    }

    let content = await generateText(systemPrompt, `History:\n${historyText}\nUser: ${message}`);

    // ─── Smart fallback responses ──────────────────────────────────────────────
    if (!content) {
      if (wantsImage) {
        const subject = message
          .replace(/\b(create|generate|make|show me|give me|an?|the|for|with|and|please|can you|i want|image|picture|photo|banner|poster|illustration)\b/gi, '')
          .trim() || 'this visual';

        content = `🎨 **Image Generated for "${subject}"**\n\nYour visual is ready above! Here's how to use it:\n\n**📸 Caption Ideas:**\n• "Sometimes a picture says it all. ✨ ${subject.charAt(0).toUpperCase() + subject.slice(1)} — pure art."\n• "Bringing ${subject} to life — one frame at a time. 🎯"\n• "When creativity meets purpose. 💫 What do you think?"\n\n**#️⃣ Hashtags:**\n#${subject.replace(/\s+/g, '')} #AIGenerated #ContentCreation #BrandForge #DigitalMarketing #Creative\n\n**📱 Best Platforms for this visual:**\n• Instagram Feed / Reels cover\n• Facebook Post / Carousel\n• Pinterest Board\n• Twitter / X header\n\n**💡 Pro Tip:** Use this image as your hero visual and pair it with the captions above for maximum engagement!`;
      } else {
        content = `🤖 **BrandForge AI — Response for "${message}":**\n\n**Immediate Action Plan:**\n\n1️⃣ **Content Strategy** — Targeted content for Instagram, Facebook, LinkedIn, and TikTok\n\n2️⃣ **Ad Copy** — High-converting headlines, descriptions, and CTAs\n\n3️⃣ **Email Campaigns** — Welcome series, promotions, re-engagement flows\n\n4️⃣ **SEO Content** — Keyword-rich blog posts, landing pages, meta descriptions\n\n**💡 Quick Tips:**\n• Define your target audience (age, interest, pain point)\n• Choose 1–2 platforms to focus on first\n• Create 3 content pillars around your topic\n• Post consistently for 30 days and measure results\n\n**🎨 Try image generation:**\n• "Create a sunflower image with caption for Instagram"\n• "Generate a banner image for my summer sale"\n• "Make a product photo for my new sneaker drop"\n\nWant me to generate an image? Just ask! 🎨`;
      }
    }

    // ─── Save to history ───────────────────────────────────────────────────────
    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: wantsImage ? 'Image' : 'Chat',
        title: message.substring(0, 60),
        content,
        metadata: { imageUrl: imageUrl || undefined },
      });
    }

    res.json({ content, imageUrl: imageUrl || null });
  } catch (error) {
    console.error('Chat generation error:', error);
    res.status(500).json({ message: 'Failed to generate response' });
  }
};

// @desc    Generate banner image
// @route   POST /api/ai/banner
const generateBanner = async (req, res) => {
  try {
    require('dotenv').config({ override: true });
    const { prompt, style, size } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return res.status(400).json({ 
        message: 'Missing GEMINI_API_KEY in your backend/.env file.' 
      });
    }

    // Step 1: Enhance prompt with Gemini
    const geminiSystemPrompt = `You are an advanced AI-powered image prompt enhancement engine for a professional marketing and poster generation platform.

Your task is to convert short user topics into highly detailed, visually accurate, professional image generation prompts suitable for FLUX, SDXL, DALL·E, Stability AI, or similar AI image models.

The generated prompts must create outputs similar to ChatGPT or Gemini image quality.

OBJECTIVE:
Understand the actual meaning and intent behind the user's topic and automatically generate a complete professional visual concept instead of random unrelated images.

INSTRUCTIONS:
- Analyze the topic deeply before generating the prompt.
- Convert simple topics into professional marketing-quality image prompts.
- Generate realistic, cinematic, highly detailed visuals.
- Create visually meaningful scenes related to the topic.
- Add modern composition, lighting, environment, camera angle, branding style, and poster aesthetics.
- Automatically choose suitable colors and atmosphere based on the topic.
- Keep proper empty spacing for titles, headings, and promotional text.
- Make outputs suitable for:
  - social media posters
  - advertisements
  - banners
  - recruitment posters
  - educational creatives
  - business promotions
  - startup marketing
  - modern commercial designs

IMPORTANT RULES:
- Never generate random unrelated portraits.
- Avoid unnecessary focus on a single person unless required.
- Avoid robotic, neon, futuristic, cyberpunk, anime, cartoon, or fantasy styles unless explicitly requested.
- Do not create low-quality stock-image style compositions.
- Focus on professional marketing design intelligence.
- Generate realistic and commercially usable outputs.
- Prefer balanced compositions instead of close-up portraits.
- Include realistic business environments where necessary.
- Add cinematic lighting and premium visual quality.
- Make the prompt highly optimized for FLUX models.

NEGATIVE PROMPT:
blurry, low quality, distorted anatomy, extra fingers, ugly face, random portrait, unrelated people, neon glow, cyberpunk, robotic style, anime, cartoon, unrealistic lighting, oversaturated colors, watermark, bad composition, cropped objects, duplicate humans, deformed body, low resolution, text errors, messy layout

OUTPUT FORMAT:
Return ONLY the final enhanced image generation prompt.
Do not explain anything.
Do not add labels.
Do not add quotation marks.`;

    let enhancedPrompt = await generateText(geminiSystemPrompt, `USER TOPIC:\n${prompt} (${style || 'Modern'} style)`);
    if (!enhancedPrompt) {
       enhancedPrompt = prompt;
    }

    try {
      const imageUrl = await generateImage(enhancedPrompt);

      // Save to history
      if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
        await GeneratedContent.create({
          user: req.user._id,
          type: 'Banner',
          title: prompt.substring(0, 50),
          content: enhancedPrompt,
          metadata: { style, size, imageUrl },
        });
      }

      res.json({ imageUrl, enhancedPrompt });
    } catch (hfErr) {
      console.error('Pollinations Image Error:', hfErr.message);
      res.status(500).json({ message: 'Failed to generate banner image.' });
    }

  } catch (error) {
    console.error('Banner generation error:', error);
    res.status(500).json({ message: 'Internal server error during banner generation.' });
  }
};

module.exports = {
  generateSocialPost,
  generateAdCopy,
  generateEmail,
  generateSEO,
  generateChat,
  generateBanner,
};

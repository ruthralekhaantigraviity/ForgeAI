const GeneratedContent = require('../models/GeneratedContent');
const axios = require('axios');

const FormData = require('form-data');

// ─── Image generation via Stability AI ───────────────────────────────────────────



const generateImage = async (prompt, width = 1024, height = 1024) => {
  require('dotenv').config({ override: true });

  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey || hfKey === 'your_huggingface_api_key_here') {
    throw new Error('Missing or invalid HUGGINGFACE_API_KEY in your backend/.env file.');
  }

  try {
    console.log(`Attempting image generation via Hugging Face (${width}x${height})...`);
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      { 
        inputs: prompt,
        parameters: {
          width: width,
          height: height
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
          'Accept': 'image/jpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    const base64Image = Buffer.from(response.data).toString('base64');
    console.log('✅ Image generated via Hugging Face');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (err) {
    const errMsg = err.response ? Buffer.from(err.response.data).toString('utf-8') : err.message;
    console.error('⚠️ Hugging Face image generation failed:', errMsg);
    console.log('🔄 Falling back to Pollinations AI...');
    
    // Fallback to Pollinations AI
    // Truncate prompt to avoid URL length limit issues
    const safePrompt = prompt.substring(0, 800);
    const seed = Math.floor(Math.random() * 10000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
    
    console.log('✅ Image URL generated via Pollinations AI');
    return pollinationsUrl;
  }
};

// Helper: generate AI text using Gemini API
const generateText = async (systemPrompt, userPrompt, retries = 3) => {
  require('dotenv').config({ override: true });
  
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
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
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.warn("Gemini response missing text. Response:", JSON.stringify(response.data, null, 2));
      }
      return text || null;
    } catch (error) {
      const status = error.response?.status;
      if (status === 503 && attempt < retries) {
        console.warn(`Gemini API 503 error. Retrying attempt ${attempt + 1}/${retries} in 1.5 seconds...`);
        await new Promise(res => setTimeout(res, 1500));
        continue;
      }
      console.error('Gemini API Error:', error.response?.data || error.message);
      return null;
    }
  }
};

// Local fallbacks when Gemini is rate-limited / quota exceeded or key is invalid
const getLocalFallbackData = (platform, topic, tone) => {
  const cleanTopic = topic.trim();
  const lowerTopic = cleanTopic.toLowerCase();

  // Build a primary hashtag from the topic words
  const baseTag = cleanTopic
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  const primaryTag = baseTag ? `#${baseTag}` : '#BrandForge';

  // Helper: pick emoji + tone prefix
  const toneEmoji = { Professional: '🎯', Friendly: '😊', Funny: '😂', Luxury: '✨' }[tone] || '✨';

  // Platform-specific CTA
  const cta = {
    Instagram: 'Drop your thoughts in the comments! 👇 Follow for more!',
    LinkedIn: 'Share your experience in the comments. Let\'s connect! 🤝',
    'Twitter / X': 'Retweet if you agree! What\'s your take? 👇',
    Facebook: 'Tag someone who needs to see this! Share your thoughts below! 👇',
  }[platform] || 'Share your thoughts below! 👇';

  // Platform-specific hashtag suffixes
  const platformTags = {
    Instagram: ['#instagood', '#instadaily', '#explore', '#reels', '#photooftheday'],
    LinkedIn: ['#linkedin', '#professional', '#networking', '#career', '#growth'],
    'Twitter / X': ['#trending', '#viral', '#x', '#thread', '#twitterX'],
    Facebook: ['#facebook', '#facebookpage', '#community', '#share', '#viral'],
  }[platform] || ['#instagood', '#trending', '#viral', '#explore', '#photooftheday'];

  // ──────────────────────────────────────────────────────
  // Category Detection & Specific Content
  // ──────────────────────────────────────────────────────

  // 1. Food & Dining
  if (/pizza|food|dinner|cooking|recipe|burger|cafe|restaurant|eat|lunch|breakfast|coffee|dessert|cake|sushi|pasta|street food|snack/i.test(lowerTopic)) {
    const content = `${toneEmoji} There's nothing quite like ${cleanTopic} to bring people together and create unforgettable moments. 🍽️ From the first bite to the last, every detail is crafted to perfection. Life is too short for bad food — so why not treat yourself today?\n\n${cta}`;
    const hashtags = [primaryTag, '#foodie', '#foodporn', '#instafood', '#delicious', '#yummy', '#foodphotography', '#foodstagram', '#chefmode', '#recipeoftheday', '#eatlocal', '#tasty', '#foodlover', ...platformTags.slice(0, 2)];
    return { content, hashtags };
  }

  // 2. Nature, Travel & Outdoors
  if (/sunset|sunrise|beach|nature|mountain|lake|sky|forest|sun|sea|ocean|travel|adventure|explore|trip|vacation|journey|waterfall|river|garden|park/i.test(lowerTopic)) {
    const content = `${toneEmoji} ${cleanTopic} is one of those experiences that stays with you forever. 🌅 Nature has a way of putting everything into perspective — reminding us to slow down, breathe deeply, and soak in every beautiful moment around us.\n\n${cta}`;
    const hashtags = [primaryTag, '#naturephotography', '#wanderlust', '#landscape', '#beautifuldestinations', '#outdoors', '#travel', '#earthpix', '#scenicview', '#peaceful', '#exploremore', '#adventure', ...platformTags.slice(0, 3)];
    return { content, hashtags };
  }

  // 3. Fitness & Health
  if (/gym|fitness|workout|health|healthy|running|exercise|training|active|yoga|meditation|sport|diet|nutrition|muscle|strength/i.test(lowerTopic)) {
    const content = `${toneEmoji} Committed to ${cleanTopic}? You're already ahead of most! 💪 Every rep, every step, every healthy choice is an investment in the best version of yourself. Progress isn't always linear — but it's always worth it.\n\n${cta}`;
    const hashtags = [primaryTag, '#fitnessmotivation', '#gymlife', '#healthylifestyle', '#fitspiration', '#workout', '#noexcuses', '#strongertogether', '#progressnotperfection', '#wellness', '#fitfam', '#training', ...platformTags.slice(0, 3)];
    return { content, hashtags };
  }

  // 4. Tech, Business & Entrepreneurship
  if (/business|marketing|work|tech|technology|startup|entrepreneur|code|office|productivity|software|digital|ai|app|website|saas|innovation/i.test(lowerTopic)) {
    const content = `${toneEmoji} The future belongs to those who are building it today — and ${cleanTopic} is exactly where it starts. 🚀 In a world that moves fast, staying curious and adaptable is the ultimate competitive advantage. Are you keeping up?\n\n${cta}`;
    const hashtags = [primaryTag, '#startup', '#entrepreneurship', '#technology', '#marketing', '#productivity', '#digitaltransformation', '#businessgrowth', '#innovation', '#leadership', '#successmindset', '#techtrends', ...platformTags.slice(0, 3)];
    return { content, hashtags };
  }

  // 5. Fashion & Lifestyle
  if (/fashion|style|outfit|clothes|luxury|brand|beauty|makeup|skincare|lifestyle|aesthetic|design|art|photography|creative/i.test(lowerTopic)) {
    const content = `${toneEmoji} When it comes to ${cleanTopic}, every detail tells a story. 🎨 Style is more than what you wear — it's how you express who you are without saying a word. Own your aesthetic, own your story.\n\n${cta}`;
    const hashtags = [primaryTag, '#fashion', '#style', '#aesthetic', '#lifestyle', '#ootd', '#beauty', '#creative', '#artistic', '#design', '#luxury', '#brand', ...platformTags.slice(0, 3)];
    return { content, hashtags };
  }

  // 6. Education & Learning
  if (/learn|education|study|school|college|university|course|skill|knowledge|book|read|teach|tutorial|guide|tips/i.test(lowerTopic)) {
    const content = `${toneEmoji} Investing in ${cleanTopic} is one of the smartest things you can do for your future. 📚 Knowledge compounds — every lesson learned today multiplies into opportunities tomorrow. Never stop growing!\n\n${cta}`;
    const hashtags = [primaryTag, '#education', '#learning', '#knowledge', '#studygram', '#growthmindset', '#selfimprovement', '#skills', '#mentalhealth', '#motivated', '#lifelong learner', '#personaldevelopment', ...platformTags.slice(0, 3)];
    return { content, hashtags };
  }

  // 7. Music, Entertainment & Events
  if (/music|song|concert|event|party|festival|show|movie|film|game|sports|match|dance|performance|live/i.test(lowerTopic)) {
    const content = `${toneEmoji} ${cleanTopic} is the kind of experience that gives you goosebumps and memories that last a lifetime! 🎵 Whether you're there for the vibe, the energy, or the pure joy — this is what living is all about!\n\n${cta}`;
    const hashtags = [primaryTag, '#music', '#entertainment', '#event', '#liveshow', '#concert', '#vibes', '#experience', '#memories', '#fun', '#celebrate', '#community', ...platformTags.slice(0, 3)];
    return { content, hashtags };
  }

  // 8. General (Dynamic) Fallback — uses topic directly
  const content = `${toneEmoji} Today's focus: **${cleanTopic}**. 🎯 Every great achievement starts with a single step and an unwavering commitment to what matters most. Whether you're just beginning or already deep in the journey — keep pushing, keep creating, keep growing.\n\n${cta}`;
  const hashtags = [
    primaryTag,
    `${primaryTag}Vibes`,
    `${primaryTag}Journey`,
    '#instagood',
    '#photooftheday',
    '#aesthetic',
    '#contentcreator',
    '#creative',
    '#trending',
    '#dailyinspiration',
    '#mindset',
    '#motivated',
    ...platformTags.slice(0, 3)
  ];
  return { content, hashtags };
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

    // ─── Step 4 & 5: Generate content & hashtags ───
    const localFallback = getLocalFallbackData(platform, topic, tone);
    let content = null;
    let hashtags = [];

    const systemPrompt = `You are an expert ${platform} social media content creator. Your task is to write a caption SPECIFICALLY and ONLY about the topic given by the user — do NOT write a generic post.

Rules:
- The caption must be about "${topic}" — mention it naturally and specifically.
- Tone: ${tone || 'Professional'}. Match the energy of ${platform}.
- Include 2-3 relevant emojis.
- End with a clear call-to-action suited to ${platform}.
- Do NOT include any hashtags in the caption (they are added separately).
- Keep it between 3-6 sentences. Be specific, compelling, and platform-native.
- Never use generic phrases like "unleashing your potential" or "diving deep" that have nothing to do with the topic.`;
    const userPrompt = `Write a ${platform} caption about: ${topic}`;

    try {
      content = await generateText(systemPrompt, userPrompt);
    } catch (err) {
      console.error('Failed to generate caption text via Gemini:', err.message);
    }

    const hashtagSystemPrompt = `You are a ${platform} hashtag expert. Generate exactly 15 hashtags that are SPECIFICALLY relevant to the topic "${topic}" on ${platform}.

Rules:
- Mix 5 very popular hashtags, 5 niche topic-specific hashtags, and 5 ${platform}-native hashtags.
- All hashtags must be directly related to "${topic}" — not generic marketing tags.
- Return ONLY the hashtags separated by spaces, no explanations, no numbering.`;
    try {
      const hashtagContent = await generateText(hashtagSystemPrompt, `Topic: ${topic} | Platform: ${platform}`);
      if (hashtagContent) {
        hashtags = hashtagContent.match(/#\w+/g) || [];
      }
    } catch (err) {
      console.error('Failed to generate hashtags via Gemini:', err.message);
    }

    // Apply high-quality local fallbacks if API failed
    if (!content) {
      content = localFallback.content;
    }
    if (hashtags.length === 0) {
      hashtags = localFallback.hashtags;
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

    // Enhance image prompt for Ad
    const imageEnhanceSystemPrompt = `You are an expert ad designer. Convert the product description into a highly compelling, professional ad image description.
It should be suitable for AI image generation. Make it visually appealing, commercial, and focused on marketing.
Do not add any text on the image. Return ONLY the description, nothing else.`;

    let imagePrompt = product;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const enhanced = await generateText(imageEnhanceSystemPrompt, `Product: "${product}". Target audience: "${audience || 'General'}"`);
      if (enhanced) {
        imagePrompt = enhanced;
      }
    }

    let imageUrl = null;
    try {
      // Ads default to 1080x1080 (square feed ad)
      imageUrl = await generateImage(imagePrompt, 1080, 1080);
      console.log('✅ Ad image generated successfully');
    } catch (err) {
      console.error('Error generating ad image:', err);
    }

    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'Ad Copy',
        title: `${adType} ad for ${product.substring(0, 50)}`,
        content,
        metadata: { adType, audience, goal, imageUrl },
      });
    }

    res.json({ content, imageUrl, imagePrompt });
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
        metadata: { 
          imageUrl: imageUrl || undefined,
          userMessage: message 
        },
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
      // Parse width and height from size parameter (e.g. "1200x628")
      let width = 1200;
      let height = 628;
      if (size && size.includes('x')) {
        const parts = size.split('x');
        width = parseInt(parts[0], 10) || 1200;
        height = parseInt(parts[1], 10) || 628;
      }

      // Generate image (using generateImage which uses Hugging Face primary, Pollinations AI fallback)
      const imageUrl = await generateImage(enhancedPrompt, width, height);

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
    } catch (imgErr) {
      console.error('Image Generation Error:', imgErr.message);
      res.status(500).json({ message: 'Failed to generate banner image.' });
    }

  } catch (error) {
    console.error('Banner generation error:', error);
    res.status(500).json({ message: 'Internal server error during banner generation.' });
  }
};

// @desc    Edit/Regenerate an image with instructions
// @route   POST /api/ai/edit-image
const editImage = async (req, res) => {
  try {
    const { prompt, instructions, generatorType, size } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Original prompt or topic is required' });
    }

    const systemPrompt = `You are an expert AI image prompt engineer. 
Your task is to take an original image description and modify it according to the user's editing instructions.
Create a single cohesive new image prompt that incorporates the requested changes.
Keep the overall style, context, and elements of the original prompt unless the user wants to change them.
Return ONLY the final modified image prompt. Do not add any introduction, explanations, or quotes.`;

    let finalPrompt = `${prompt}. Changes to make: ${instructions}`;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const enhanced = await generateText(systemPrompt, `Original Prompt: "${prompt}"\nInstructions: "${instructions}"`);
      if (enhanced) {
        finalPrompt = enhanced;
      }
    }

    let imageUrl = '';
    if (generatorType === 'banner') {
      // Use Pollinations AI for banner
      let width = 1200;
      let height = 628;
      if (size && size.includes('x')) {
        const parts = size.split('x');
        width = parseInt(parts[0], 10) || 1200;
        height = parseInt(parts[1], 10) || 628;
      }
      const seed = Math.floor(Math.random() * 10000000);
      imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
    } else {
      // Use generateImage (which attempts Hugging Face, then falls back to Pollinations AI)
      imageUrl = await generateImage(finalPrompt);
    }

    res.json({ imageUrl, enhancedPrompt: finalPrompt });
  } catch (error) {
    console.error('Edit image error:', error);
    res.status(500).json({ message: 'Failed to edit image.' });
  }
};

// @desc    Upload a user photo and apply AI edits
// @route   POST /api/ai/upload-edit
const uploadAndEditImage = async (req, res) => {
  try {
    const { imageBase64, instructions, size } = req.body;

    if (!imageBase64 || !instructions) {
      return res.status(400).json({ message: 'Image and instructions are required.' });
    }

    // Use Gemini Vision to understand the uploaded image and build an edit prompt
    const geminiKey = process.env.GEMINI_API_KEY;
    let editedPrompt = `A photo that has been edited: ${instructions}. High quality, professional photo editing result.`;

    if (geminiKey) {
      try {
        // Strip data URL prefix to get pure base64
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  }
                },
                {
                  text: `You are an expert photo editing AI. Analyze this image and generate a detailed image generation prompt that recreates this image with the following edits applied: "${instructions}". 
Return ONLY the image generation prompt, no explanations or quotes. Be very descriptive about the visual elements, style, lighting, colors, and composition of the edited result.`
                }
              ]
            }]
          }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          editedPrompt = text.trim();
        }
      } catch (geminiErr) {
        console.error('Gemini Vision error:', geminiErr.message);
        // Fall back to simple prompt
        editedPrompt = `Photo with the following edits applied: ${instructions}. High quality, realistic result.`;
      }
    }

    // Generate the edited image using HuggingFace / Fallback
    let width = 1024, height = 1024;
    if (size && size.includes('x')) {
      const parts = size.split('x');
      width = parseInt(parts[0], 10) || 1024;
      height = parseInt(parts[1], 10) || 1024;
    }

    const imageUrl = await generateImage(editedPrompt, width, height);

    // Save to history if logged in
    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'Image',
        title: `Photo edit: ${instructions.substring(0, 50)}`,
        content: editedPrompt,
        metadata: { imageUrl, instructions },
      });
    }

    res.json({ imageUrl, enhancedPrompt: editedPrompt });
  } catch (error) {
    console.error('Upload & edit error:', error);
    res.status(500).json({ message: 'Failed to process and edit the uploaded image.' });
  }
};

module.exports = {
  generateSocialPost,
  generateAdCopy,
  generateEmail,
  generateSEO,
  generateChat,
  generateBanner,
  editImage,
  uploadAndEditImage,
};

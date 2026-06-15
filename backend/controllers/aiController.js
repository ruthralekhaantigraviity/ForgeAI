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
const generateText = async (systemPrompt, userPrompt, retries = 3, base64Image = null) => {
  require('dotenv').config({ override: true });
  
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return null;
  }

  // Try models in order of preference
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ];

  for (const model of models) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const parts = [{ text: systemPrompt + '\n\n' + userPrompt }];
        if (base64Image) {
          const base64Data = base64Image.split(',')[1] || base64Image;
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          });
        }

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          { contents: [{ parts }] },
          { timeout: 20000 }
        );
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.warn(`Gemini [${model}] response missing text.`);
        }
        if (text) {
          console.log(`✅ Text generated via Gemini model: ${model}`);
          return text;
        }
      } catch (error) {
        const status = error.response?.status;
        if ((status === 503 || status === 429) && attempt < retries) {
          console.warn(`Gemini [${model}] ${status} error. Retrying attempt ${attempt + 1}/${retries} in 1s...`);
          await new Promise(res => setTimeout(res, 1000));
          continue;
        }
        console.warn(`Gemini [${model}] failed (${status}). Trying next model...`);
        break; // Try next model
      }
    }
  }

  console.error('All Gemini models failed.');
  return null;
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
  const toneLines = {
    Professional: `In today's competitive landscape, ${cleanTopic} stands out as a key driver of success. 🎯 Businesses that invest in this area consistently see stronger results and deeper customer loyalty.`,
    Friendly: `We're SO excited about ${cleanTopic} and we think you will be too! 😊 It's one of those things that just makes everything better — come see what the buzz is about!`,
    Funny: `Nobody asked for a hot take on ${cleanTopic}, but here we are and honestly? Best decision ever. 😂 You're welcome.`,
    Luxury: `${cleanTopic} — because only the finest will do. ✨ An experience curated for those who appreciate the extraordinary.`,
  };
  const content = `${toneLines[tone] || `${toneEmoji} ${cleanTopic} is something worth talking about. Whether you're just discovering it or already a fan, there's always something new to explore and appreciate. 🎯`}\n\n${cta}`;
  const hashtags = [
    primaryTag,
    `#${baseTag}Tips`,
    `#${baseTag}Life`,
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
      const goalVerb = { Conversions: 'buy now', 'Brand Awareness': 'learn more', 'Lead Generation': 'sign up free', 'App Installs': 'download now', Engagement: 'join the conversation' }[goal] || 'get started';
      const productShort = product.length > 60 ? product.substring(0, 60) + '...' : product;
      content = `📢 ${adType || 'Facebook'} Ad — ${goal || 'Conversions'}\n\n🎯 Headline:\n"${productShort} — The Smart Choice for ${audience || 'Everyone'}"\n\n📝 Primary Text:\nLooking for the best in ${product}? You've found it. Here's why thousands of ${audience || 'customers'} trust us:\n\n✅ Proven results with ${product}\n✅ Tailored for ${audience || 'every need'}\n✅ Optimized for ${goal || 'conversions'} from day one\n\n${audience ? `Specifically designed for ${audience} who want to achieve more.` : 'Trusted by businesses worldwide.'}\n\n👉 CTA: "${goalVerb.charAt(0).toUpperCase() + goalVerb.slice(1)} →"\n\n📌 Description:\nDon't miss out — ${productShort} is changing the game for ${audience || 'people'} who want real results.`;
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
    const { emailType, recipientName, senderName, companyName, purpose, tone } = req.body;

    const resolvedType = emailType || 'Professional Email';
    const recipient = recipientName || 'Sir/Madam';
    const sender = senderName || 'The Team';
    const company = companyName || '';

    if (!purpose) {
      return res.status(400).json({ message: 'Purpose is required' });
    }

    const systemPrompt = `You are an expert professional email writer. Your job is to generate a well-structured, context-appropriate email.

STRICT RULES:
- Email Type: "${resolvedType}" — the email MUST match this type exactly in style, structure, and intent.
- Do NOT generate promotional, marketing, or welcome-style content UNLESS the email type is specifically "Welcome Email", "Promotional Email", "Newsletter", "Sales Email", or "Marketing" related.
- For HR types (Termination Letter, Offer Letter, Warning Letter, Promotion Announcement, etc.): use formal corporate HR language. Be direct, respectful, and legally careful.
- For PR types (Press Release, Partnership Request, Meeting Request): use formal business communication style.
- For Apology or Empathetic emails: use a warm, sincere, and accountable tone.
- Tone to use: ${tone || 'Professional'}.
- Adapt greetings and closings to fit the email type and tone.

OUTPUT FORMAT — Return EXACTLY in this format, no extra commentary:

Subject: [Generated Subject Line]

Dear ${recipient},

[Email Body — clear, relevant paragraphs matching the email type]

Best regards,
${sender}${company ? `\n${company}` : ''}`;

    const userPrompt = `Generate a ${resolvedType} with the following details:
- Email Type: ${resolvedType}
- Recipient: ${recipient}
- Sender: ${sender}${company ? `\n- Company: ${company}` : ''}
- Tone: ${tone || 'Professional'}
- Purpose / Key Details: ${purpose}`;

    let content = await generateText(systemPrompt, userPrompt);

    // ── Smart dynamic fallbacks per email type ──
    if (!content) {
      const et = resolvedType.toLowerCase();

      if (et.includes('termination')) {
        content = `Subject: Termination of Employment — ${recipient}\n\nDear ${recipient},\n\nWe regret to inform you that your employment with ${company || 'the company'} has been terminated, effective immediately.\n\n${purpose}\n\nPlease return all company property and complete the exit formalities at your earliest convenience. Your final settlement will be processed as per the terms of your employment agreement.\n\nWe appreciate your contributions during your tenure and wish you the best in your future endeavors.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('offer')) {
        content = `Subject: Job Offer — ${resolvedType} from ${company || sender}\n\nDear ${recipient},\n\nWe are pleased to extend this formal offer of employment to you.\n\n${purpose}\n\nPlease review the attached offer letter carefully and confirm your acceptance by the date specified. Should you have any questions, do not hesitate to reach out.\n\nWe look forward to welcoming you to our team.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('warning')) {
        content = `Subject: Formal Warning Notice — ${recipient}\n\nDear ${recipient},\n\nThis letter serves as a formal written warning regarding the matter outlined below.\n\n${purpose}\n\nWe expect immediate and sustained improvement in the areas mentioned above. Failure to comply may result in further disciplinary action, up to and including termination of employment.\n\nPlease acknowledge receipt of this letter by signing the attached copy.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('promotion')) {
        content = `Subject: Congratulations on Your Promotion — ${recipient}\n\nDear ${recipient},\n\nIt is with great pleasure that we formally announce your promotion, effective immediately.\n\n${purpose}\n\nYour dedication, hard work, and consistent performance have made you an invaluable member of our team. We are confident you will excel in your new role.\n\nCongratulations once again, and we look forward to your continued growth.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('meeting')) {
        content = `Subject: Meeting Request — ${purpose.substring(0, 50)}\n\nDear ${recipient},\n\nI hope this email finds you well. I am writing to request a meeting at your earliest convenience.\n\n${purpose}\n\nPlease let me know your availability and I will arrange the meeting accordingly. I am flexible with timing and happy to accommodate your schedule.\n\nThank you for your time, and I look forward to hearing from you.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('apology')) {
        content = `Subject: Sincere Apology — ${company || sender}\n\nDear ${recipient},\n\nI am writing to sincerely apologize for the inconvenience caused.\n\n${purpose}\n\nWe take full responsibility for this matter and are committed to ensuring it does not happen again. We deeply value your trust and are taking immediate steps to resolve the situation.\n\nThank you for your patience and understanding.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('press release') || et.includes('release')) {
        content = `Subject: FOR IMMEDIATE RELEASE — ${company || sender} Announces Update\n\nDear ${recipient},\n\n${company || sender} is pleased to announce the following:\n\n${purpose}\n\nFor further information or media inquiries, please contact us directly.\n\nAbout ${company || sender}:\nWe are committed to delivering excellence in everything we do.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('partnership')) {
        content = `Subject: Partnership Opportunity — ${company || sender}\n\nDear ${recipient},\n\nI hope this message finds you well. I am reaching out to explore a potential partnership opportunity.\n\n${purpose}\n\nWe believe this collaboration would be mutually beneficial, and I would love to schedule a call to discuss this further at your convenience.\n\nThank you for considering this opportunity. I look forward to your response.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('follow-up') || et.includes('followup')) {
        content = `Subject: Follow-up: ${purpose.substring(0, 50)}\n\nDear ${recipient},\n\nI hope you are doing well. I am following up regarding our previous conversation.\n\n${purpose}\n\nPlease let me know if you need any additional information or if there is anything I can do to assist. I look forward to your response.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else if (et.includes('sales') || et.includes('promotional')) {
        content = `Subject: Exclusive Offer from ${company || sender} — Don't Miss Out!\n\nDear ${recipient},\n\n${purpose}\n\nWe'd love for you to take advantage of this opportunity. Click the link below or reply to this email to get started.\n\nLooking forward to hearing from you!\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;

      } else {
        // Generic professional fallback
        content = `Subject: ${resolvedType} — ${purpose.substring(0, 50)}\n\nDear ${recipient},\n\nI hope this email finds you well.\n\n${purpose}\n\nPlease feel free to reach out if you have any questions or require further clarification. I am happy to assist.\n\nBest regards,\n${sender}${company ? `\n${company}` : ''}`;
      }
    }

    if (req.user && req.user._id && !String(req.user._id).startsWith('guest')) {
      await GeneratedContent.create({
        user: req.user._id,
        type: 'Email',
        title: `${resolvedType}${recipient !== 'Sir/Madam' ? ` to ${recipient}` : ''}`,
        content,
        metadata: { emailType: resolvedType, tone, purpose },
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
      const yr = new Date().getFullYear();
      const industryLabel = industry || 'Business';
      const wc = parseInt(wordCount) || 800;
      const ct = contentType || 'Blog Post';
      content = `# ${ct}: ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} — A Complete ${industryLabel} Guide (${yr})\n\n**Meta Title:** ${keyword} for ${industryLabel} — ${yr} Expert Guide\n**Meta Description:** Everything ${industryLabel} professionals need to know about ${keyword}. Practical, actionable, and up to date for ${yr}.\n**Target Keyword:** ${keyword}\n**Related Keywords:** best ${keyword}, ${keyword} tips, ${keyword} for ${industryLabel.toLowerCase()}, how to use ${keyword}, ${keyword} strategy\n\n---\n\n## Introduction\n\nIn ${yr}, **${keyword}** has become one of the most important topics in the ${industryLabel} space. Whether you're a seasoned professional or just getting started, understanding ${keyword} is essential to staying ahead of your competition.\n\nThis ${ct.toLowerCase()} covers everything you need to know — from the basics to advanced strategies — in a clear, actionable format.\n\n---\n\n## What Is ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}?\n\n${keyword.charAt(0).toUpperCase() + keyword.slice(1)} refers to the practices, tools, and strategies used by ${industryLabel.toLowerCase()} professionals to achieve better outcomes. In simple terms, it's about working smarter, not harder, to reach your goals.\n\n---\n\n## Why ${keyword} Matters for ${industryLabel}\n\n- **Competitive advantage:** Companies that master ${keyword} outperform their peers consistently\n- **Customer satisfaction:** ${keyword} directly impacts the experience you deliver\n- **Cost efficiency:** A solid ${keyword} strategy reduces wasted resources\n- **Measurable results:** Track your progress with clear KPIs and benchmarks\n\n---\n\n## Top Strategies for ${keyword} in ${yr}\n\n### 1. Start with Research\nUnderstand your audience's pain points around ${keyword} before creating any content or campaigns. Use surveys, interviews, and data analytics to guide your strategy.\n\n### 2. Create High-Quality Content\nContent built around **${keyword}** should be specific, actionable, and tailored to ${industryLabel.toLowerCase()} professionals. Quality always beats quantity.\n\n### 3. Optimize for Search\nInclude **${keyword}** naturally in your titles, headings, meta descriptions, and body text. Avoid keyword stuffing — Google rewards readability.\n\n### 4. Measure and Iterate\nSet clear KPIs, track performance monthly, and update your ${keyword} strategy based on what the data tells you.\n\n---\n\n## Common Mistakes to Avoid\n\n- Treating ${keyword} as a one-time task rather than an ongoing strategy\n- Ignoring your ${industryLabel.toLowerCase()} audience's specific needs\n- Focusing on quantity of content over quality\n- Failing to track measurable results\n\n---\n\n## Conclusion\n\nMastering **${keyword}** is a journey, not a destination. With the right strategy, tools, and consistent effort, any ${industryLabel.toLowerCase()} professional can see transformative results. Start today — your competitors already have.\n\n*Estimated reading time: ${Math.ceil(wc / 200)} minutes | Word count: ~${wc} words*`;
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
        const subjectTag = subject.replace(/\s+/g, '');

        content = `🎨 **Image Generated for "${subject}"**\n\nYour visual is ready above! Here are some ways to use it effectively:\n\n**📸 Caption Ideas:**\n• "${subject.charAt(0).toUpperCase() + subject.slice(1)} — exactly what the moment called for. ✨"\n• "Every detail of ${subject} crafted with intention. What do you think? 🎯"\n• "${subject.charAt(0).toUpperCase() + subject.slice(1)}, captured perfectly. Save this one. 💫"\n\n**#️⃣ Hashtags:**\n#${subjectTag} #${subjectTag}Vibes #${subjectTag}Photography #AIGenerated #ContentCreation #BrandForge #DigitalMarketing #Creative #VisualContent #MarketingDesign\n\n**📱 Best Platforms for this visual:**\n• Instagram Feed / Reels cover\n• Facebook Post / Carousel\n• Pinterest Board\n• Twitter / X header\n\n**💡 Pro Tip:** Pair this ${subject} visual with a strong first-line hook to boost your reach by up to 3x!`;
      } else {
        // Build a truly topic-specific response using the user's actual message
        const msgClean = message.trim();
        const firstWord = msgClean.split(' ')[0];
        content = `🤖 **BrandForge AI — Here's your plan for "${msgClean}":**\n\n**📋 What You Asked For:**\n"${msgClean}"\n\n**🚀 Recommended Action Plan:**\n\n1️⃣ **Define Your Goal** — For "${msgClean}", decide whether your priority is awareness, leads, sales, or engagement. Each requires a different approach.\n\n2️⃣ **Create Platform-Specific Content** — "${msgClean}" performs differently on each platform:\n   • **Instagram**: Short, visual caption with strong hook + 5-10 hashtags\n   • **LinkedIn**: Professional insight post with 3 key takeaways\n   • **Twitter/X**: Thread format with concise, punchy points\n   • **Facebook**: Conversational post with a question CTA\n\n3️⃣ **Craft Your Message** — For "${msgClean}", lead with the problem you solve, follow with your unique value, and end with a clear CTA.\n\n4️⃣ **Generate Supporting Assets** — Ask me to:\n   • "Create an Instagram caption about ${firstWord}"\n   • "Write a sales email for ${firstWord}"\n   • "Generate a banner image for ${firstWord}"\n   • "Write SEO blog post about ${firstWord}"\n\n**💡 Quick Wins for "${msgClean}":**\n• Start with one platform, master it, then expand\n• Post consistently for 30 days before judging results\n• Repurpose every piece of content across 3+ formats\n\nTry one of the specific tools in the sidebar for best results! 🎯`;
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
    const { prompt, style, size, originalImageBase64 } = req.body;
    
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
    let geminiSystemPrompt = `You are an advanced AI-powered image prompt enhancement engine for a professional marketing and poster generation platform.

Your task is to convert short user topics into highly detailed, visually accurate, professional image generation prompts suitable for FLUX, SDXL, DALL·E, Stability AI, or similar AI image models.

OBJECTIVE:
Understand the actual meaning and intent behind the user's topic and automatically generate a complete professional visual concept.

INSTRUCTIONS:
- Analyze the topic deeply before generating the prompt.
- Generate realistic, cinematic, highly detailed visuals.
- Create visually meaningful scenes related to the topic.
- Add modern composition, lighting, environment, camera angle, branding style, and poster aesthetics.
- Keep proper empty spacing for titles, headings, and promotional text.
- Make outputs suitable for professional marketing graphics.

IMPORTANT RULES:
- Avoid robotic, neon, futuristic, cyberpunk, anime, cartoon, or fantasy styles unless explicitly requested.
- Focus on professional marketing design intelligence.
- Generate realistic and commercially usable outputs.
- Include realistic business environments where necessary.
- Add cinematic lighting and premium visual quality.

NEGATIVE PROMPT:
blurry, low quality, distorted anatomy, extra fingers, ugly face, random portrait, unrelated people, neon glow, cyberpunk, robotic style, anime, cartoon, unrealistic lighting, oversaturated colors, watermark, bad composition, cropped objects, duplicate humans, deformed body, low resolution, text errors, messy layout

OUTPUT FORMAT:
Return ONLY the final enhanced image generation prompt.
Do not explain anything.`;

    let userPromptText = `USER TOPIC:\n${prompt} (${style || 'Modern'} style)`;

    // If an original image is provided, we tell the Vision model to preserve its setting
    if (originalImageBase64) {
      geminiSystemPrompt += `

CRITICAL INSTRUCTION FOR IMAGE EDITING:
An original image is provided. The user wants to edit this image by adding elements or changing the atmosphere (e.g. "add a sunrise").
YOU MUST:
1. Carefully analyze the setting, environment, background, and landscape of the provided image.
2. PRESERVE that exact setting in your generated prompt. Do NOT change a rocky ocean into a city, or a forest into a desert, unless the user explicitly asks to change the location.
3. Incorporate the user's requested edit INTO the original setting.
4. Describe the preserved background + the user's new additions cohesively.`;
      
      userPromptText = `I have attached the original image. PRESERVE ITS ORIGINAL SETTING AND BACKGROUND LOCATION EXACTLY. Add the following user edit to that setting: "${prompt}"`;
    }

    let enhancedPrompt = await generateText(geminiSystemPrompt, userPromptText, 3, originalImageBase64);
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

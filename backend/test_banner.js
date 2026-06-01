require('dotenv').config();
const axios = require('axios');

async function test() {
  console.log("Testing APIs...");
  const geminiKey = process.env.GEMINI_API_KEY;
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  
  if(!geminiKey || !hfKey) {
    console.log("Keys missing in .env");
    return;
  }

  // 1. Test Gemini
  let enhancedPrompt = "A beautiful sunset over the ocean, digital art";
  try {
    console.log("Calling Gemini...");
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [{
          parts: [{ text: `Convert this to a highly detailed prompt: ${enhancedPrompt}` }]
        }]
      }
    );
    const text = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini Success. Enhanced Prompt:", text ? text.substring(0, 100) + "..." : "none");
    if(text) enhancedPrompt = text.trim();
  } catch (e) {
    console.error("Gemini Error:", e.response?.data || e.message);
  }

  // 2. Test Hugging Face
  try {
    console.log("Calling Hugging Face FLUX.1-schnell...");
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      { inputs: enhancedPrompt },
      {
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    console.log("HF Success! Received bytes:", hfResponse.data.length);
  } catch (e) {
    console.error("HF Error:", e.response ? Buffer.from(e.response.data).toString('utf-8') : e.message);
  }
}

test();

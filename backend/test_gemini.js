require('dotenv').config();
const axios = require('axios');

const generateText = async (systemPrompt, userPrompt) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.log("No GEMINI_API_KEY");
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

(async () => {
  const res = await generateText("Reply with 'Hello'", "Say hi");
  console.log("Result:", res);
})();

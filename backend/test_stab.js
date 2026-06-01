require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function test() {
  try {
    const formData = new FormData();
    formData.append('prompt', "A cute cat");
    formData.append('output_format', 'png');
  
    const apiKey = process.env.STABILITY_API_KEY.trim();
    if (!apiKey) throw new Error("No API key");
    console.log("Key length:", apiKey.length, "Starts with:", apiKey.substring(0, 3));

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        responseType: "arraybuffer",
      }
    );
    console.log("Success! Status:", response.status);
    console.log("Data length:", response.data.length);
  } catch(e) {
    console.error("Error:", e.response ? e.response.data.toString() : e.message);
  }
}
test();

// test_api.js
// Script to test AI generation endpoints and output results
const axios = require('axios');

const baseURL = 'http://localhost:5000/api/ai';

async function testEndpoint(path, payload) {
  try {
    const res = await axios.post(`${baseURL}/${path}`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000,
    });
    console.log(`=== ${path} SUCCESS ===`);
    console.log(JSON.stringify(res.data, null, 2));
    return { success: true, data: res.data };
  } catch (err) {
    console.error(`=== ${path} ERROR ===`);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
    return { success: false, error: err };
  }
}

(async () => {
  // Banner
  await testEndpoint('banner', { prompt: 'Sunny beach sunset', style: 'Modern', size: '1200x628' });
  // Social (Sunset)
  await testEndpoint('social', { platform: 'Instagram', topic: 'Sunset vibes', tone: 'Friendly' });
  // Social (Generic)
  await testEndpoint('social', { platform: 'Instagram', topic: 'New learning methods', tone: 'Professional' });
  // Ad Copy
  await testEndpoint('ad-copy', { adType: 'Facebook', product: 'Eco-friendly water bottle', audience: 'Outdoor enthusiasts', goal: 'Conversions' });
  // Email
  await testEndpoint('email', { emailType: 'Welcome', brand: 'EcoBrand', audience: 'Subscribers', keyMessage: 'Sustainability' });
  // SEO
  await testEndpoint('seo', { contentType: 'Blog Post', keyword: 'sustainable living', industry: 'Eco', wordCount: 500 });
})();

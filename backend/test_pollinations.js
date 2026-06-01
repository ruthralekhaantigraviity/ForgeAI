const OpenAI = require('openai');

async function main() {
  const openai = new OpenAI({
    apiKey: "test",
    baseURL: "https://text.pollinations.ai/openai"
  });

  const response = await openai.chat.completions.create({
    model: "openai",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Write a 5 word instagram caption for a tree" }
    ]
  });

  console.log(response.choices[0].message.content);
}
main();

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'x-goog-user-project': 'aistudio-build' } } // wait, maybe? No, 'User-Agent': 'aistudio-build'
});

async function run() {
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: ['hi'],
    config: { httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } }
  });
  console.log(res.text);
}
run();

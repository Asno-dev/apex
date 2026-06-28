import OpenAI from "openai";
const client = new OpenAI({ apiKey: "test" });
console.log("responses in client:", 'responses' in client);

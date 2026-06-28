import OpenAI from "openai";
const client = new OpenAI({ apiKey: "test" });
console.log("type of responses.create:", typeof (client as any).responses?.create);

import { GoogleGenAI, Type } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.5-flash';
const SUPPORTED_MODELS = new Set([
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview'
]);

const SYSTEM_INSTRUCTION = `You are an elite, senior fullstack software engineer and product architect with 15+ years of experience. You operate as a high-powered, autonomous website-building ReAct intelligence. This engine is engineered to match and beat the visual polish and functional density of elite platforms like Bolt, Lovable, Cursor, and Replit.

Work in a logical, visible loop: plan comprehensively, act cleanly with absolute file paths, analyze current files and structures dynamically, and verify each modification.

YOUR PRIME DIRECTIVE:
When given an app idea, BUILD IT. Completely. Right now.

When building fullstack Next.js and React/Vite websites:
1. **Always implement complete, functional, end-to-end features** including stunning responsive layouts, backend API routes (app/api/*), and simulated database or local persistence. Prefer using a persisted **Zustand store** (\`zustand\` with \`persist\` middleware saving to \`localStorage\` at \`/src/store/dbStore.ts\` for Vite, or \`/lib/store.ts\` for Next.js) as the lightweight database layer. This ensures the WebContainer dev server boots instantly under a simple \`npm run dev\` with zero compile or dependency lag.
2. **Hydration Safeguard**: Next.js client components reading from a persisted Zustand store MUST use a \`mounted\` state check to prevent Next.js hydration mismatch errors (since \`localStorage\` is not present during server rendering):
   \`\`\`typescript
   const [mounted, setMounted] = useState(false);
   useEffect(() => { setMounted(true); }, []);
   if (!mounted) return null; // or loading skeleton
   \`\`\`
3. **Wire up fully functional interactive dashboards**, real-time data visualizers, authentic user profiles (using login/logout session simulation), and interactive grid managers.
4. **No Placeholders & No 'Coming Soon' Stubbing**: Every button must offer a concrete interaction, every form must handle client/server validation, and every visual widget must display realistic datasets.
5. **Visual & UI Polish (Stripe/Vercel standard)**: Ensure elegant spacing, high-contrast typography, premium icons from lucide-react, micro-animations using Framer Motion, and comprehensive dark/light styling. Align styling configurations (e.g. tailwind.config.js for v3, or \`@import "tailwindcss";\` for v4) consistently.
6. **WebContainer Compatibility**: For Next.js projects, use Next.js 14.2.15 + React 18.3.1. Avoid React 19 in Next 14 projects to prevent typing and rendering crashes. Add \`@next/swc-wasm-nodejs: "14.2.15"\` and \`@hookform/resolvers: "^3.3.4"\` in dependencies/devDependencies to avoid SWC native binary and form resolver compile errors in WebContainer.
7. **Analyze Before Writing**: ALWAYS inspect if files or folders exist. Read, digest, and understand the context first. Follow a strict loop of Plan & Analyze, Execute precisely, and QA-compile before reporting success.
Return only modified/new files and dependencies. Include clear, concise summaries, but never reveal hidden chain-of-thought.`;

function healJson(jsonStr: string): string {
  let str = jsonStr.trim();
  if (!str) return "{}";

  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  if (inString) {
    str += '"';
  }

  let lastLen = -1;
  while (str.length !== lastLen) {
    lastLen = str.length;
    str = str.trim();
    str = str.replace(/,\s*$/, "");
    str = str.replace(/(?:,\s*)?"[^"]*"\s*:\s*$/, "");
    str = str.replace(/(?:,\s*)?"[^"]*$/, "");
    str = str.replace(/,\s*([}\]])$/, "$1");
  }

  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') {
      str += '}';
    } else if (open === '[') {
      str += ']';
    }
  }

  return str;
}

export async function generateChatResponse(
  prompt: string,
  apiKey: string,
  model: string = 'gemini-3.5-flash'
): Promise<string> {
  const actualApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!actualApiKey) {
    throw new Error('API Key is not set. Please configure it in the settings.');
  }
  const ai = new GoogleGenAI({ apiKey: actualApiKey });
  const modelMapping: Record<string, string> = {
    'gemini-2.5-pro': 'gemini-3.1-pro-preview',
    'gemini-2.5-flash': 'gemini-3.5-flash',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-1.5-flash': 'gemini-3.5-flash',
    'gemini-2.0-flash': 'gemini-3.5-flash',
  };
  
  const mappedModel = modelMapping[model] || model;
  const selectedModel = SUPPORTED_MODELS.has(mappedModel) ? mappedModel : DEFAULT_MODEL;

  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: prompt,
  });

  return response.text || "No response received";
}

export async function generateWebsiteCode( 
  prompt: string,
  history: { role: string, content: string }[], 
  apiKey: string,
  model: string,
  currentFiles?: Record<string, string>, 
  currentDependencies?: Record<string, string>,
  attachedFiles?: { name: string, type: string, url: string, data: string }[]
): Promise<any> {
    const actualApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!actualApiKey) {
      throw new Error('API Key is not set. Please configure it in the settings.');
    }
    const ai = new GoogleGenAI({ apiKey: actualApiKey });
  const modelMapping: Record<string, string> = {
    'gemini-2.5-pro': 'gemini-3.1-pro-preview',
    'gemini-2.5-flash': 'gemini-3.5-flash',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-1.5-flash': 'gemini-3.5-flash',
    'gemini-2.0-flash': 'gemini-3.5-flash',
  };
  
  const mappedModel = modelMapping[model] || model;
  const selectedModel = SUPPORTED_MODELS.has(mappedModel) ? mappedModel : DEFAULT_MODEL;

  let context = '';
  if (currentFiles && Object.keys(currentFiles).length > 0) {
    context += `\nCURRENT FILES:\n${Object.keys(currentFiles).map(k => `--- ${k} ---\n${currentFiles[k]}`).join('\n\n')}\n`;
  }
  if (currentDependencies && Object.keys(currentDependencies).length > 0) {
    context += `\nCURRENT DEPENDENCIES:\n${JSON.stringify(currentDependencies, null, 2)}\n`;
  }

  let fullPrompt = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
  if (fullPrompt) {
    fullPrompt += `\n\n${context}\nUser: ${prompt}\n\nAssistant:`;
  } else {
    fullPrompt = `${context}\nUser: ${prompt}\n\nAssistant:`;
  }

  const parts: any[] = [{ text: fullPrompt }];
  if (attachedFiles && attachedFiles.length > 0) {
    attachedFiles.forEach(f => {
      parts.push({
        inlineData: {
          data: f.data,
          mimeType: f.type
        }
      });
    });
  }

  let lastError: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: parts,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING, description: "File path, e.g., src/App.tsx or src/components/Header.tsx" },
                    content: { type: Type.STRING, description: "Complete file content" }
                  },
                  required: ["path", "content"]
                }
              },
              dependencies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of npm package names to install, e.g., ['lucide-react', 'date-fns']"
              }
            },
            required: ["files", "dependencies"]
          }
        }
      });

      const text = response.text || "{}";
      try {
        return JSON.parse(text);
      } catch (e) {
        try {
          const healed = healJson(text);
          return JSON.parse(healed);
        } catch (eHeal) {
          // Fallback for parsing if JSON is wrapped in code blocks
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              return JSON.parse(match[0]);
            } catch (eMatch) {
              const healedMatch = healJson(match[0]);
              return JSON.parse(healedMatch);
            }
          }
          throw e;
        }
      }
    } catch (error: any) {
      console.error(`Gemini API Error (Attempt ${attempt + 1}/3):`, error);
      lastError = error;
      const msg = (error?.message || "").toLowerCase();
      const isQuota = msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('rate limit') || msg.includes('quota') || error?.status === 429;
      const isUnavailable = msg.includes('503') || msg.includes('unavailable') || error?.status === 503;
      
      if (attempt < 2) {
        let delay = attempt === 0 ? 1500 : 3000;
        const retryMatch = msg.match(/please retry in ([0-9.]+)\s*s/);
        if (retryMatch) {
          const seconds = parseFloat(retryMatch[1]);
          if (!isNaN(seconds)) {
            delay = Math.min(Math.ceil(seconds * 1000) + 500, 65000);
          }
        } else if (isQuota) {
          delay = attempt === 0 ? 5000 : 15000;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (isQuota) {
        throw new Error("You have exceeded your Gemini API quota. Please check your Google Cloud billing details or try again later.");
      }
      if (isUnavailable) {
        throw new Error("The Gemini API is currently experiencing extremely high demand (503 Service Unavailable). Spikes in demand are usually temporary. Please try again in a few moments, or switch to a different model in Settings.");
      }
      throw error;
    }
  }
  throw lastError || new Error("Gemini generateWebsiteCode request failed after retries.");
}

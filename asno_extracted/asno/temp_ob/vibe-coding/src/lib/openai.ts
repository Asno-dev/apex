import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

const SYSTEM_INSTRUCTION = `You are AI Studio's single autonomous ReAct agent.
Work in a visible loop: understand the request, plan briefly, act with controlled workspace tools, observe results, repair when needed, and report clearly.
When building fullstack Next.js and React/Vite websites:
1. Always implement end-to-end functionality including frontend, backend API routes (app/api/*), and simulated database storage. Prefer using a persisted **Zustand store** (\`zustand\` with \`persist\` middleware saving to \`localStorage\` at \`/src/store/dbStore.ts\` for Vite, or \`/lib/store.ts\` for Next.js) as the lightweight database layer. This ensures the WebContainer dev server boots instantly under a simple \`npm run dev\` in several milliseconds with zero compile or dependency lag.
2. **Hydration Safeguard**: Next.js client components reading from a persisted Zustand store MUST use a \`mounted\` state check to prevent Next.js hydration mismatch errors (since \`localStorage\` is not present during server rendering):
   \`\`\`typescript
   const [mounted, setMounted] = useState(false);
   useEffect(() => { setMounted(true); }, []);
   if (!mounted) return null; // or loading skeleton
   \`\`\`
3. Wire up fully functional interactive dashboards, authenticated user profiles (using login/logout simulators), and live database grid views.
4. Keep the frontend responsive and polished using Tailwind CSS, proper fonts, and elegant icons. Align styling configurations (e.g. tailwind.config.js for v3, or \`@import "tailwindcss";\` for v4) consistently.
5. Ensure the website code is completely self-contained and boots smoothly in StackBlitz WebContainer environment. For Next.js projects, use Next.js 14.2.15 + React 18.3.1. Avoid React 19 in Next 14 projects to prevent typing and rendering crashes. Add \`@next/swc-wasm-nodejs: "14.2.15"\` and \`@hookform/resolvers: "^3.3.4"\` in dependencies/devDependencies to avoid SWC native binary and form resolver compile errors in WebContainer.
6. Prioritize analyzing the existing codebase: ALWAYS check if any files or folders exist and fully read, analyze, and understand existing files first before creating or editing files. Follow a strict loop of Plan & Analyze, Execute Actions, then Verify & Refine.
Return only new or changed files and dependencies. Include concise public summaries, but never reveal hidden chain-of-thought.`;

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

export async function generateWebsiteCodeOpenAI(
  prompt: string, 
  history: { role: string, content: string }[], 
  apiKey: string,
  model: string = DEFAULT_MODEL,
  currentFiles?: Record<string, string>, 
  currentDependencies?: Record<string, string>,
  attachedFiles?: { name: string, type: string, url: string, data: string }[],
  baseUrl: string = DEFAULT_BASE_URL,
  provider: string = 'openai'
): Promise<any> {
  const actualApiKey = apiKey || process.env.OPENAI_API_KEY;
  if (!actualApiKey && provider === 'openai') {
    throw new Error('API Key is not set. Please configure it in the settings.');
  }

  let context = '';
  if (currentFiles && Object.keys(currentFiles).length > 0) {
    context += `\nCURRENT FILES:\n${Object.keys(currentFiles).map(k => `--- ${k} ---\n${currentFiles[k]}`).join('\n\n')}\n`;
  }
  if (currentDependencies && Object.keys(currentDependencies).length > 0) {
    context += `\nCURRENT DEPENDENCIES:\n${JSON.stringify(currentDependencies, null, 2)}\n`;
  }

  const messages: any[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: `${context}\nUser: ${prompt}` }
  ];

  if (attachedFiles && attachedFiles.length > 0) {
    attachedFiles.forEach(f => {
      messages[messages.length - 1].content += `\n[Attached File: ${f.name} (${f.type})]`;
    });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-OpenRouter-Title': 'AI Web Builder Studio',
        'HTTP-Referer': window.location.origin
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content || '{}');
    } catch (e) {
      try {
        const healed = healJson(content || '{}');
        return JSON.parse(healed);
      } catch (eHeal) {
        // Handle cases where the model returns markdown code blocks
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          return JSON.parse(cleanedContent || '{}');
        } catch (eClean) {
          const healedClean = healJson(cleanedContent || '{}');
          return JSON.parse(healedClean);
        }
      }
    }
  } catch (error: any) {
    console.error("AI API Error:", error);
    if (error.message === 'Failed to fetch') {
      throw new Error("Connection error: The browser blocked the request (likely CORS) or the API server is unreachable.");
    }
    throw error;
  }
}

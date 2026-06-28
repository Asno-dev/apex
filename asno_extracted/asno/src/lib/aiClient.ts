export type AIProvider = 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'groq' 
  | 'xai' 
  | 'deepseek' 
  | 'mistral' 
  | 'cohere' 
  | 'together' 
  | 'perplexity' 
  | 'huggingface' 
  | 'ollama' 
  | 'lmstudio' 
  | 'openrouter' 
  | 'moonshot' 
  | 'hyperbolic' 
  | 'github' 
  | 'bedrock' 
  | 'openailike' 
  | 'aicredits';

export interface Model {
  id: string;
  name: string;
  provider: AIProvider;
}

export const ALL_MODELS: Model[] = [
  // 1. OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'o1', name: 'o1', provider: 'openai' },
  { id: 'o1-preview', name: 'o1 Preview', provider: 'openai' },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'openai' },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },

  // 2. Anthropic
  { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
  { id: 'claude-3-opus-latest', name: 'Claude 3 Opus', provider: 'anthropic' },

  // 3. Google Gemini
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'gemini' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'gemini' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', provider: 'gemini' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },

  // 4. Groq
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', provider: 'groq' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B (Groq)', provider: 'groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Groq)', provider: 'groq' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', provider: 'groq' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B (Groq)', provider: 'groq' },

  // 5. xAI (Grok)
  { id: 'grok-2', name: 'Grok 2', provider: 'xai' },
  { id: 'grok-2-1212', name: 'Grok 2 (12-12)', provider: 'xai' },
  { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' },

  // 6. DeepSeek
  { id: 'deepseek-chat', name: 'DeepSeek-V3', provider: 'deepseek' },
  { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Reasoner)', provider: 'deepseek' },

  // 7. Mistral
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral' },
  { id: 'mistral-medium-latest', name: 'Mistral Medium', provider: 'mistral' },
  { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'mistral' },
  { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'mistral' },

  // 8. Cohere
  { id: 'command-r-plus', name: 'Command R+', provider: 'cohere' },
  { id: 'command-r', name: 'Command R', provider: 'cohere' },

  // 9. Together AI
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B (Together)', provider: 'together' },
  { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B (Together)', provider: 'together' },
  { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B (Together)', provider: 'together' },

  // 10. Perplexity
  { id: 'sonar-reasoning', name: 'Sonar Reasoning', provider: 'perplexity' },
  { id: 'sonar', name: 'Sonar', provider: 'perplexity' },

  // 11. Hugging Face
  { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B (HuggingFace)', provider: 'huggingface' },
  { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B (HuggingFace)', provider: 'huggingface' },

  // 12. Ollama (Local)
  { id: 'llama3', name: 'Llama 3 (Ollama)', provider: 'ollama' },
  { id: 'mistral', name: 'Mistral (Ollama)', provider: 'ollama' },
  { id: 'gemma2', name: 'Gemma 2 (Ollama)', provider: 'ollama' },
  { id: 'phi3', name: 'Phi 3 (Ollama)', provider: 'ollama' },

  // 13. LM Studio (Local)
  { id: 'local-model', name: 'Local Model (LM Studio)', provider: 'lmstudio' },

  // 14. OpenRouter
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro (OpenRouter)', provider: 'openrouter' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (OpenRouter)', provider: 'openrouter' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (OpenRouter)', provider: 'openrouter' },

  // 15. Moonshot
  { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', provider: 'moonshot' },
  { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', provider: 'moonshot' },

  // 16. Hyperbolic
  { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B (Hyperbolic)', provider: 'hyperbolic' },
  { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 (Hyperbolic)', provider: 'hyperbolic' },

  // 17. GitHub Models
  { id: 'gpt-4o', name: 'GPT-4o (GitHub)', provider: 'github' },
  { id: 'Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B (GitHub)', provider: 'github' },
  { id: 'phi-3-medium-128k-instruct', name: 'Phi-3 Medium (GitHub)', provider: 'github' },

  // 18. Amazon Bedrock
  { id: 'anthropic.claude-3-5-sonnet-v2-0', name: 'Claude 3.5 Sonnet v2', provider: 'bedrock' },
  { id: 'meta.llama3-1-70b-instruct-v1-0', name: 'Llama 3.1 70B', provider: 'bedrock' },

  // 19. OpenAI-Compatible
  { id: 'custom-model', name: 'Custom OpenAI-Like Model', provider: 'openailike' },

  // 20. aicredits
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (AIC)', provider: 'aicredits' },
  { id: 'gpt-4o', name: 'GPT-4o (AIC)', provider: 'aicredits' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B (AIC)', provider: 'aicredits' },
];

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  groq: 'Groq',
  xai: 'xAI (Grok)',
  deepseek: 'DeepSeek',
  mistral: 'Mistral AI',
  cohere: 'Cohere',
  together: 'Together AI',
  perplexity: 'Perplexity',
  huggingface: 'Hugging Face',
  ollama: 'Ollama (Local)',
  lmstudio: 'LM Studio (Local)',
  openrouter: 'OpenRouter',
  moonshot: 'Moonshot',
  hyperbolic: 'Hyperbolic',
  github: 'GitHub Models',
  bedrock: 'Amazon Bedrock',
  openailike: 'OpenAI-Compatible',
  aicredits: 'AICredits',
};

const PROVIDER_AGENT_IDS: Record<AIProvider, string> = {
  gemini: 'google',
  openai: 'openai',
  anthropic: 'anthropic',
  groq: 'groq',
  xai: 'xai',
  deepseek: 'deepseek',
  mistral: 'mistral',
  cohere: 'cohere',
  together: 'together',
  perplexity: 'perplexity',
  huggingface: 'huggingface',
  ollama: 'ollama',
  lmstudio: 'lmstudio',
  openrouter: 'openrouter',
  moonshot: 'moonshot',
  hyperbolic: 'hyperbolic',
  github: 'github',
  bedrock: 'amazon-bedrock',
  openailike: 'openai-like',
  aicredits: 'openai',
};

export function getProviderBaseUrl(provider: AIProvider, apiKey?: string): string {
  if (provider === 'gemini') return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (provider === 'openai') return 'https://api.openai.com/v1';
  if (provider === 'anthropic') return 'https://api.anthropic.com';
  if (provider === 'groq') return 'https://api.groq.com/openai/v1';
  if (provider === 'xai') return 'https://api.x.ai/v1';
  if (provider === 'deepseek') return 'https://api.deepseek.com/v1';
  if (provider === 'mistral') return 'https://api.mistral.ai/v1';
  if (provider === 'cohere') return 'https://api.cohere.com/v2';
  if (provider === 'together') return 'https://api.together.xyz/v1';
  if (provider === 'perplexity') return 'https://api.perplexity.ai';
  if (provider === 'huggingface') return 'https://api-inference.huggingface.co/v1';
  if (provider === 'ollama') return 'http://localhost:11434/v1';
  if (provider === 'lmstudio') return 'http://localhost:1234/v1';
  if (provider === 'openrouter') return 'https://openrouter.ai/api/v1';
  if (provider === 'moonshot') return 'https://api.moonshot.cn/v1';
  if (provider === 'hyperbolic') return 'https://api.hyperbolic.xyz/v1';
  if (provider === 'github') return 'https://models.inference.ai.azure.com';
  if (provider === 'bedrock') {
    if (apiKey && apiKey.includes(',')) {
      const parts = apiKey.split(',');
      return parts[1]?.trim() || 'https://bedrock-runtime.us-east-1.amazonaws.com';
    }
    return 'https://bedrock-runtime.us-east-1.amazonaws.com';
  }
  if (provider === 'openailike') {
    if (apiKey && apiKey.includes(',')) {
      const parts = apiKey.split(',');
      return parts[1]?.trim() || 'http://localhost:8000/v1';
    }
    return 'http://localhost:8000/v1';
  }
  if (provider === 'aicredits') return 'https://api.aicredits.in/v1';
  return 'https://generativelanguage.googleapis.com/v1beta/openai';
}

import {
  getConnectedTools,
  getComposioApiKey,
  getComposioUserId,
  composioGetToolsForToolkit,
  composioExecuteTool
} from './composioTools';

function formatSchemaForGemini(schema: any): any {
  if (!schema) return { type: 'OBJECT', properties: {} };
  const newSchema = { ...schema };
  if (typeof newSchema.type === 'string') {
    newSchema.type = newSchema.type.toUpperCase();
  }
  if (newSchema.properties) {
    const newProps: any = {};
    for (const [k, v] of Object.entries(newSchema.properties)) {
      newProps[k] = formatSchemaForGemini(v);
    }
    newSchema.properties = newProps;
  }
  if (newSchema.items) {
    newSchema.items = formatSchemaForGemini(newSchema.items);
  }
  return newSchema;
}

export async function callAiAPI(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  provider: AIProvider,
  model: string,
  apiKey: string,
  activePageContext?: string,
  attachedFiles?: { name: string; type: string; data: string }[]
): Promise<string> {
  let actualApiKey = apiKey;
  let baseUrl = '';

  // Handle special CSV key formatting: key,baseUrl
  if (apiKey && apiKey.includes(',')) {
    const parts = apiKey.split(',');
    actualApiKey = parts[0]?.trim();
    baseUrl = parts[1]?.trim();
  }

  if (!baseUrl) {
    baseUrl = getProviderBaseUrl(provider, actualApiKey);
  }

  // Remove trailing slashes
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Build the system prompt
  const systemPrompt = `You are Asno AI, an ultra-advanced workspace companion. You are integrated inside Asno, a local-first Notion clone built with React.
Your goal is to help the user write, edit, summarize, explain, or structure document content.
Return clear, professional, and well-structured markdown answers.`;

  // Incorporate active page context and file attachments into the user prompt
  let enrichedPrompt = '';
  if (activePageContext) {
    enrichedPrompt += `[ACTIVE DOCUMENT CONTEXT]\n${activePageContext}\n\n`;
  }
  if (attachedFiles && attachedFiles.length > 0) {
    enrichedPrompt += `[ATTACHED FILES]\n`;
    attachedFiles.forEach(file => {
      let fileContent = '[Binary Data / Non-text File]';
      if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('javascript') || file.type.includes('typescript') || file.type.includes('markdown') || file.type.includes('xml')) {
        try {
          fileContent = atob(file.data);
        } catch {
          fileContent = '[Failed to decode text content]';
        }
      }
      enrichedPrompt += `File: ${file.name} (type: ${file.type})\nContent:\n${fileContent}\n---\n`;
    });
    enrichedPrompt += `\n`;
  }
  enrichedPrompt += prompt;

  // Retrieve connected Composio tools
  const composioApiKey = getComposioApiKey();
  const composioUserId = getComposioUserId();
  const connectedSlugs = getConnectedTools();

  let allTools: any[] = [];
  const hasComposio = !!(composioApiKey && connectedSlugs.length > 0);

  if (hasComposio) {
    try {
      const toolPromises = connectedSlugs.map(slug =>
        composioGetToolsForToolkit(composioApiKey, slug)
      );
      const toolResults = await Promise.all(toolPromises);
      allTools = toolResults.flat();

      // Limit to 30 tools to prevent payload overflow and respect API limits
      if (allTools.length > 30) {
        const keywords = prompt.toLowerCase().split(/\s+/);
        allTools = allTools.map(t => {
          let score = 0;
          const text = `${t.name || ''} ${t.displayName || ''} ${t.description || ''} ${t.toolkitSlug || ''}`.toLowerCase();
          keywords.forEach(kw => {
            if (kw.length > 2 && text.includes(kw)) score += 10;
          });
          if (t.important) score += 2;
          return { tool: t, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 30)
        .map(item => item.tool);
      }
    } catch (e) {
      console.warn("Failed to load Composio tools:", e);
    }
  }

  // ponytail: Gemini rejects tool names with spaces/slashes/unicode
  const _nameToOriginal = new Map<string, string>();
  const _sanitizeName = (name: string) => {
    const s = name.replace(/[^a-zA-Z0-9_.:-]/g, '_').replace(/^[^a-zA-Z_]/, 'tool_');
    _nameToOriginal.set(s, name);
    return s;
  };

  const composioExecute = async (toolName: string, args: Record<string, any>): Promise<any> => {
    if (!composioApiKey) {
      return { error: 'Composio API key not configured.' };
    }
    const originalName = _nameToOriginal.get(toolName) || toolName;
    try {
      return await composioExecuteTool(composioApiKey, originalName, composioUserId, args);
    } catch (execErr: any) {
      console.warn(`Composio tool ${toolName} failed:`, execErr);
      return { error: execErr.message || String(execErr) };
    }
  };

  // 1. Google Gemini Native
  if (provider === 'gemini') {
    let currentModel = model === 'gemini-testing-model' ? 'gemini-2.5-flash' : model;
    const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let attempt = 0;
    
    while (attempt <= fallbackModels.length) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${actualApiKey}`;
      
      // Map conversation history
      const contents = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Append enriched current user message
      contents.push({
        role: 'user',
        parts: [{ text: enrichedPrompt }]
      });

      // Format tools for Gemini
      const geminiTools = allTools.length > 0 ? [{
        functionDeclarations: allTools.map(t => ({
          name: _sanitizeName(t.name),
          description: t.description || `Execute action ${t.name}`,
          parameters: formatSchemaForGemini(t.parameters || t.inputSchema)
        }))
      }] : undefined;

      try {
        let loopCount = 0;
        let successText: string | null = null;
        
        while (loopCount < 5) {
          const body: any = {
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.4
            }
          };
          if (geminiTools) {
            body.tools = geminiTools;
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (!response.ok) {
            const errText = await response.text();
            
            // Check for quota limits / 429
            if (response.status === 429 && attempt < fallbackModels.length) {
              console.warn(`Gemini model ${currentModel} hit rate limits (429). Retrying with fallback: ${fallbackModels[attempt]}`);
              currentModel = fallbackModels[attempt];
              attempt++;
              throw { name: 'QuotaExceededError', message: errText };
            }
            throw new Error(`Gemini API Error (${response.status}): ${errText}`);
          }

          const data = await response.json();
          const candidate = data?.candidates?.[0];
          const part = candidate?.content?.parts?.[0];

          if (part?.functionCall) {
            const functionCall = part.functionCall;
            const toolResult = await composioExecute(functionCall.name, functionCall.args || {});

            contents.push({
              role: 'model',
              parts: [{ functionCall }] as any
            });
            contents.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: functionCall.name,
                  response: { result: toolResult }
                }
              }] as any
            });
            loopCount++;
          } else {
            const replyText = part?.text;
            if (!replyText) {
              throw new Error('Received empty response from Gemini API.');
            }
            successText = replyText;
            break;
          }
        }
        
        if (successText !== null) {
          return successText;
        }
        throw new Error('Exceeded maximum tool execution turns (5).');
      } catch (err: any) {
        if (err.name === 'QuotaExceededError') {
          continue; // retry the outer loop with fallback model
        }
        throw err;
      }
    }
  }

  // 2. Anthropic Native
  if (provider === 'anthropic') {
    const url = `${baseUrl}/v1/messages`;
    
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    messages.push({
      role: 'user',
      content: enrichedPrompt
    });

    // Format tools for Anthropic
    const anthropicTools = allTools.length > 0 ? allTools.map(t => ({
      name: t.name,
      description: t.description || `Execute action ${t.name}`,
      input_schema: t.parameters || t.inputSchema || { type: 'object', properties: {} }
    })) : undefined;

    let anthropicLoopCount = 0;
    while (anthropicLoopCount < 5) {
      const body: any = {
        model,
        system: systemPrompt,
        messages,
        max_tokens: 4000,
        temperature: 0.4
      };
      if (anthropicTools) {
        body.tools = anthropicTools;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': actualApiKey,
          'anthropic-version': '2023-06-01',
          'dangerouslyAllowBrowser': 'true'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const replyContent = data?.content;
      if (!replyContent || replyContent.length === 0) {
        throw new Error('Received empty response from Anthropic API.');
      }

        const toolUses = replyContent.filter((c: any) => c.type === 'tool_use');
        
        if (toolUses.length > 0) {
          messages.push({
            role: 'assistant',
            content: replyContent
          });

          const toolResults = [];
          for (const tu of toolUses) {
            const toolResult = await composioExecute(tu.name, tu.input || {});
            toolResults.push({
              type: 'tool_result',
              tool_use_id: tu.id,
              content: JSON.stringify(toolResult)
            });
          }

          messages.push({
            role: 'user',
            content: toolResults as any
          });
        anthropicLoopCount++;
      } else {
        const replyText = replyContent.map((c: any) => c.text || '').join('\n');
        return replyText;
      }
    }
    throw new Error('Exceeded maximum tool execution turns (5).');
  }

  // 3. OpenAI-Compatible Providers & OpenAI Native
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: enrichedPrompt }
  ];

  // Format tools for OpenAI
  const openAiTools = allTools.length > 0 ? allTools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description || `Execute action ${t.name}`,
      parameters: t.parameters || t.inputSchema || { type: 'object', properties: {} }
    }
  })) : undefined;

  let openAiLoopCount = 0;
  while (openAiLoopCount < 5) {
    const url = `${baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (actualApiKey && actualApiKey !== 'none') {
      headers['Authorization'] = `Bearer ${actualApiKey}`;
    }

    if (provider === 'openrouter') {
      headers['X-Title'] = 'Asno Notion Clone';
      headers['HTTP-Referer'] = window.location.origin;
    }

    const body: any = {
      model,
      messages,
      temperature: 0.4
    };
    if (openAiTools) {
      body.tools = openAiTools;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`${PROVIDER_LABELS[provider]} API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const assistantMessage = data?.choices?.[0]?.message;
    if (!assistantMessage) {
      throw new Error(`Received empty response from ${PROVIDER_LABELS[provider]} API.`);
    }

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      messages.push(assistantMessage);

      for (const tc of assistantMessage.tool_calls) {
        let args = {};
        try {
          args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        } catch {
          args = {};
        }

        const toolResult = await composioExecute(tc.function.name, args);

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          name: tc.function.name,
          content: JSON.stringify(toolResult)
        } as any);
      }
      openAiLoopCount++;
    } else {
      const replyText = assistantMessage.content;
      if (replyText === null || replyText === undefined) {
        throw new Error(`Received empty message content from ${PROVIDER_LABELS[provider]} API.`);
      }
      return replyText;
    }
  }
  throw new Error('Exceeded maximum tool execution turns (5).');
}


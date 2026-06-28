export interface ModelInfo {
  id: string;
  name: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'amazon-bedrock';
  defaultBaseUrl?: string;
  models: ModelInfo[];
  needsBaseUrl?: boolean;
}

export const AI_PROVIDERS: ProviderInfo[] = [
  {
    id: 'google',
    name: 'Google (Gemini)',
    type: 'google',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
      { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    models: [
      { id: 'o1', name: 'o1' },
      { id: 'o1-preview', name: 'o1-preview' },
      { id: 'o1-mini', name: 'o1-mini' },
      { id: 'o3-mini', name: 'o3-mini' },
      { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-latest', name: 'Claude 3 Opus' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    type: 'openai',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'Deepseek R1 Distill Llama 70B'}
    ]
  },
  {
    id: 'xai',
    name: 'xAI',
    type: 'openai',
    defaultBaseUrl: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-3', name: 'Grok 3 (Beta)' },
      { id: 'grok-2-1212', name: 'Grok 2' },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision' }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral',
    type: 'mistral',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'pixtral-large-latest', name: 'Pixtral Large' },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
      { id: 'codestral-latest', name: 'Codestral' },
      { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B' }
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere',
    type: 'cohere',
    models: [
      { id: 'command-r-plus-08-2024', name: 'Command R+' },
      { id: 'command-r-08-2024', name: 'Command R' },
      { id: 'command-r7b-12-2024', name: 'Command R 7B' }
    ]
  },
  {
    id: 'together',
    name: 'Together',
    type: 'openai',
    defaultBaseUrl: 'https://api.together.xyz/v1',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo' },
      { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B Turbo' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1' },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B Turbo' }
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    type: 'openai',
    defaultBaseUrl: 'https://api.perplexity.ai',
    models: [
      { id: 'sonar-reasoning-pro', name: 'Sonar Reasoning Pro' },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning' },
      { id: 'sonar-pro', name: 'Sonar Pro' },
      { id: 'sonar', name: 'Sonar' }
    ]
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    type: 'openai',
    defaultBaseUrl: 'https://api-inference.huggingface.co/v1',
    models: [
      { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B' },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B Instruct' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1' },
      { id: 'x-ai/grok-2', name: 'Grok 2' }
    ]
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    type: 'openai',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'moonshot-v1-8k', name: 'Moonshot v1 8K' },
      { id: 'moonshot-v1-32k', name: 'Moonshot v1 32K' },
      { id: 'moonshot-v1-128k', name: 'Moonshot v1 128K' }
    ]
  },
  {
    id: 'hyperbolic',
    name: 'Hyperbolic',
    type: 'openai',
    defaultBaseUrl: 'https://api.hyperbolic.xyz/v1',
    models: [
      { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B' },
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B' },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub Models',
    type: 'openai',
    defaultBaseUrl: 'https://models.inference.ai.azure.com',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o1', name: 'o1' },
      { id: 'o3-mini', name: 'o3-mini' },
      { id: 'AI21-Jamba-1.5-Mini', name: 'Jamba 1.5 Mini' },
      { id: 'Meta-Llama-3-70B-Instruct', name: 'Llama 3 70B Instruct' }
    ]
  },
  {
    id: 'amazon-bedrock',
    name: 'Amazon Bedrock',
    type: 'amazon-bedrock',
    models: [
      { id: 'amazon.titan-text-express-v1', name: 'Titan Text Express' },
      { id: 'amazon.nova-pro-v1:0', name: 'Amazon Nova Pro' },
      { id: 'amazon.nova-lite-v1:0', name: 'Amazon Nova Lite' },
      { id: 'anthropic.claude-3-sonnet-20240229-v1:0', name: 'Claude 3 Sonnet' },
      { id: 'anthropic.claude-3-haiku-20240307-v1:0', name: 'Claude 3 Haiku' },
      { id: 'meta.llama3-1-8b-instruct-v1:0', name: 'Llama 3.1 8B' },
      { id: 'meta.llama3-1-70b-instruct-v1:0', name: 'Llama 3.1 70B' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama',
    type: 'openai',
    defaultBaseUrl: 'http://localhost:11434/v1',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2' },
      { id: 'llama3.1', name: 'Llama 3.1' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'qwen2.5', name: 'Qwen 2.5' },
      { id: 'gemma2', name: 'Gemma 2' }
    ],
    needsBaseUrl: true
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    type: 'openai',
    defaultBaseUrl: 'http://localhost:1234/v1',
    models: [
      { id: 'local-model', name: 'Local Model' }
    ],
    needsBaseUrl: true
  },
  {
    id: 'openai-like',
    name: 'OpenAI-like',
    type: 'openai',
    defaultBaseUrl: 'https://api.example.com/v1',
    models: [
      { id: 'custom-model', name: 'Custom Model' }
    ],
    needsBaseUrl: true
  }
];

export const DEFAULT_PROVIDER = 'google';
export const DEFAULT_MODEL = 'gemini-2.5-flash';

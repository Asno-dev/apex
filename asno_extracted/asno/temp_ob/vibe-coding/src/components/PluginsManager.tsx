// @ts-nocheck
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, Blocks, X, Search, Check, ChevronDown, ChevronRight, Plus, Settings, Key, ExternalLink, Eye, EyeOff, ShieldCheck, LogIn } from 'lucide-react';
import { useStore, type AIProvider } from '../store/useStore';
import { ALL_MODELS } from '../lib/constants';

/* ── Real branded logo URLs for every tool ── */
export const TOOL_LOGOS: Record<string, string> = {
  gmail: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png',
  googlesheets: 'https://www.gstatic.com/images/branding/product/2x/sheets_2020q4_48dp.png',
  googlecalendar: 'https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png',
  googledocs: 'https://www.gstatic.com/images/branding/product/2x/docs_2020q4_48dp.png',
  googlemeet: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-96dp/logo_meet_2020q4_color_2x_web_96dp.png',
  googleslides: 'https://www.gstatic.com/images/branding/product/2x/slides_2020q4_48dp.png',
  googlemaps: 'https://cdn.simpleicons.org/googlemaps/4285F4',
  googlephotos: 'https://cdn.simpleicons.org/googlephotos/4285F4',
  drive: 'https://cdn.simpleicons.org/googledrive/4285F4',
  excel: 'https://cdn.simpleicons.org/microsoftexcel/217346',
  sharepoint: 'https://cdn.simpleicons.org/microsoftsharepoint/0078D4',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
  github: 'https://github.githubassets.com/favicons/favicon-dark.svg',
  notion: 'https://cdn.simpleicons.org/notion/FFFFFF',
  telegram: 'https://cdn.simpleicons.org/telegram/26A5E4',
  google_workspace_mcp: 'https://cdn.simpleicons.org/google/4285F4',
  github_mcp: 'https://github.githubassets.com/favicons/favicon-dark.svg',
  telegram_mcp: 'https://cdn.simpleicons.org/telegram/26A5E4',
  chrome_devtools_mcp: 'https://cdn.simpleicons.org/googlechrome/4285F4',
};

const APP_WEBSITES: Record<string, string> = {
  gmail: 'https://mail.google.com', 
  googlesheets: 'https://sheets.google.com',
  googlecalendar: 'https://calendar.google.com', 
  googledocs: 'https://docs.google.com',
  googlemeet: 'https://meet.google.com', 
  googleslides: 'https://slides.google.com', 
  googlemaps: 'https://maps.google.com',
  googlephotos: 'https://photos.google.com', 
  drive: 'https://drive.google.com',
  excel: 'https://www.microsoft.com/microsoft-365/excel', 
  sharepoint: 'https://www.microsoft.com/microsoft-365/sharepoint', 
  discord: 'https://discord.com', 
  github: 'https://github.com', 
  notion: 'https://www.notion.so', 
  telegram: 'https://telegram.org', 
  google_workspace_mcp: 'https://github.com/taylorwilsdon/google_workspace_mcp',
  github_mcp: 'https://github.com/github/github-mcp-server',
  telegram_mcp: 'https://github.com/kuchin/telegram-mcp-server',
  chrome_devtools_mcp: 'https://github.com/ChromeDevTools/chrome-devtools-mcp',
};

const getWebsiteScreenshot = (url: string) => `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=900`;
const getDemoSearchUrl = (name: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} official demo tutorial product tour`)}`;

export const TOOL_DESCRIPTIONS: Record<string, string> = {
  gmail: 'Read, send, and manage your emails.',
  googlesheets: 'Create and edit spreadsheet files.',
  googlecalendar: 'Manage events and schedule meetings.',
  googledocs: 'Create and edit document files.',
  googlemeet: 'Schedule and join video meetings.',
  googleslides: 'Create and edit presentations.',
  googlemaps: 'Access location and map data.',
  googlephotos: 'Manage your photos and videos.',
  drive: 'Store, share, and access your files from any device.',
  excel: 'Read and edit Excel spreadsheets.',
  sharepoint: 'Manage team sites and documents.',
  discord: 'Communicate with your community via text and voice.',
  github: 'Manage repositories, issues, and pull requests.',
  notion: 'Create and manage documents and databases.',
  telegram: 'Send and receive messages on Telegram.',
  google_workspace_mcp: 'Google Workspace MCP Server (User Credentials).',
  github_mcp: 'GitHub MCP Server (Search, Read issues/PRs).',
  telegram_mcp: 'Telegram MCP Server (Send/read messages).',
  chrome_devtools_mcp: 'Chrome DevTools MCP Server (Browser automation).',
};


const PLUGIN_DETAILS: Record<string, {
  tagline: string;
  category: string;
  developer: string;
  website: string;
  privacy?: string;
  terms?: string;
  support?: string;
  capabilities: string[];
  longDescription: string;
  examples: { prompt: string; title: string; body: string }[];
  version?: string;
}> = {
  gmail: {
    tagline: 'Read, organize, and draft email with agent help.',
    category: 'Productivity',
    developer: 'Google',
    website: 'https://mail.google.com',
    privacy: 'https://policies.google.com/privacy',
    terms: 'https://policies.google.com/terms',
    support: 'https://support.google.com/mail',
    capabilities: ['Reads', 'Writes', 'Searches'],
    version: 'Official OAuth connector',
    longDescription: 'Connect Gmail so the agent can help find relevant messages, summarize threads, draft replies, and keep email work close to the conversation.',
    examples: [
      { prompt: '@Gmail summarize unread invoices', title: 'Thread summary', body: 'Pulls recent matching email, extracts dates and action items, then prepares a concise response.' },
      { prompt: '@Gmail draft a client follow-up', title: 'Reply drafting', body: 'Uses context from the conversation to write a polished email draft for review before sending.' },
    ],
  },
  googlesheets: {
    tagline: 'Create and edit spreadsheets.',
    category: 'Productivity',
    developer: 'Google',
    website: 'https://sheets.google.com',
    privacy: 'https://policies.google.com/privacy',
    terms: 'https://policies.google.com/terms',
    support: 'https://support.google.com/docs',
    capabilities: ['Reads', 'Writes', 'Creates'],
    longDescription: 'Use Google Sheets to inspect tables, generate structured rows, update trackers, and turn spreadsheet data into summaries or charts.',
    examples: [
      { prompt: '@Google Sheets clean the leads sheet', title: 'Data cleanup', body: 'Normalizes columns, flags missing values, and prepares an update.' },
      { prompt: '@Google Sheets create a sprint tracker', title: 'Sheet creation', body: 'Builds a useful spreadsheet structure from a short brief.' },
    ],
  },
  googlecalendar: {
    tagline: 'Schedule and manage calendar events.',
    category: 'Scheduling',
    developer: 'Google',
    website: 'https://calendar.google.com',
    privacy: 'https://policies.google.com/privacy',
    terms: 'https://policies.google.com/terms',
    support: 'https://support.google.com/calendar',
    capabilities: ['Reads', 'Writes', 'Schedules'],
    longDescription: 'Connect Google Calendar to find availability, summarize upcoming events, and create meetings from planning conversations.',
    examples: [
      { prompt: '@Google Calendar find time next week', title: 'Availability', body: 'Checks calendar context and suggests workable meeting slots.' },
      { prompt: '@Google Calendar schedule project review', title: 'Meeting setup', body: 'Creates an event with title, attendees, notes, and timing.' },
    ],
  },
  googledocs: {
    tagline: 'Create and edit document files.',
    category: 'Productivity',
    developer: 'Google',
    website: 'https://docs.google.com',
    privacy: 'https://policies.google.com/privacy',
    terms: 'https://policies.google.com/terms',
    support: 'https://support.google.com/docs',
    capabilities: ['Reads', 'Writes', 'Creates'],
    longDescription: 'Use Google Docs to draft documents, summarize existing docs, and keep written work connected to your agent workflow.',
    examples: [
      { prompt: '@Google Docs draft an implementation brief', title: 'Document drafting', body: 'Creates a clean first draft from the conversation.' },
      { prompt: '@Google Docs summarize this spec', title: 'Spec summary', body: 'Extracts decisions, requirements, and open questions.' },
    ],
  },
  figma: {
    tagline: 'Use design files and prototypes as product context.',
    category: 'Design',
    developer: 'Figma',
    website: 'https://www.figma.com',
    privacy: 'https://www.figma.com/privacy/',
    terms: 'https://www.figma.com/terms/',
    support: 'https://help.figma.com',
    capabilities: ['Reads', 'Design context', 'Collaboration'],
    longDescription: 'Connect Figma so the agent can work from design context, inspect product references, and help turn design intent into implementation tasks.',
    examples: [
      { prompt: '@Figma inspect the checkout design', title: 'Design handoff', body: 'Uses layout and component context to guide implementation.' },
      { prompt: '@Figma compare this UI to the spec', title: 'Review support', body: 'Highlights gaps between product intent and current build.' },
    ],
  },
  canva: {
    tagline: 'Create and manage graphic designs.',
    category: 'Design',
    developer: 'Canva',
    website: 'https://www.canva.com',
    privacy: 'https://www.canva.com/policies/privacy-policy/',
    terms: 'https://www.canva.com/policies/terms-of-use/',
    support: 'https://www.canva.com/help/',
    capabilities: ['Creates', 'Edits', 'Brand assets'],
    longDescription: 'Use Canva for design and marketing workflows such as social posts, decks, visual assets, and branded creative materials.',
    examples: [
      { prompt: '@Canva create campaign assets', title: 'Social assets', body: 'Generates concepts for posts, banners, or flyers from a short brief.' },
      { prompt: '@Canva resize for Instagram and LinkedIn', title: 'Format adaptation', body: 'Adapts existing visuals across channels while preserving the core look.' },
    ],
  },
  default: {
    tagline: 'Connect this app so agents can use its tools in your workflow.',
    category: 'App',
    developer: 'Provider',
    website: '#',
    capabilities: ['Connects', 'Actions'],
    longDescription: 'This integration lets the agent work with the selected app from inside your project. Connect it to unlock app-specific actions and context.',
    examples: [
      { prompt: '@App find the right context', title: 'Context lookup', body: 'Searches connected app data and brings useful details into the chat.' },
      { prompt: '@App create the next update', title: 'Action workflow', body: 'Uses the connected tool to prepare or perform a useful action.' },
    ],
  },
};

const AI_PROVIDERS: {
  id: AIProvider;
  name: string;
  shortDescription: string;
  description: string;
  logoUrl: string;
  docsUrl: string;
  keyUrl: string;
  billingNote: string;
  authNote: string;
  resources: { label: string; href: string }[];
  highlights: string[];
}[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortDescription: 'Frontier models for coding, reasoning, vision, and general chat.',
    description: 'OpenAI provides hosted models for text, vision, audio, image generation, reasoning, and agentic workflows through the OpenAI API.',
    logoUrl: 'https://openai.com/favicon.ico',
    docsUrl: 'https://platform.openai.com/docs',
    keyUrl: 'https://platform.openai.com/api-keys',
    billingNote: 'Requires an OpenAI platform account. Usage, rate limits, and model availability depend on your project and billing setup.',
    authNote: 'Use a secret API key with HTTP bearer authentication. Keep the key private and never expose it in public client code.',
    resources: [
      { label: 'API documentation', href: 'https://platform.openai.com/docs' },
      { label: 'Models', href: 'https://platform.openai.com/docs/models' },
      { label: 'API keys', href: 'https://platform.openai.com/api-keys' },
    ],
    highlights: ['Hosted OpenAI models', 'Responses, chat, realtime, image, and audio APIs', 'Project-scoped keys and usage controls'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    shortDescription: 'Claude models outstanding at coding, logical analysis, and writing.',
    description: 'Anthropic provides the Claude family of models of high intelligence, reliability, and precision, specially suited for multi-step engineering tasks.',
    logoUrl: 'https://anthropic.com/favicon.ico',
    docsUrl: 'https://docs.anthropic.com',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    billingNote: 'Requires an Anthropic Developer Console account and active credits.',
    authNote: 'Enter your Anthropic API key (starts with sk-ant-). We connect directly and safely.',
    resources: [
      { label: 'Anthropic Console', href: 'https://console.anthropic.com' },
      { label: 'Documentation', href: 'https://docs.anthropic.com' },
    ],
    highlights: ['Claude 3.5 Sonnet & Haiku', 'Exceptional agent performance', 'State-of-the-art computer control support'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    shortDescription: 'Google models for multimodal work, long context, and fast prototypes.',
    description: 'Gemini API gives developers access to Google Gemini models for text, image, audio, video, and long-context application workflows.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    billingNote: 'Use Google AI Studio or Google Cloud billing as required by your selected Gemini API plan and region.',
    authNote: 'Create a Gemini API key in Google AI Studio. Google recommends environment variables or server-side storage for real applications.',
    resources: [
      { label: 'Gemini API docs', href: 'https://ai.google.dev/gemini-api/docs' },
      { label: 'Models API', href: 'https://ai.google.dev/api/models' },
      { label: 'Get API key', href: 'https://aistudio.google.com/app/apikey' },
    ],
    highlights: ['Multimodal Gemini models', 'Models endpoint for available model metadata', 'AI Studio key creation'],
  },
  {
    id: 'groq',
    name: 'Groq',
    shortDescription: 'Incredibly fast inference engine for open models.',
    description: 'Groq operates a highly optimized Language Processing Unit (LPU) cloud to deliver open weights models with groundbreaking speeds.',
    logoUrl: 'https://groq.com/wp-content/uploads/2024/03/cropped-favicon-192x192.png',
    docsUrl: 'https://console.groq.com/docs',
    keyUrl: 'https://console.groq.com/keys',
    billingNote: 'Requires a Groq Console account and api usage bounds.',
    authNote: 'Paste your secret Groq key starting with gsk_. Your queries run with ultra-low latency.',
    resources: [
      { label: 'Groq Console', href: 'https://console.groq.com' },
      { label: 'Developer Docs', href: 'https://console.groq.com/docs' },
    ],
    highlights: ['Llama 3.3 and Gemma 2 support', 'Sub-second start latencies', 'Blazing-fast engineering iteration'],
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    shortDescription: 'Grok models with real-time knowledge and advanced reasoning.',
    description: 'Grok models offer powerful, direct alignment with real-time web streams, designed to address dynamic logic problems with deep context.',
    logoUrl: 'https://x.ai/favicon.ico',
    docsUrl: 'https://docs.x.ai',
    keyUrl: 'https://console.x.ai',
    billingNote: 'Billed to your active xAI Developer Console profile.',
    authNote: 'Paste your xAI API key obtained from console.x.ai.',
    resources: [
      { label: 'xAI Console', href: 'https://console.x.ai' },
      { label: 'API Reference', href: 'https://docs.x.ai' },
    ],
    highlights: ['Grok 2 reasoner access', 'Advanced multi-modal capabilities', 'Optimized context depth'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    shortDescription: 'Incredibly cost-effective and powerful reasoning & chat models.',
    description: 'DeepSeek delivers outstanding engineering and reasoning abilities at a fraction of the cost of other frontier models, with full OpenAI compatibility.',
    logoUrl: 'https://chat.deepseek.com/favicon.ico',
    docsUrl: 'https://api-docs.deepseek.com',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    billingNote: 'Requires a DeepSeek platform balance. Highly affordable rate structures.',
    authNote: 'Paste your DeepSeek key (usually starting with sk-). Full compatibility enabled.',
    resources: [
      { label: 'DeepSeek Platform', href: 'https://platform.deepseek.com' },
      { label: 'API Docs', href: 'https://api-docs.deepseek.com' },
    ],
    highlights: ['DeepSeek-V3 general chat', 'DeepSeek-R1 deep reasoning model', 'Extremely cheap token pricing'],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    shortDescription: 'European open frontier models specializing in code and reasoning.',
    description: 'Mistral AI provides an array of openweights and optimized models tailored for structured JSON matching, code comprehension, and multilingual tasks.',
    logoUrl: 'https://mistral.ai/images/logo.svg',
    docsUrl: 'https://docs.mistral.ai',
    keyUrl: 'https://console.mistral.ai/api-keys/',
    billingNote: 'Requires active balance on Mistral Console (La Plateforme).',
    authNote: 'Enter your Mistral API key of active subscription tier.',
    resources: [
      { label: 'Mistral Console', href: 'https://console.mistral.ai' },
      { label: 'Documentation', href: 'https://docs.mistral.ai' },
    ],
    highlights: ['Mistral Large 2', 'Codestral specialized code generation', 'Strong multilingual capabilities'],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    shortDescription: 'Enterprise focused models optimized for search, RAG, and formatting.',
    description: 'Cohere Command models are specifically designed to ingest very long inputs, citations, search grounding, and robust JSON outputs.',
    logoUrl: 'https://cohere.com/favicon.ico',
    docsUrl: 'https://docs.cohere.com',
    keyUrl: 'https://dashboard.cohere.com/api-keys',
    billingNote: 'Billed directly to your Cohere account profile.',
    authNote: 'Enter your Cohere API key starting with active production token.',
    resources: [
      { label: 'Cohere Dashboard', href: 'https://dashboard.cohere.com' },
      { label: 'API Docs', href: 'https://docs.cohere.com' },
    ],
    highlights: ['Command R & R+ models', 'RAG search optimizations', 'Native multilingual tools'],
  },
  {
    id: 'together',
    name: 'Together AI',
    shortDescription: 'Dozens of fast open-source and open-weights models under one API.',
    description: 'Together AI hosts the industry\'s fastest execution platform for open weights, hosting Llama, Qwen, DeepSeek, and Mistral models.',
    logoUrl: 'https://www.together.ai/favicon.ico',
    docsUrl: 'https://docs.together.ai',
    keyUrl: 'https://api.together.ai/settings/api-keys',
    billingNote: 'Requires Together.ai balance in active developer portal.',
    authNote: 'Paste your Together AI developer key.',
    resources: [
      { label: 'Together Console', href: 'https://api.together.ai' },
      { label: 'Model Directory', href: 'https://docs.together.ai/docs/inference-models' },
    ],
    highlights: ['Aggregated open-weights LLMs', 'Blazing-fast inference speeds', 'Excellent price performance'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    shortDescription: 'Search-grounded models with real-time web execution.',
    description: 'Perplexity API provides online search-grounded models which dynamically search the web, fetch citations, and report modern facts.',
    logoUrl: 'https://www.perplexity.ai/favicon.ico',
    docsUrl: 'https://docs.perplexity.ai',
    keyUrl: 'https://www.perplexity.ai/settings/api',
    billingNote: 'Requires an active API credit balance inside Perplexity account settings.',
    authNote: 'Input your Perplexity API key to power search-grounded lookups.',
    resources: [
      { label: 'Perplexity Settings', href: 'https://www.perplexity.ai/settings/api' },
      { label: 'API Reference', href: 'https://docs.perplexity.ai' },
    ],
    highlights: ['Fresh online search data', 'Sonar citation reasoning models', 'Accurate up-to-date lookups'],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    shortDescription: 'Access thousands of community models via Inference Endpoints.',
    description: 'Connect directly to open source model weights hosted on Hugging Face Serverless APIs or private dedicated endpoints.',
    logoUrl: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
    docsUrl: 'https://huggingface.co/docs/api-inference/index',
    keyUrl: 'https://huggingface.co/settings/tokens',
    billingNote: 'Free serverless quota available; custom spaces/endpoints require billing.',
    authNote: 'Provide your Hugging Face Access Token starting with hf_.',
    resources: [
      { label: 'Settings Tokens', href: 'https://huggingface.co/settings/tokens' },
      { label: 'Inference Guide', href: 'https://huggingface.co/docs/api-inference/index' },
    ],
    highlights: ['Serverless community LLMs', 'Private custom endpoint routing', '10,000+ open-source options'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    shortDescription: 'Run open LLMs locally on your machine with zero remote server dependency.',
    description: 'Connect directly to Ollama running locally. Completely private, secure, and offline. Fully compatible with OpenAI API structure.',
    logoUrl: 'https://ollama.com/assets/favicon.png',
    docsUrl: 'https://github.com/ollama/ollama',
    keyUrl: 'http://localhost:11434',
    billingNote: '100% Free. Utilizes local CPU/GPU hardware capabilities.',
    authNote: 'Ensure Ollama is running (ollama serve) and CORS/origins are set to *. Default route: http://localhost:11434.',
    resources: [
      { label: 'Ollama GitHub', href: 'https://github.com/ollama/ollama' },
      { label: 'Model Library', href: 'https://ollama.com/library' },
    ],
    highlights: ['Fully offline and local', 'No key or subscription costs', 'Secure data privacy'],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    shortDescription: 'GUI local inference for GGUF files with OpenAI compatibility.',
    description: 'Connect to LM Studio Local Server running on your workstation. Run any HF model file in GGUF format locally.',
    logoUrl: 'https://lmstudio.ai/favicon.ico',
    docsUrl: 'https://lmstudio.ai',
    keyUrl: 'http://localhost:1234',
    billingNote: 'Free offline application execution.',
    authNote: 'Start the server tab in LM Studio, allowing localhost CORS. Default address: http://localhost:1234.',
    resources: [
      { label: 'LM Studio website', href: 'https://lmstudio.ai' },
    ],
    highlights: ['Run any GGUF file', 'No remote access required', 'Unified local playground'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    shortDescription: 'One API key for many frontier, open-weight, and specialty models.',
    description: 'OpenRouter offers an OpenAI-compatible API for browsing and using hundreds of models across many providers with one account key.',
    logoUrl: 'https://openrouter.ai/favicon.ico',
    docsUrl: 'https://openrouter.ai/docs',
    keyUrl: 'https://openrouter.ai/keys',
    billingNote: 'Add credits or configure limits in OpenRouter before enabling paid models. Model pricing and availability can change by provider.',
    authNote: 'OpenRouter authenticates API requests with bearer tokens and supports OpenAI SDK compatible base URLs.',
    resources: [
      { label: 'Documentation', href: 'https://openrouter.ai/docs' },
      { label: 'Models', href: 'https://openrouter.ai/models' },
      { label: 'API keys', href: 'https://openrouter.ai/keys' },
    ],
    highlights: ['OpenAI-compatible API', 'Hundreds of models and providers', 'Optional key limits and usage controls'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    shortDescription: 'Chinese NLP Kimi models optimized for massive files & chat.',
    description: 'Moonshot provides advanced language understanding specifically optimized for perfect Chinese conversational structures and extensive text.',
    logoUrl: 'https://www.moonshot.cn/favicon.ico',
    docsUrl: 'https://platform.moonshot.cn/docs',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    billingNote: 'Billed through your active Kimi Moonshot developer profile.',
    authNote: 'Provide Moonshot client key from your registered console.',
    resources: [
      { label: 'Moonshot Console', href: 'https://platform.moonshot.cn' },
    ],
    highlights: ['Polished Chinese NLP structures', 'Massive context indexing', 'OpenAI compatible formats'],
  },
  {
    id: 'hyperbolic',
    name: 'Hyperbolic',
    shortDescription: 'Decentralized AI cloud for extremely cost-effective open GPU inference.',
    description: 'Connect to Hyperbolic cluster networks to complete high speed inference tasks on shared state GPU pipelines.',
    logoUrl: 'https://hyperbolic.xyz/favicon.ico',
    docsUrl: 'https://docs.hyperbolic.xyz',
    keyUrl: 'https://app.hyperbolic.xyz/settings',
    billingNote: 'Requires hyperbolic balance inside account settings.',
    authNote: 'Paste your Hyperbolic platform token key.',
    resources: [
      { label: 'Hyperbolic Web', href: 'https://app.hyperbolic.xyz' },
    ],
    highlights: ['Cheap 405B GPU inference', 'Decentralized computation assets', 'OpenAI gateway standard'],
  },
  {
    id: 'github',
    name: 'GitHub Models',
    shortDescription: 'Model catalog, prompts, comparisons, and evals inside GitHub workflows.',
    description: 'GitHub Models is a developer workspace for exploring models, managing prompts, comparing outputs, and building AI features from GitHub.',
    logoUrl: 'https://github.githubassets.com/favicons/favicon.svg',
    docsUrl: 'https://docs.github.com/en/github-models',
    keyUrl: 'https://github.com/settings/tokens',
    billingNote: 'GitHub Models features and billing can vary by account, organization, and public preview availability.',
    authNote: 'Use a GitHub personal access token or supported GitHub credential with access to Models where your account or organization allows it.',
    resources: [
      { label: 'GitHub Models docs', href: 'https://docs.github.com/en/github-models' },
      { label: 'About GitHub Models', href: 'https://docs.github.com/en/github-models/about-github-models' },
      { label: 'Personal access tokens', href: 'https://github.com/settings/tokens' },
    ],
    highlights: ['Model catalog and playground', 'Prompt files and evaluations', 'GitHub-native AI app workflow'],
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    shortDescription: 'Enterprise AWS gateway for private hosted models.',
    description: 'Utilize AWS Bedrock connections to deploy secure private models like Anthropic Claude, Meta Llama, and AWS Titan.',
    logoUrl: 'https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico',
    docsUrl: 'https://aws.amazon.com/bedrock',
    keyUrl: 'https://console.aws.amazon.com/bedrock',
    billingNote: 'Charges are directly routed to your AWS Invoice.',
    authNote: 'Format API Key as AccessKeyID,SecretAccessKey,Region. Or supply OpenAI-compatible proxy gateway coordinates.',
    resources: [
      { label: 'AWS Bedrock Console', href: 'https://console.aws.amazon.com/bedrock' },
    ],
    highlights: ['Secure private workflows', 'Enterprise SLA guarantees', 'Custom fine-tune targets'],
  },
  {
    id: 'openailike',
    name: 'OpenAI-Compatible',
    shortDescription: 'Custom gateway proxies or private local LLM servers.',
    description: 'Route queries to any self-hosted vLLM, Aphrodite, LocalAI, or custom OpenAI-compatible enterprise proxy endpoint.',
    logoUrl: 'https://openai.com/favicon.ico',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    keyUrl: 'http://localhost:8000/v1',
    billingNote: 'Costs are dependent on your server or gateway hosting provider.',
    authNote: 'Format Key as API_KEY,BASE_URL. Useful for proprietary or local custom enterprise backends.',
    resources: [
      { label: 'OpenAI API Specs', href: 'https://platform.openai.com/docs/api-reference' },
    ],
    highlights: ['Custom gateway connections', 'Enterprise private proxies', 'Total endpoint flexibility'],
  },
  {
    id: 'aicredits',
    name: 'AICredits',
    shortDescription: 'OpenAI-compatible access for hosted model routing through one key.',
    description: 'AICredits is presented here as an OpenAI-compatible provider option for routing selected hosted models through an AICredits account key.',
    logoUrl: 'https://aicredits.in/favicon.ico',
    docsUrl: 'https://aicredits.in',
    keyUrl: 'https://aicredits.in',
    billingNote: 'Confirm current model coverage, pricing, and terms in your AICredits dashboard before connecting production workloads.',
    authNote: 'Paste the API key generated from your AICredits account. Treat it as a secret and rotate it if it is exposed.',
    resources: [
      { label: 'AICredits website', href: 'https://aicredits.in' },
      { label: 'Dashboard', href: 'https://aicredits.in' },
    ],
    highlights: ['OpenAI-compatible provider option', 'Single account key', 'Useful for routed hosted models'],
  },
];

/* ── Category grouping ── */
const TOOL_CATEGORIES: Record<string, string[]> = {
  'Google Workspace': ['gmail', 'googledocs', 'googlecalendar', 'googlesheets', 'googlemeet', 'googleslides', 'googlemaps', 'googlephotos', 'drive'],
  'Microsoft 365': ['excel', 'sharepoint'],
  'Developer Tools': ['github', 'github_mcp', 'chrome_devtools_mcp'],
  'Communication': ['telegram', 'discord', 'telegram_mcp'],
  'Productivity': ['notion'],
  'MCP Servers': ['google_workspace_mcp', 'github_mcp', 'telegram_mcp', 'chrome_devtools_mcp'],
};

const MAIN_CATEGORIES: Record<string, string[]> = {
  Google: TOOL_CATEGORIES['Google Workspace'],
  Microsoft: TOOL_CATEGORIES['Microsoft 365'],
  Developer: TOOL_CATEGORIES['Developer Tools'],
  Communication: TOOL_CATEGORIES['Communication'],
  Productivity: TOOL_CATEGORIES['Productivity'],
  'MCP Servers': TOOL_CATEGORIES['MCP Servers'],
};

/* ── Display name helper ── */
function getDisplayName(id: string): string {
  const names: Record<string, string> = {
    gmail: 'Gmail', 
    googlesheets: 'Google Sheets',
    googlecalendar: 'Google Calendar', 
    googledocs: 'Google Docs',
    googlemeet: 'Google Meet', 
    googleslides: 'Google Slides', 
    googlemaps: 'Google Maps',
    googlephotos: 'Google Photos', 
    drive: 'Google Drive',
    excel: 'Excel', 
    sharepoint: 'SharePoint', 
    discord: 'Discord', 
    github: 'GitHub', 
    notion: 'Notion', 
    telegram: 'Telegram', 
    google_workspace_mcp: 'Google Workspace MCP',
    github_mcp: 'GitHub MCP',
    telegram_mcp: 'Telegram MCP',
    chrome_devtools_mcp: 'Chrome DevTools MCP',
  };
  return names[id] || id;
}

export function PluginsManager({ isOpen, setIsOpen, defaultTab = 'skills' }: { isOpen: boolean, setIsOpen: (o: boolean) => void, defaultTab?: 'skills' | 'providers' }) {
  const { 
    connectedPlugins, 
    togglePlugin, 
    apiKeys, 
    setApiKey, 
    provider, 
    setProvider, 
    model, 
    setModel, 
    enabledModels, 
    toggleModel,
    pluginConfigs,
    setPluginConfig
  } = useStore();
  const [search, setSearch] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'skills' | 'providers' | 'providerModels' | 'manage'>(defaultTab as any);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [apiKeyDrafts, setApiKeyDrafts] = useState<Partial<Record<AIProvider, string>>>({});
  const [showProviderKey, setShowProviderKey] = useState(false);
  const [providerKeyEntryOpen, setProviderKeyEntryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allPlugins = Object.values(TOOL_CATEGORIES).flat();
  const selectedProviderInfo = selectedProvider ? AI_PROVIDERS.find((item) => item.id === selectedProvider) || null : null;
  const selectedProviderModels = ALL_MODELS.filter((item) => item.provider === selectedProvider);
  const getProviderKeyValue = (providerId: AIProvider) => apiKeyDrafts[providerId] ?? apiKeys[providerId] ?? '';

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSelectedPlugin(null);
      if (defaultTab === 'providers') {
        setSelectedProvider(null);
        setProviderKeyEntryOpen(false);
        setShowProviderKey(false);
      }
    }
  }, [defaultTab, isOpen, provider]);
  
  const handleConnect = async (plugin: string) => {
    setConnecting(plugin);
    try {
      togglePlugin(plugin);
    } catch (e) {
      console.error("Connect error", e);
    } finally {
      setConnecting(null);
    }
  };

  const visibleCategoryEntries = selectedCategory === 'All'
    ? [['All Apps', allPlugins] as [string, string[]]]
    : [[selectedCategory, MAIN_CATEGORIES[selectedCategory] || allPlugins] as [string, string[]]];
  const categories = visibleCategoryEntries.map(([catName, tools]) => {
    const filteredTools = tools.filter(p => getDisplayName(p).toLowerCase().includes(search.toLowerCase()));
    return { catName, tools: filteredTools };
  }).filter(c => c.tools.length > 0);
  const filteredProviders = AI_PROVIDERS.filter((item) => {
    const query = search.toLowerCase();
    return item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query) || item.shortDescription.toLowerCase().includes(query);
  });
  const selectedPluginDetails = selectedPlugin ? (PLUGIN_DETAILS[selectedPlugin] || {
    ...PLUGIN_DETAILS.default,
    category: Object.entries(TOOL_CATEGORIES).find(([, tools]) => tools.includes(selectedPlugin))?.[0] || 'App',
    website: APP_WEBSITES[selectedPlugin] || `https://www.google.com/search?q=${encodeURIComponent(`${getDisplayName(selectedPlugin)} official website`)}`,
    developer: getDisplayName(selectedPlugin),
    privacy: `https://www.google.com/search?q=${encodeURIComponent(`${getDisplayName(selectedPlugin)} privacy policy`)}`,
    terms: `https://www.google.com/search?q=${encodeURIComponent(`${getDisplayName(selectedPlugin)} terms of service`)}`,
    support: `https://www.google.com/search?q=${encodeURIComponent(`${getDisplayName(selectedPlugin)} customer support`)}`,
  }) : null;
  const selectedPluginWebsite = selectedPlugin ? (APP_WEBSITES[selectedPlugin] || selectedPluginDetails?.website || '#') : '#';
  const selectedPluginDescription = selectedPlugin && selectedPluginDetails
    ? `${getDisplayName(selectedPlugin)} is a ${selectedPluginDetails.category.toLowerCase()} app from ${selectedPluginDetails.developer}. ${selectedPluginDetails.longDescription} Agents can use it for ${selectedPluginDetails.capabilities.join(', ').toLowerCase()} workflows while keeping context inside the conversation.`
    : '';

  const renderLogo = (id: string, name: string, size = 'h-11 w-11') => (
    <div className={`${size} flex flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-2`}>
      {TOOL_LOGOS[id] ? (
        <img
          src={TOOL_LOGOS[id]}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallback === 'true') {
              img.style.display = 'none';
              return;
            }
            img.dataset.fallback = 'true';
            img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(APP_WEBSITES[id] || `${id}.com`)}&sz=128`;
          }}
          loading="lazy"
        />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(APP_WEBSITES[id] || `${id}.com`)}&sz=128`}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      )}
    </div>
  );

  const renderProviderLogo = (item: typeof AI_PROVIDERS[number], size = 'h-11 w-11') => (
    <div className={`${size} flex flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-2`}>
      <img
        src={item.logoUrl}
        alt={`${item.name} logo`}
        className="h-full w-full object-contain"
        onError={(event) => {
          const img = event.currentTarget;
          if (img.dataset.fallback === 'true') {
            img.style.display = 'none';
            return;
          }
          img.dataset.fallback = 'true';
          img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(item.keyUrl).hostname)}&sz=128`;
        }}
        loading="lazy"
      />
    </div>
  );

  const resetToTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSelectedPlugin(null);
    setSelectedProvider(null);
    setProviderKeyEntryOpen(false);
    setShowProviderKey(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[151] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8">
      <div className="flex h-full max-h-[85vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-3xl bg-[#1a1a1a] shadow-2xl border border-white/5 text-gray-100 relative">
        <div className="flex-1 flex flex-col overflow-hidden px-8 pt-8 pb-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-2xl bg-black/20 p-1">
            {(['skills', 'providers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => resetToTab(tab)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {tab === 'skills' ? 'Skills' : 'AI Providers'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'providers' && (
              <button onClick={() => resetToTab('providerModels')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'providerModels' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                <Settings size={16} /> Manage
              </button>
            )}
            <button onClick={() => resetToTab(activeTab === 'providers' ? 'providers' : 'skills')} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white">
              {activeTab === 'providers' ? 'Create provider' : 'Create skill'} <ChevronDown size={15} />
            </button>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-white/10 hover:text-white" aria-label="Close apps">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-6 pr-1 pb-6">
        {activeTab !== 'manage' && !selectedPlugin && !selectedProviderInfo && (
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-white">{activeTab === 'providers' ? 'AI Providers' : activeTab === 'skills' ? 'Skills' : 'Apps'}</h1>
              <p className="mt-2 text-base text-gray-400">
                {activeTab === 'providers' ? 'Connect model providers and choose which models appear in chat.' : activeTab === 'skills' ? 'Reusable agent skills will appear here.' : 'Connect your favorite apps and tools inside the agent workspace.'}
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === 'providers' ? 'Search AI providers' : 'Search apps'}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-white/25"
              />
            </div>
          </div>
        )}

        <main className="mt-8 flex-1 pb-12">
          {activeTab === 'manage' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
              <section className="pb-2">
                <h2 className="text-2xl font-semibold text-white">Manage Tool Connections</h2>
                <p className="mt-2 text-sm text-gray-400 font-sans">Enable or disable your app connections for the AI Agent workspace.</p>
              </section>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {allPlugins.filter(p => getDisplayName(p).toLowerCase().includes(search.toLowerCase())).map(plugin => {
                  const isConnected = !!connectedPlugins[plugin];
                  return (
                    <div
                      key={plugin}
                      className="flex flex-col border border-white/5 bg-white/[0.02] p-4 rounded-xl transition-all min-h-[72px] justify-center relative overflow-hidden group hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex min-w-0 items-center gap-3 flex-1">
                          {renderLogo(plugin, getDisplayName(plugin), 'h-9 w-9')}
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{getDisplayName(plugin)}</span>
                            <span className="text-[11px] text-gray-500 truncate mt-0.5 max-w-[120px] sm:max-w-[180px] font-sans">
                              {isConnected ? 'Active and ready' : 'Not enabled'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              handleConnect(plugin);
                            }}
                            disabled={connecting === plugin}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer ${
                              isConnected
                                ? 'border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'bg-white text-black hover:bg-gray-200'
                            }`}
                          >
                            {connecting === plugin 
                              ? (isConnected ? 'Disconnecting...' : 'Connecting...') 
                              : isConnected 
                                ? 'Disconnect' 
                                : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'skills' ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-gray-500">
              <Blocks className="mb-4 h-12 w-12 opacity-25" />
              <p>No skills available yet.</p>
            </div>
          ) : activeTab === 'providers' ? (
            selectedProviderInfo ? (
              <div className="mx-auto max-w-5xl">
                <button onClick={() => { setSelectedProvider(null); setProviderKeyEntryOpen(false); }} className="mb-10 flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                  <ArrowLeft size={16} /> AI Providers
                </button>
                <section className="border-b border-white/10 pb-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-5">
                      {renderProviderLogo(selectedProviderInfo, 'h-20 w-20')}
                      <div>
                        <h1 className="text-4xl font-semibold text-white">{selectedProviderInfo!.name}</h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">{selectedProviderInfo!.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setProviderKeyEntryOpen(true)} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200">
                        {selectedProviderInfo!.id === 'gemini' ? 'Manage Custom key' : apiKeys[selectedProviderInfo!.id] ? 'Manage key' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-5 border-b border-white/10 py-8">
                  <h2 className="text-2xl font-semibold text-white">Setup</h2>
                  <p className="text-sm leading-7 text-gray-400">{selectedProviderInfo!.authNote}</p>
                  <p className="text-sm leading-7 text-gray-400">{selectedProviderInfo!.billingNote}</p>
                  {providerKeyEntryOpen && (
                    <div className="max-w-2xl">
                        <>
                          <div className="mb-2 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200"><Key size={16} /> Paste API key</label>
                            <button onClick={() => setShowProviderKey(v => !v)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white">
                              {showProviderKey ? <EyeOff size={14} /> : <Eye size={14} />} {showProviderKey ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            type={showProviderKey ? 'text' : 'password'}
                            value={getProviderKeyValue(selectedProviderInfo!.id)}
                            onChange={(event) => setApiKeyDrafts((prev) => ({ ...prev, [selectedProviderInfo!.id]: event.target.value }))}
                            placeholder={`Paste your ${selectedProviderInfo!.name} API key`}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/25"
                          />
                        </>
                      <button
                        onClick={() => {
                          const value = getProviderKeyValue(selectedProviderInfo!.id).trim();
                          if (!value) return;
                          setApiKey(selectedProviderInfo!.id, value);
                          setProvider(selectedProviderInfo!.id);
                          setProviderKeyEntryOpen(false);
                        }}
                        className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </section>

                {(apiKeys[selectedProviderInfo!.id] || selectedProviderInfo!.id === 'gemini') && (
                  <section className="border-b border-white/10 py-8">
                    <h2 className="text-2xl font-semibold text-white">Supported Models</h2>
                    <div className="mt-4 divide-y divide-white/10">
                      {selectedProviderModels.map((item) => {
                        const isEnabled = enabledModels.includes(item.id);
                        return (
                          <div key={`${item.provider}-${item.id}`} className="flex items-center justify-between py-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-200">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.id}</p>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isEnabled}
                              onClick={() => toggleModel(item.id)}
                              className={`flex h-5 w-9 items-center rounded-full p-0.5 ${isEnabled ? 'bg-white' : 'bg-white/15'}`}
                            >
                              <span className={`h-4 w-4 rounded-full transition-transform ${isEnabled ? 'translate-x-4 bg-black' : 'translate-x-0 bg-gray-500'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <section className="py-8">
                  <h2 className="text-2xl font-semibold text-white">Resources</h2>
                  <div className="mt-4 divide-y divide-white/10">
                    {selectedProviderInfo!.resources.map(resource => (
                      <a key={`${resource.label}-${resource.href}`} href={resource.href} target="_blank" rel="noreferrer" className="flex items-center justify-between py-3 text-sm text-gray-300 hover:text-white">
                        {resource.label}
                        <ExternalLink size={16} />
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl">
                <div className="divide-y divide-white/10">
                  {filteredProviders.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedProvider(item.id)}
                      className="flex w-full items-center gap-4 py-5 text-left hover:bg-white/[0.02]"
                    >
                      {renderProviderLogo(item)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white">{item.name}</h3>
                          {provider === item.id && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-black">Default</span>}
                          {apiKeys[item.id] && <Check size={14} className="text-gray-300" />}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.shortDescription}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : selectedPlugin && selectedPluginDetails ? (
            <div className="mx-auto max-w-5xl">
              <button onClick={() => setSelectedPlugin(null)} className="mb-10 flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                Apps <ChevronRight size={14} /> {getDisplayName(selectedPlugin)}
              </button>
              <section className="border-b border-white/10 pb-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    {renderLogo(selectedPlugin, getDisplayName(selectedPlugin), 'h-20 w-20')}
                    <div>
                      <h1 className="text-4xl font-semibold text-white">{getDisplayName(selectedPlugin)}</h1>
                      <p className="mt-2 text-xl text-gray-300">{selectedPluginDetails.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnect(selectedPlugin)}
                    disabled={connecting === selectedPlugin}
                    className={`rounded-full px-7 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      connectedPlugins[selectedPlugin]
                        ? 'border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {connecting === selectedPlugin 
                      ? (connectedPlugins[selectedPlugin] ? 'Disconnecting...' : 'Connecting...') 
                      : connectedPlugins[selectedPlugin] 
                        ? 'Disconnect' 
                        : 'Connect'}
                  </button>
                </div>
              </section>

              {selectedPlugin.endsWith('_mcp') && (
                <section className="border-b border-white/10 py-8">
                  <h2 className="text-2xl font-semibold text-white">MCP Settings</h2>
                  <p className="mt-2 text-sm text-gray-400 mb-6">Specify the environment variables for {getDisplayName(selectedPlugin)}.</p>
                  
                  {selectedPlugin === 'google_workspace_mcp' && (
                    <div className="flex flex-col gap-4 max-w-2xl">
                       <label className="text-sm font-medium text-gray-200">GOOGLE_OAUTH_CLIENT_ID</label>
                       <input 
                         value={pluginConfigs[selectedPlugin]?.GOOGLE_OAUTH_CLIENT_ID || ''}
                         onChange={(e) => setPluginConfig(selectedPlugin, 'GOOGLE_OAUTH_CLIENT_ID', e.target.value)}
                         className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/25"
                         placeholder="Paste your Google OAuth Client ID"
                       />
                       <label className="text-sm font-medium text-gray-200">GOOGLE_OAUTH_CLIENT_SECRET</label>
                       <input 
                         type="password"
                         value={pluginConfigs[selectedPlugin]?.GOOGLE_OAUTH_CLIENT_SECRET || ''}
                         onChange={(e) => setPluginConfig(selectedPlugin, 'GOOGLE_OAUTH_CLIENT_SECRET', e.target.value)}
                         className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/25"
                         placeholder="Paste your Google OAuth Client Secret"
                       />
                    </div>
                  )}

                  {selectedPlugin === 'github_mcp' && (
                    <div className="flex flex-col gap-4 max-w-2xl">
                       <label className="text-sm font-medium text-gray-200">GITHUB_TOKEN</label>
                       <input 
                         type="password"
                         value={pluginConfigs[selectedPlugin]?.GITHUB_TOKEN || ''}
                         onChange={(e) => setPluginConfig(selectedPlugin, 'GITHUB_TOKEN', e.target.value)}
                         className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/25"
                         placeholder="Paste your GitHub Personal Access Token"
                       />
                    </div>
                  )}

                  {selectedPlugin === 'telegram_mcp' && (
                    <div className="flex flex-col gap-4 max-w-2xl">
                       <label className="text-sm font-medium text-gray-200">TELEGRAM_BOT_TOKEN</label>
                       <input 
                         type="password"
                         value={pluginConfigs[selectedPlugin]?.TELEGRAM_BOT_TOKEN || ''}
                         onChange={(e) => setPluginConfig(selectedPlugin, 'TELEGRAM_BOT_TOKEN', e.target.value)}
                         className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/25"
                         placeholder="Paste your Telegram Bot Token"
                       />
                    </div>
                  )}
                  
                  {selectedPlugin === 'chrome_devtools_mcp' && (
                    <div className="flex flex-col gap-4 max-w-2xl">
                       <p className="text-sm text-gray-400">Chrome DevTools MCP does not typically require an API key.</p>
                    </div>
                  )}
                </section>
              )}

              <section className="border-b border-white/10 py-8">
                <div className="custom-scrollbar flex snap-x gap-4 overflow-x-auto pb-3">
                  <a href={selectedPluginWebsite} target="_blank" rel="noreferrer" className="group min-w-[360px] max-w-[420px] snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition-colors hover:border-white/25">
                    <div className="relative h-[235px] bg-white">
                      <img
                        src={getWebsiteScreenshot(selectedPluginWebsite)}
                        alt={`${getDisplayName(selectedPlugin)} website preview`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">Open official app</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white">Official product preview</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{selectedPluginDescription}</p>
                    </div>
                  </a>
                  <a href={getDemoSearchUrl(getDisplayName(selectedPlugin))} target="_blank" rel="noreferrer" className="group min-w-[320px] max-w-[380px] snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition-colors hover:border-white/25">
                    <div className="flex h-[235px] items-center justify-center bg-[radial-gradient(circle_at_top,#252525,#050505)]">
                      <div className="flex flex-col items-center gap-4">
                        {renderLogo(selectedPlugin, getDisplayName(selectedPlugin), 'h-20 w-20')}
                        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Watch demos</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white">Product demos and tutorials</h3>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Open real videos showing how {getDisplayName(selectedPlugin)} works and what agents can do with it.</p>
                    </div>
                  </a>
                  <a href={`${selectedPluginWebsite.replace(/\/$/, '')}/features`} target="_blank" rel="noreferrer" className="group min-w-[300px] max-w-[360px] snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition-colors hover:border-white/25">
                    <div className="relative h-[235px] bg-white">
                      <img
                        src={getWebsiteScreenshot(`${selectedPluginWebsite.replace(/\/$/, '')}/features`)}
                        alt={`${getDisplayName(selectedPlugin)} features preview`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">Features</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white">Feature walkthrough</h3>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Review real product pages and screenshots for core capabilities.</p>
                    </div>
                  </a>
                  <a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${getDisplayName(selectedPlugin)} app screenshots dashboard`)}`} target="_blank" rel="noreferrer" className="group min-w-[300px] max-w-[360px] snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition-colors hover:border-white/25">
                    <div className="flex h-[235px] items-center justify-center bg-[linear-gradient(135deg,#111827,#0f172a,#020617)]">
                      <div className="grid grid-cols-2 gap-3 p-8">
                        {[0, 1, 2, 3].map((item) => (
                          <div key={item} className="h-20 w-28 rounded-xl border border-white/10 bg-white/[0.08]" />
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white">More real screenshots</h3>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Open image results for product UI, dashboards, mobile views, and examples.</p>
                    </div>
                  </a>
                </div>
              </section>

              <section className="border-b border-white/10 py-8">
                <p className="max-w-4xl text-base leading-8 text-gray-300">{selectedPluginDescription}</p>
              </section>

              <section className="py-8">
                <h2 className="text-2xl font-semibold text-white">Information</h2>
                <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
                  {[
                    ['Category', selectedPluginDetails.category],
                    ['Capabilities', selectedPluginDetails.capabilities.join(', ')],
                    ['Developer', selectedPluginDetails.developer],
                    ['Version', selectedPluginDetails.version || 'Official integration'],
                    ['Website', selectedPluginDetails.website],
                    ['Privacy Policy', selectedPluginDetails.privacy || ''],
                    ['Terms of Service', selectedPluginDetails.terms || ''],
                    ['Customer support', selectedPluginDetails.support || ''],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[220px_1fr] gap-4 py-4 text-sm">
                      <span className="text-gray-500">{label}</span>
                      {String(value).startsWith('http') ? (
                        <a href={String(value)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-gray-200 hover:text-white">
                          <span className="truncate">{value}</span>
                          <ExternalLink size={16} />
                        </a>
                      ) : (
                        <span className="text-gray-200">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              <div className="custom-scrollbar mb-8 flex max-w-full gap-2 overflow-x-auto pb-2">
                {['All', ...Object.keys(MAIN_CATEGORIES)].map(label => (
                  <button
                    key={label}
                    onClick={() => setSelectedCategory(label)}
                    className={`shrink-0 border-b px-1.5 py-1 text-xs transition-colors ${selectedCategory === label ? 'border-white text-white' : 'border-transparent text-gray-500 hover:border-white/30 hover:text-gray-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
                {categories.map(cat => (
                  <React.Fragment key={cat.catName}>
                    {cat.tools.map(plugin => (
                      <button key={plugin} onClick={() => setSelectedPlugin(plugin)} className="flex items-center gap-4 border-b border-white/0 py-4 text-left hover:bg-white/[0.02]">
                        {renderLogo(plugin, getDisplayName(plugin), 'h-12 w-12')}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-100">{getDisplayName(plugin)}</h3>
                          <p className="mt-1 truncate text-sm text-gray-500">{TOOL_DESCRIPTIONS[plugin] || 'Connect this app to use it with agents.'}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
         </main>
         </div>
         </div>
       </div>
     </div>
  );
}
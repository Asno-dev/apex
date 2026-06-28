import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { generateText, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/chat', async (req, res) => {
    try {
      const { 
        messages, 
        userId, 
        apiKey = process.env.GEMINI_API_KEY || '',
        providerId = 'google',
        baseUrl
      } = req.body;
      const model = req.body.model || 'gemini-2.5-flash';

      if (!messages || !userId) {
        return res.status(400).json({ error: 'Messages and userId are required' });
      }

      if (!apiKey && providerId !== 'lmstudio' && providerId !== 'ollama' && providerId !== 'openai-like' && providerId !== 'google') {
         // Google fallback to env
        return res.status(500).json({ error: 'API key is missing.' });
      }

      let aiModel;
      
      const configuredApiKey = apiKey || (providerId === 'google' ? process.env.GEMINI_API_KEY : '');

      if (providerId === 'anthropic') {
        const options: any = { apiKey: configuredApiKey };
        if (baseUrl) options.baseURL = baseUrl;
        const anthropic = createAnthropic(options);
        aiModel = anthropic(model);
      } else if (providerId === 'google') {
        const options: any = { 
          apiKey: configuredApiKey,
          headers: { 'User-Agent': 'aistudio-build' }
        };
        if (baseUrl) options.baseURL = baseUrl;
        const google = createGoogleGenerativeAI(options);
        aiModel = google(model);
      } else if (providerId === 'mistral') {
        const options: any = { apiKey: configuredApiKey };
        if (baseUrl) options.baseURL = baseUrl;
        const mistral = createMistral(options);
        aiModel = mistral(model);
      } else if (providerId === 'cohere') {
        const options: any = { apiKey: configuredApiKey };
        if (baseUrl) options.baseURL = baseUrl;
        const cohere = createCohere(options);
        aiModel = cohere(model);
      } else if (providerId === 'amazon-bedrock') {
        let { createAmazonBedrock } = await import('@ai-sdk/amazon-bedrock');
        const amazonBedrock = createAmazonBedrock({
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || configuredApiKey || 'dummy'
        });
        aiModel = amazonBedrock(model);
      } else {
        // Use OpenAI-Compatible Wrapper for everything else (OpenAI, Groq, DeepSeek, Together, LM Studio, etc.)
        const openaiArgs: any = { apiKey: configuredApiKey || 'dummy-key-for-local' };
        if (baseUrl) openaiArgs.baseURL = baseUrl;
        const openai = createOpenAI(openaiArgs);
        aiModel = openai.chat(model);
      }

      let tools: Record<string, any> = {};

      if (process.env.COMPOSIO_API_KEY) {
        try {
          const { Composio } = await import('@composio/core');
          
          let VercelProviderModule;
          try {
            VercelProviderModule = await import('@composio/vercel');
          } catch (e) {
            console.warn('Could not import @composio/vercel', e);
          }
          
          const VercelProvider = VercelProviderModule?.VercelProvider;

          const composio = new Composio(VercelProvider ? { provider: new VercelProvider() } : {});
          
          // Get all toolkits the user has connected
          const connectedAccounts = await composio.connectedAccounts.list({ userIds: [userId] });
          const connectedToolkits = [...new Set(connectedAccounts.items.map((i: any) => i.toolkit.slug))];
          
          if (connectedToolkits.length > 0) {
            const composioTools: any = {};
            for (const toolkitSlug of connectedToolkits) {
              try {
                const tkTools = await composio.tools.get(userId, { toolkits: [toolkitSlug], limit: 1000 } as any);
                Object.assign(composioTools, tkTools);
              } catch (err: any) {
                console.warn(`Failed to load tools for toolkit ${toolkitSlug}:`, err.message);
              }
            }
            
            for (const [name, tool] of Object.entries(composioTools)) {
              tools[name] = {
                description: (tool as any).description,
                parameters: (tool as any).inputSchema || (tool as any).parameters,
                execute: (tool as any).execute
              };
            }
          }
        } catch (composioErr) {
          console.warn("Composio initialization failed (continuing without tools):", composioErr);
        }
      }

      const generateOptions: any = {
        model: aiModel,
        system: `You are a helpful AI assistant connected to the Composio tool integrations platform. You can help the user execute actions across their connected apps using the provided tools. 
The current date and time on the server is ${new Date().toString()} (${new Date().toISOString()}). Please be helpful and resolve user queries intuitively (e.g. if they say 'today' or 'tomorrow' or resolve ambiguous times sensibly referring to the current time context). If a task requires tools you do not see, politely inform the user.`,
        messages: messages,
      };

      if (Object.keys(tools).length > 0) {
        generateOptions.tools = tools;
        generateOptions.stopWhen = stepCountIs(5);
      }

      let result;
      try {
        result = await generateText(generateOptions);
      } catch (err: any) {
        if (
          err.message?.toLowerCase().includes('tool') || 
          err.message?.toLowerCase().includes('function') || 
          err.message?.toLowerCase().includes('unsupported') ||
          err.name === 'NoSuchToolError'
        ) {
          console.warn("Model failed with tools, retrying without tools:", err.message);
          delete generateOptions.tools;
          delete generateOptions.stopWhen;
          result = await generateText(generateOptions);
        } else {
          throw err;
        }
      }

      let toolCallsExecuted = 0;
      if (result.steps && result.steps.length > 0) {
        for (const step of result.steps) {
           if (step.toolCalls && step.toolCalls.length > 0) {
             toolCallsExecuted += step.toolCalls.length;
           }
        }
      }

      res.json({ text: result.text, toolCallsExecuted });
    } catch (error: any) {
      console.error('Error in chat:', error);
      let errorMessage = error.message || 'An error occurred during the request';
      
      if (
        errorMessage.includes('Bad credentials') || 
        errorMessage.includes('Incorrect API key') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Invalid API Key') || 
        errorMessage.includes('API key is missing')
      ) {
         errorMessage = `Invalid or missing API Key. Please click the Settings icon and provide a valid API Key for the selected provider (${req.body.providerId || 'AI'}).`;
      }
      res.status(500).json({ error: errorMessage });
    }
  });



  app.get('/api/apps', async (req, res) => {
    try {
      if (!process.env.COMPOSIO_API_KEY) {
        return res.json({ apps: [] });
      }
      const composio = new Composio();
      const toolkits = await composio.toolkits.get();
      // map them to a simple list
      res.json({ 
        apps: Array.isArray(toolkits) ? toolkits.map((t: any) => ({ name: t.name, slug: t.slug, logo: t.meta?.logo })) : []
      });
    } catch (error: any) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ error: error.message || 'An error occurred fetching apps' });
    }
  });

  app.post('/api/connect', async (req, res) => {
    try {
      const { userId, authConfigId } = req.body;
      
      if (!userId || !authConfigId) {
         return res.status(400).json({ error: 'userId and authConfigId are required' });
      }

      if (!process.env.COMPOSIO_API_KEY) {
        return res.status(500).json({ error: 'COMPOSIO_API_KEY is not configured' });
      }

      const composio = new Composio();
      const redirectUrl = process.env.APP_URL || 'http://localhost:3000';
      
      const connectionRequest = await composio.toolkits.authorize(
        userId,
        authConfigId
      );
      
      res.json({ redirectUrl: connectionRequest.redirectUrl });
    } catch (error: any) {
      console.error('Error initiating connection:', error);
      let errorMessage = error.message || 'An error occurred during the request';
      if (errorMessage.includes('No Default auth config found')) {
         errorMessage = `This app requires you to configure its OAuth credentials in your Composio Dashboard first. Original error: ${errorMessage}`;
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


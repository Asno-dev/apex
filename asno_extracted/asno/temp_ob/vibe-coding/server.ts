import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { existsSync, writeFileSync, readFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import OpenAI from "openai";
import dotenv from "dotenv";
import { OPENCODE_SYSTEM_PROMPT, OPENCODE_PLAN_PROMPT, getProviderPromptSuffix } from "./src/lib/constants";
import { loadProjectInstructions, formatSkillsForPrompt, compactConversationHistory, needsCompaction } from "./src/lib/skills";
import { getAllMcpTools, executeMcpTool } from "./src/lib/mcpClient";

dotenv.config();

function computerUrl() {
  return process.env.COMPUTER_URL || "http://localhost:4000";
}

let detectedDesktopUrl = "http://localhost:5000";

function desktopUrl() {
  return process.env.DESKTOP_URL || process.env.DESKTOP_AGENT_URL || detectedDesktopUrl;
}

/** Base URL of this Vite app (for server-side callbacks to composio routes). */
function appOrigin() {
  return process.env.APP_URL || process.env.VITE_APP_ORIGIN || process.env.PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
}

const INVALID_OR_SANDBOX_KEYS = new Set<string>();

function isDummyKey(key: any): boolean {
  if (!key) return true;
  const s = String(key).trim().toLowerCase();
  
  // Treat invalid keys flagged at runtime as dummy/sandbox keys
  if (INVALID_OR_SANDBOX_KEYS.has(String(key).trim())) {
    return true;
  }

  return (
    s === "" ||
    s.includes("dummy") ||
    s.includes("your") ||
    s.includes("placeholder") ||
    s.includes("sk_12345") ||
    (s.startsWith("sk-") && s.length < 15)
  );
}

function toWorkspaceRelative(filePath: string): string {
  if (!filePath) return "";
  let s = String(filePath).trim();
  if (s.startsWith("/workspace/")) s = s.slice("/workspace/".length);
  else if (s === "/workspace") s = "";
  if (s.startsWith("/")) s = s.slice(1);
  return s;
}

function normSandpackPath(filePath: string): string {
  let normPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  // For Next.js App Router projects, we keep the paths as they are in the workspace
  return normPath;
}

/** Approximate +/-/ line counts for UI (fast, no external diff dependency). */
function diffLineCounts(before: string | undefined, after: string): { additions: number; deletions: number } {
  if (before === undefined || before === "") {
    return { additions: after.split("\n").length, deletions: 0 };
  }
  const a = before.split("\n");
  const b = after.split("\n");
  let i = 0;
  let j = 0;
  const maxLook = 80;
  let additions = 0;
  let deletions = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    let advanced = false;
    for (let k = j + 1; k < Math.min(j + maxLook, b.length); k++) {
      if (b[k] === a[i]) {
        additions += k - j;
        j = k;
        advanced = true;
        break;
      }
    }
    if (advanced) continue;
    for (let k = i + 1; k < Math.min(i + maxLook, a.length); k++) {
      if (a[k] === b[j]) {
        deletions += k - i;
        i = k;
        advanced = true;
        break;
      }
    }
    if (advanced) continue;
    additions++;
    deletions++;
    i++;
    j++;
  }
  additions += b.length - j;
  deletions += a.length - i;
  return { additions, deletions };
}

function mapAgentTool(tool: string, args: any): { tool: string; args: any } {
  if (tool === "code.analyze") return { tool: "code.analyze", args: args || {} };
  if (tool === "code.create" || tool === "code.edit") return { tool: "code.update", args: args || {} };
  if (tool === "code.explore") {
    if (args?.path) return { tool: "sandbox.readFile", args: { path: args.path } };
    return { tool: "web.search", args: { query: args?.query || args?.q || "" } };
  }
  return { tool, args: args || {} };
}

// Composio legacy connection helpers have been removed and replaced with ComposioIntegrationService.


function sendAgentEvent(res: express.Response, event: any) {
  res.write(`data: ${JSON.stringify({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now(), ...event })}\n\n`);
}

function getProviderBaseUrl(provider: string, apiKey?: string) {
  if (provider === "gemini") return "https://generativelanguage.googleapis.com/v1beta/openai";
  if (provider === "openai") return "https://api.openai.com/v1";
  if (provider === "anthropic") return "https://api.anthropic.com";
  if (provider === "groq") return "https://api.groq.com/openai/v1";
  if (provider === "xai") return "https://api.x.ai/v1";
  if (provider === "deepseek") return "https://api.deepseek.com/v1";
  if (provider === "mistral") return "https://api.mistral.ai/v1";
  if (provider === "cohere") return "https://api.cohere.com/v2";
  if (provider === "together") return "https://api.together.xyz/v1";
  if (provider === "perplexity") return "https://api.perplexity.ai";
  if (provider === "huggingface") return "https://api-inference.huggingface.co/v1";
  if (provider === "ollama") return "http://localhost:11434/v1";
  if (provider === "lmstudio") return "http://localhost:1234/v1";
  if (provider === "openrouter") return "https://openrouter.ai/api/v1";
  if (provider === "moonshot") return "https://api.moonshot.cn/v1";
  if (provider === "hyperbolic") return "https://api.hyperbolic.xyz/v1";
  if (provider === "github") return "https://models.inference.ai.azure.com";
  if (provider === "bedrock") {
    if (apiKey && apiKey.includes(",")) {
      const parts = apiKey.split(",");
      return parts[1]?.trim() || "https://bedrock-runtime.us-east-1.amazonaws.com";
    }
    return "https://bedrock-runtime.us-east-1.amazonaws.com";
  }
  if (provider === "openailike") {
    if (apiKey && apiKey.includes(",")) {
      const parts = apiKey.split(",");
      return parts[1]?.trim() || "http://localhost:8000/v1";
    }
    return "http://localhost:8000/v1";
  }
  if (provider === "aicredits") return "https://api.aicredits.in/v1";
  return "https://generativelanguage.googleapis.com/v1beta/openai";
}

const PROVIDER_MODEL_FALLBACKS: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4-turbo"],
  anthropic: ["claude-3-5-sonnet-latest"],
  gemini: ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-1.5-pro"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  xai: ["grok-2"],
  deepseek: ["deepseek-chat"],
  mistral: ["mistral-large-latest"],
  cohere: ["command-r-plus"],
  together: ["meta-llama/Llama-3.3-70B-Instruct-Turbo"],
  perplexity: ["sonar-reasoning"],
  huggingface: ["meta-llama/Meta-Llama-3.1-8B-Instruct"],
  ollama: ["llama3"],
  lmstudio: ["local-model"],
  openrouter: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"],
  moonshot: ["moonshot-v1-8k"],
  hyperbolic: ["meta-llama/Llama-3.3-70B-Instruct"],
  github: ["gpt-4o"],
  bedrock: ["anthropic.claude-3-5-sonnet-v2-0"],
  openailike: ["custom-model"],
  aicredits: ["gpt-4o"],
};

function lineRangeFromContent(content: string) {
  const lineEnd = Math.max(1, String(content).split("\n").length);
  return { lineStart: 1, lineEnd };
}

function isFolderLikePath(filePath: string) {
  const p = String(filePath || "").trim();
  return !p || p.endsWith("/") || (!p.includes(".") && !p.match(/\.[a-z0-9]+$/i));
}

function healJson(jsonStr: string): string {
  let str = cleanEscapedQuotes(jsonStr.trim());
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

function cleanEscapedQuotes(jsonStr: string): string {
  let str = jsonStr;
  const containsEscapedQuotes = str.includes('\\"');
  if (containsEscapedQuotes) {
    // 1. Fix escaped keys: \"something\": -> "something":
    str = str.replace(/\\"(.*?)\\":/g, '"$1":');

    // 2. Fix escaped string values: : \"something\" -> : "something"
    str = str.replace(/:\s*\\"(.*?)\\"/g, ': "$1"');

    // 3. Fix escaped quotes in arrays
    str = str.replace(/\[\s*\\"(.*?)\\"/g, '["$1"');
    str = str.replace(/\\"\s*,\s*\\"(.*?)\\"/g, '", "$1"');
    str = str.replace(/\\"\s*\]/g, '"]');

    // 4. Fix other common remaining escaped quote sequences around syntax marks
    str = str.replace(/,\s*\\"(.*?)\\"/g, ', "$1"');
    str = str.replace(/\\"\s*,/g, '",');
    str = str.replace(/\{\s*\\"(.*?)\\"/g, '{"$1"');
    str = str.replace(/\\"\s*\}/g, '"}');
  }
  return str;
}

function robustParseJson(str: string): any {
  let cleaned = String(str || "{}").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\n/, "").replace(/```$/, "").trim();
  }
  
  // 1. Try to parse directly without any quote manipulation first
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === "string") {
      // Handles double-serialized JSON
      return robustParseJson(parsed);
    }
    return parsed;
  } catch (directError) {
    // 2. Only if direct parsing fails, clean escaping issues and try again
    const withCleanEscaped = cleanEscapedQuotes(cleaned);
    try {
      const parsedEscaped = JSON.parse(withCleanEscaped);
      if (typeof parsedEscaped === "string") {
        return robustParseJson(parsedEscaped);
      }
      return parsedEscaped;
    } catch (escapedError) {
      // 3. Fall back to healing
      try {
        const healed = healJson(withCleanEscaped);
        const parsedHealed = JSON.parse(healed);
        if (typeof parsedHealed === "string") {
          return robustParseJson(parsedHealed);
        }
        return parsedHealed;
      } catch (eHeal) {
        // 4. Try to extract from first and last brace of the original raw JSON string
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          try {
            const subParsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
            if (typeof subParsed === "string") {
              return robustParseJson(subParsed);
            }
            return subParsed;
          } catch (e1) {
            const firstBracket = cleaned.indexOf('[');
            const lastBracket = cleaned.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              try {
                const subArrParsed = JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
                if (typeof subArrParsed === "string") {
                  return robustParseJson(subArrParsed);
                }
                return subArrParsed;
              } catch (e2) {}
            }
          }
        }
        throw directError;
      }
    }
  }
}

function decodeBase64Text(base64Str: string): string {
  try {
    return Buffer.from(base64Str, 'base64').toString('utf8');
  } catch (e) {
    return "[Unable to decode base64 text]";
  }
}

function getFilePromptAdditions(files: any[] | undefined): string {
  if (!files || !Array.isArray(files)) return "";
  let additions = "";
  for (const file of files) {
    if (!file.data) continue;
    const isImage = file.type?.startsWith("image/") || file.name?.endsWith(".png") || file.name?.endsWith(".jpg") || file.name?.endsWith(".jpeg") || file.name?.endsWith(".webp") || file.name?.endsWith(".gif");
    const isPdf = file.type === "application/pdf" || file.name?.endsWith(".pdf");
    if (!isImage && !isPdf) {
      const decoded = decodeBase64Text(file.data);
      additions += `\n\n---
[USER ATTACHED FILE CONTENT: ${file.name}]
File MimeType: ${file.type}
Content:
${decoded}
---`;
    }
  }
  return additions;
}

async function callJsonModel(body: any, system: string, user: string) {
  let provider = body.provider || "gemini";
  let apiKey = body.apiKey;
  let baseUrl = body.baseUrl;
  let primaryModel = body.model;
  if (primaryModel === "gemini-testing-model") {
    primaryModel = "gemini-3.5-flash";
  }
  let content = "";

  if ((!apiKey || apiKey === "temporary" || apiKey === "system_key" || apiKey === "none") && provider === "gemini") {
    apiKey = process.env.GEMINI_API_KEY || "";
  }

  if (!apiKey) {
    throw new Error(`API key is missing for ${provider}. Open Settings and add your key.`);
  }

  const filePromptAdditions = getFilePromptAdditions(body.files);
  const enrichedUserPrompt = user + filePromptAdditions;

  if (provider === "gemini") {
    const modelsToTry = [
      ...new Set([primaryModel, ...(PROVIDER_MODEL_FALLBACKS[provider] || [])]),
    ];
    let lastError: Error | null = null;
    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const inlineParts: any[] = [];
          if (body.files && Array.isArray(body.files)) {
            for (const file of body.files) {
              if (!file.data) continue;
              const isImage = file.type?.startsWith("image/") || file.name?.endsWith(".png") || file.name?.endsWith(".jpg") || file.name?.endsWith(".jpeg") || file.name?.endsWith(".webp") || file.name?.endsWith(".gif");
              const isPdf = file.type === "application/pdf" || file.name?.endsWith(".pdf");
              if (isImage || isPdf) {
                inlineParts.push({
                  inlineData: {
                    mimeType: isImage ? (file.type || "image/jpeg") : "application/pdf",
                    data: file.data
                  }
                });
              }
            }
          }

          const contents = [
            ...(body.history || []).map((m: any) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: String(m.content) }]
            })),
            {
              role: "user",
              parts: [
                { text: enrichedUserPrompt },
                ...inlineParts
              ]
            }
          ];

          const cleanContents: any[] = [];
          for (const msg of contents) {
            if (cleanContents.length > 0 && cleanContents[cleanContents.length - 1].role === msg.role) {
              const prevText = cleanContents[cleanContents.length - 1].parts[0].text || "";
              const currentText = msg.parts[0].text || "";
              cleanContents[cleanContents.length - 1].parts = [
                { text: prevText + "\n\n" + currentText },
                ...(msg.parts.slice(1) || [])
              ];
            } else {
              cleanContents.push({
                role: msg.role,
                parts: msg.parts
              });
            }
          }
          if (cleanContents.length > 0 && cleanContents[0].role === "model") {
            cleanContents.shift();
          }

          const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(nativeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: cleanContents,
              systemInstruction: system ? { parts: [{ text: system }] } : undefined,
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4
              }
            }),
            signal: AbortSignal.timeout(120_000)
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`Gemini API error ${response.status}: ${errorText}`);
          }

          const resData = await response.json();
          const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error(`Empty response from Gemini model ${model}`);
          }
          content = text;
          break;
        } catch (e: any) {
          lastError = e instanceof Error ? e : new Error(String(e));
          const msg = lastError.message.toLowerCase();
          const isLimitZero = msg.includes("limit: 0") || msg.includes("limit:0");
          const isHardQuotaExceeded = (msg.includes("exceeded your current quota") || 
                                       msg.includes("plan and billing details") || 
                                       (msg.includes("quota") && msg.includes("exceeded") && !msg.includes("rate limit"))) &&
                                      !msg.includes("please retry in") &&
                                      !msg.includes("retry in") &&
                                      !isLimitZero;

          const isQuotaExhausted = msg.includes("resource_exhausted") ||
                                   msg.includes("429") ||
                                   msg.includes("rate limit") ||
                                   msg.includes("too many requests") ||
                                   msg.includes("please retry in") ||
                                   msg.includes("quota exceeded");

          const hasMoreModels = modelsToTry.indexOf(model) < modelsToTry.length - 1;

          if (isLimitZero || isHardQuotaExceeded || (isQuotaExhausted && hasMoreModels && (model === "gemini-3.1-pro-preview" || attempt > 0))) {
            console.warn(`[Gemini Native API] Fallback Triggered: Model ${model} is unavailable (quota/limited). Skipping to next model.`);
            break; // Skip remaining attempts for this model and proceed to the next fallback model immediately!
          }

          console.warn(`[Gemini Native API Warning] Model: ${model}, Attempt: ${attempt + 1}/3, Error: ${lastError.message}`);

          let waitTime = attempt === 0 ? 2500 : 5000;
          const retryMatch = msg.match(/please retry in ([0-9.]+)\s*s/);
          if (retryMatch) {
            const seconds = parseFloat(retryMatch[1]);
            if (!isNaN(seconds)) {
              waitTime = Math.min(Math.ceil(seconds * 1000) + 500, 65000);
            }
          }

          if (isQuotaExhausted) {
            console.warn(`[Gemini Native API] Quota/Rate limit hit for ${model}. Waiting ${waitTime}ms before retry...`);
            await new Promise((r) => setTimeout(r, waitTime));
            continue; // Retry this model
          }

          await new Promise((r) => setTimeout(r, attempt === 0 ? 1500 : 3000));
        }
      }
      if (content) break;
    }

    if (!content) {
      throw lastError || new Error("Native Gemini request failed after retries.");
    }

    try {
      return robustParseJson(content);
    } catch (parseError: any) {
      console.error("❌ [JSON Parse Error] Failed to parse model response:", parseError.message);
      console.error("📄 [Raw Content]:", content);
      throw new Error(`Failed to parse model JSON: ${parseError.message}. Raw response: ${content.slice(0, 200)}...`);
    }
  }

  let actualApiKey = apiKey;
  if ((provider === "openailike" || provider === "bedrock" || provider === "openai" || provider === "openrouter") && apiKey && apiKey.includes(",")) {
    const parts = apiKey.split(",");
    actualApiKey = parts[0]?.trim();
    if (parts[1]) {
      baseUrl = parts[1]?.trim();
    }
  }

  baseUrl = baseUrl || getProviderBaseUrl(provider, apiKey);
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  primaryModel = primaryModel || (provider === "gemini" ? "gemini-3.5-flash" : "gpt-4o-mini");

  let url = baseUrl;
  if (provider === "anthropic") {
    if (!url.includes("/v1/messages")) {
      url = `${url.replace(/\/+$/, "")}/v1/messages`;
    }
  } else {
    if (!url.includes("/chat/completions")) {
      url = `${url.replace(/\/+$/, "")}/chat/completions`;
    }
  }

  const modelsToTry = [
    ...new Set([primaryModel, ...(PROVIDER_MODEL_FALLBACKS[provider] || [])]),
  ];

  const otherFilePromptAdditions = getFilePromptAdditions(body.files);
  const otherEnrichedUserPrompt = user + otherFilePromptAdditions;

  let finalUserContent: any = otherEnrichedUserPrompt;
  const hasImages = body.files && Array.isArray(body.files) && body.files.some((f: any) => f.type?.startsWith("image/") || f.name?.endsWith(".png") || f.name?.endsWith(".jpg") || f.name?.endsWith(".jpeg") || f.name?.endsWith(".webp") || f.name?.endsWith(".gif"));

  if (hasImages && (provider === "openai" || provider === "openrouter" || provider === "openailike")) {
    const arr: any[] = [{ type: "text", text: otherEnrichedUserPrompt }];
    for (const file of body.files) {
      const isImage = file.type?.startsWith("image/") || file.name?.endsWith(".png") || file.name?.endsWith(".jpg") || file.name?.endsWith(".jpeg") || file.name?.endsWith(".webp") || file.name?.endsWith(".gif");
      if (isImage && file.data) {
        arr.push({
          type: "image_url",
          image_url: {
            url: `data:${file.type || 'image/jpeg'};base64,${file.data}`
          }
        });
      }
    }
    finalUserContent = arr;
  }

  const messages = [
    { role: "system", content: system },
    ...(body.history || []).map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: finalUserContent },
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120_000);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-OpenRouter-Title": "AI Web Builder Studio",
          "HTTP-Referer": appOrigin(),
        };

        if (provider === "anthropic") {
          headers["x-api-key"] = actualApiKey;
          headers["anthropic-version"] = "2023-06-01";
        } else if (actualApiKey && actualApiKey !== "none") {
          headers["Authorization"] = `Bearer ${actualApiKey}`;
        }

        let bodyPayload: any;
        if (provider === "anthropic") {
          const filteredMessages: any[] = [];
          for (const msg of messages) {
            if (msg.role === "system") continue;
            const role = msg.role === "assistant" ? "assistant" : "user";
            if (filteredMessages.length > 0 && filteredMessages[filteredMessages.length - 1].role === role) {
              filteredMessages[filteredMessages.length - 1].content += "\n\n" + msg.content;
            } else {
              filteredMessages.push({ role, content: msg.content });
            }
          }
          if (filteredMessages.length > 0 && filteredMessages[0].role === "assistant") {
            filteredMessages.shift();
          }
          bodyPayload = {
            model,
            system: system,
            messages: filteredMessages,
            max_tokens: 4000,
            temperature: 0.4,
          };
        } else {
          bodyPayload = {
            model,
            messages,
            temperature: 0.4,
          };
          if (["openai", "gemini", "openrouter", "deepseek", "github", "aicredits", "groq", "xai", "together", "hyperbolic", "openailike"].includes(provider)) {
            bodyPayload.response_format = { type: "json_object" };
          }
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          let cleanMessage = "";
          try {
            const parsed = JSON.parse(errorText);
            const errObj = Array.isArray(parsed) ? parsed[0]?.error : parsed?.error;
            if (errObj && errObj.message) {
              cleanMessage = errObj.message;
              if (errObj.code === 503 || errObj.status === "UNAVAILABLE" || errorText.includes("high demand") || errorText.includes("UNAVAILABLE")) {
                cleanMessage = "The AI model is currently experiencing high demand (503 Service Unavailable). Spikes in demand are usually temporary. Please try again in a few moments, or select a different model in Settings.";
              } else if (errorText.includes("quota") || errorText.includes("429")) {
                cleanMessage = "You have exceeded your API quota or rate limit. " + cleanMessage;
              }
            }
          } catch {
            // Not JSON
          }
          if (!cleanMessage) {
            cleanMessage = errorText || `Model request failed with status code ${response.status} for ${model}`;
          }
          throw new Error(cleanMessage);
        }

        const data = await response.json();

        if (typeof data === "string") {
          content = data;
        } else {
          content =
            data?.choices?.[0]?.message?.content ||
            data?.content?.[0]?.text ||
            data?.message?.content ||
            data?.content ||
            data?.text ||
            JSON.stringify(data);
        }
        break;
      } catch (e: any) {
        let err = e instanceof Error ? e : new Error(String(e));
        const msg = err.message || "";
        if (msg.includes("abort")) {
          err = new Error(`Request timed out for ${model}. Check network or try a faster model.`);
        } else if (
          msg === "fetch failed" ||
          msg.includes("ECONNREFUSED") ||
          msg.includes("ENOTFOUND") ||
          msg.includes("ECONNRESET")
        ) {
          err = new Error(
            `Cannot reach ${provider} API (${baseUrl}). Check internet, firewall, and API key.`,
          );
        }
        
        console.warn(`[Model API Warning] Model: ${model}, Attempt: ${attempt + 1}/3, Error: ${err.message}`);
        
        lastError = err;
        
        const isQuotaExhausted = (msg.includes("exceeded your current quota") || 
                                 msg.includes("plan and billing details") || 
                                 (msg.includes("quota") && msg.includes("exceeded") && !msg.includes("rate limit"))) &&
                                 !msg.includes("please retry in") &&
                                 !msg.includes("retry in");

        const hasMoreModels = modelsToTry.indexOf(model) < modelsToTry.length - 1;

        if (isQuotaExhausted) {
          console.warn(`[Model API Error] Quota exhausted for ${model}, falling back immediately.`);
          break; // Don't retry the same model if quota is strictly exhausted
        }

        if (hasMoreModels && (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("limit: 0") || msg.includes("limit:0"))) {
          console.warn(`[Model API Warning] Quota/Limit hit for ${model}. Falling back to next model immediately.`);
          break; // Skip further attempts for this model and go to the next fallback model!
        }
        
        let delay = attempt === 0 ? 1500 : 3000;
        if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("please retry in") || msg.includes("retry in")) {
          // Gemini 429 "Resource has been exhausted (e.g. check quota)"
          delay = attempt === 0 ? 5000 : 15000;
          const retryMatch = msg.match(/please retry in ([0-9.]+)\s*s/);
          if (retryMatch) {
            const seconds = parseFloat(retryMatch[1]);
            if (!isNaN(seconds)) {
              delay = Math.min(Math.ceil(seconds * 1000) + 500, 65000);
            }
          }
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    if (content) break;
  }

  if (!content) {
    if (provider !== "gemini" && process.env.GEMINI_API_KEY) {
      console.warn(`[Model API Fallback] External provider ${provider} failed with: ${lastError?.message || "Unknown error"}. Seamlessly falling back to Gemini Native key.`);
      const fallbackBody = {
        ...body,
        provider: "gemini",
        model: "gemini-3.5-flash",
        apiKey: process.env.GEMINI_API_KEY
      };
      return callJsonModel(fallbackBody, system, user);
    }
    throw lastError || new Error("Model request failed after retries.");
  }

  try {
    return robustParseJson(content);
  } catch (parseError: any) {
    console.error("❌ [JSON Parse Error] Failed to parse model response:", parseError.message);
    console.error("📄 [Raw Content]:", content);
    throw new Error(`Failed to parse model JSON: ${parseError.message}. Raw response: ${content.slice(0, 200)}...`);
  }
}

function sanitizeModelFiles(files: any) {
  if (!files || typeof files !== "object") return {};
  const output: Record<string, string> = {};
  for (const [filePath, content] of Object.entries(files)) {
    if (typeof content === "string") output[filePath] = content;
  }
  return output;
}

async function runBootDiagnosis() {
  console.log("\n=======================================================");
  console.log("🔍 [BOOT DIAGNOSIS] Verifying Sandbox & Desktop Connectivity...");
  console.log("=======================================================");

  const targets = [
    { name: "Desktop API (Port 5000)", url: "http://localhost:5000" },
    { name: "Desktop API (Mapped Port 5070)", url: "http://localhost:5070" },
    { name: "Desktop API (Docker Service Name)", url: "http://desktop:5000" },
    { name: "Computer Sandbox Health (Port 4000)", url: "http://localhost:4000" }
  ];

  let resolvedDesktop: string | null = null;

  for (const target of targets) {
    try {
      const res = await fetch(`${target.url}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        console.log(`✅ [CONNECTIVITY] ${target.name} is reachable at ${target.url}`);
        if (target.name.includes("Desktop") && !resolvedDesktop) {
          resolvedDesktop = target.url;
        }
      }
    } catch (err: any) {
      // Ignore connection failures as they are expected when running in Cloud Run or purely web environments
    }
  }

  if (resolvedDesktop) {
    detectedDesktopUrl = resolvedDesktop;
    console.log(`🎯 [BOOT STATUS] Dynamic port resolution selected: ${detectedDesktopUrl} as active desktop agent endpoint.`);
  } else {
    console.log(`ℹ️ [BOOT STATUS] Local browser fallback mode active. Desktop API/Computer sandbox is offline (this is normal).`);
  }
  console.log("=======================================================\n");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.argv[2] || process.env.PORT || 3000);

  // Ensure workspace directory exists
  const workspaceDir = path.join(process.cwd(), "workspace");
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }

  // Cross-Origin Isolation Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use("/office-outputs", express.static(path.join(process.cwd(), "output")));

  // List recent documents
  app.get("/api/documents", (req, res) => {
    const outDir = path.join(process.cwd(), "output");
    if (!existsSync(outDir)) {
      return res.json({ documents: [] });
    }
    try {
      const files = readdirSync(outDir);
      const docs = files
        .filter((f: string) => f.match(/\.(docx|xlsx|pptx)$/i))
        .map((f: string) => {
          const stats = statSync(path.join(outDir, f));
          return { name: f, time: stats.mtime.getTime(), url: `/office-outputs/${f}` };
        })
        .sort((a: any, b: any) => b.time - a.time);
      res.json({ documents: docs });
    } catch (e) {
      res.json({ documents: [] });
    }
  });

  // Save report or spreadsheet document back to disk
  app.post("/api/documents/save", async (req, res) => {
    const { filename, content, isBase64 } = req.body || {};
    if (!filename || !content) {
      return res.status(400).json({ error: "Missing filename or content" });
    }
    const outDir = path.join(process.cwd(), "output");
    const filePath = path.join(outDir, filename);
    
    try {
      if (!existsSync(outDir)) {
        await fs.mkdir(outDir, { recursive: true });
      }
      
      if (isBase64) {
        const buffer = Buffer.from(content, 'base64');
        await fs.writeFile(filePath, buffer);
      } else {
        await fs.writeFile(filePath, content, "utf-8");
      }
      
      console.log(`💾 Saved document ${filename} successfully inside output/`);
      res.json({ success: true, url: `/office-outputs/${filename}` });
    } catch (e: any) {
      console.error("Save Excel/Doc error:", e);
      res.status(500).json({ error: e.message || "Failed to save file" });
    }
  });

  app.post("/api/agent/stream", async (req, res) => {
    const body = req.body || {};
    const prompt = String(body.prompt || "");
    console.log(`🚀 [/api/agent/stream] Prompt: "${prompt}", Provider: ${body.provider}, Model: ${body.model}`);
    const maxIterations = 20;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const connectedTools = Object.keys(body.toolConnections || {}).filter(k => body.toolConnections[k]?.status === "connected");
    
    // Check for MCP connections and fetch exposed tools
    let mcpToolsPrompt = "";
    try {
      const activeConfigs = body.pluginConfigs || {};
      const connectedMcpConfigs: Record<string, any> = {};
      for (const tool of connectedTools) {
        if (tool.endsWith("_mcp")) {
          connectedMcpConfigs[tool] = activeConfigs[tool] || {};
        }
      }
      
      const mcpToolsMeta = await getAllMcpTools(connectedMcpConfigs);
      if (mcpToolsMeta && mcpToolsMeta.length > 0) {
        const toolsInfo = mcpToolsMeta.map(s => `Server ${s.serverName} exposes tools:\n` + s.tools.map(t => `- ${t.name}: ${t.description}`).join('\n')).join('\n\n');
        mcpToolsPrompt = `\n\n[EXTERNAL MCP TOOLS CONNECTED]\nYou have access to external tool integrations via MCP (Model Context Protocol). You can call these tools just like you do normal tools, by specifying "tool": "\${TOOL_NAME}" in your JSON response and providing the appropriate "args".\n\nHere are the MCP tools available to you:\n${toolsInfo}`;
      }
    } catch (e) {
      console.error("Failed to fetch MCP tools early setup:", e);
    }
    
    let currentFilesState: Record<string, string> = { ...(body.currentFiles || {}) };
    let currentDepsState: Record<string, string> = { ...(body.currentDependencies || {}) };
    const observations: string[] = [];
    const changedFiles = new Set<string>();
    const exploredPaths = new Set<string>();
    let consecutiveFailures = 0;

    let swarmState = [
      { id: "rmcs", name: "Recursive Meta-Cognitive Swarm (RMCS)", role: "Core Intelligence & Multi-Lane Coordinator", status: "thinking" as string, detail: "Synthesizing master intent and analyzing workspace index...", updatedAt: Date.now() },
      { id: "thread-scout-research", name: "RMCS Lane: Dual Scout & Analyst [Thread #1]", role: "Deep search, regex patterns & scanning", status: "idle" as string, detail: "Awaiting activation signals", updatedAt: Date.now() },
      { id: "thread-planner-blueprint", name: "RMCS Lane: Strategic Planner [Thread #2]", role: "Logical architectures & roadmaps", status: "idle" as string, detail: "Awaiting task decomposition", updatedAt: Date.now() },
      { id: "thread-builder-forge", name: "RMCS Lane: Code Synthesizer [Thread #3]", role: "Writing, editing and files synthesis", status: "idle" as string, detail: "Awaiting design guidelines", updatedAt: Date.now() },
      { id: "thread-reviewer-qa", name: "RMCS Lane: Self-Repair & Auditor [Thread #4]", role: "Syntax audits & compile execution loops", status: "idle" as string, detail: "Awaiting quality criteria", updatedAt: Date.now() },
    ];

    const emitSwarmState = () => {
      sendAgentEvent(res, {
        type: "sub_agents_update",
        subAgents: swarmState.map(s => ({ ...s, updatedAt: Date.now() }))
      });
    };

    const updateSwarmAgent = (id: string, updates: Partial<typeof swarmState[0]>) => {
      swarmState = swarmState.map(s => {
        if (s.id === id) {
          return { ...s, ...updates, updatedAt: Date.now() };
        }
        return s;
      });
      emitSwarmState();
    };

    // Emit initial swarm immediately with active coordinating state
    emitSwarmState();


    const emitExploreArtifact = (path: string, content?: string) => {
      const normalized = String(path || "").replace(/\\/g, "/").replace(/^\//, "");
      if (!normalized || exploredPaths.has(normalized)) return;
      exploredPaths.add(normalized);
      const folder = isFolderLikePath(normalized);
      const range = content && !folder ? lineRangeFromContent(content) : null;
      sendAgentEvent(res, {
        type: "coding_action",
        verb: "Analyzed",
        path: normalized,
        status: "done",
        label: `Analyzed ${normalized}`,
        ...(range ? { lineStart: range.lineStart, lineEnd: range.lineEnd } : {}),
      });
    };

    const exploreWorkspace = async () => {
      updateSwarmAgent("thread-scout-research", { status: "working", detail: "Scanning Workspace file system trees..." });
      updateSwarmAgent("rmcs", { status: "waiting", detail: "Awaiting exploration metrics..." });
      sendAgentEvent(res, { type: "thought_stream", phase: "thinking", status: "running" });

      const folderSet = new Set<string>();
      for (const filePath of Object.keys(currentFilesState)) {
        const parts = filePath.split("/").filter(Boolean);
        for (let i = 1; i < parts.length; i++) {
          folderSet.add(parts.slice(0, i).join("/"));
        }
        emitExploreArtifact(filePath, currentFilesState[filePath]);
        await new Promise(resolve => setTimeout(resolve, 155));
      }
      for (const dir of [...folderSet].sort((a, b) => a.localeCompare(b))) {
        emitExploreArtifact(dir);
        await new Promise(resolve => setTimeout(resolve, 85));
      }

      try {
        const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command:
              "find /workspace -maxdepth 5 \\( -type f -o -type d \\) 2>/dev/null | head -100",
            cwd: "/workspace",
          }),
          signal: AbortSignal.timeout(20_000),
        });
        if (shellRes.ok) {
          const data = await shellRes.json();
          const lines = String(data.output || "")
            .split("\n")
            .map((l) => toWorkspaceRelative(l.trim()))
            .filter(Boolean);
          for (const rel of lines) {
            if (isFolderLikePath(rel)) {
              emitExploreArtifact(rel);
              await new Promise(resolve => setTimeout(resolve, 85));
              continue;
            }
            try {
              const readRes = await fetch(
                `${computerUrl()}/fs/read?path=${encodeURIComponent(rel)}`,
                { signal: AbortSignal.timeout(10_000) },
              );
              if (readRes.ok) {
                const rd = await readRes.json();
                if (typeof rd.content === "string") {
                  emitExploreArtifact(rel, rd.content);
                  currentFilesState[normSandpackPath(`/${rel}`)] = rd.content;
                }
              }
            } catch {
              emitExploreArtifact(rel);
            }
            await new Promise(resolve => setTimeout(resolve, 155));
          }
        }
      } catch {
        /* sandbox optional when docker is not running */
      }

      updateSwarmAgent("thread-scout-research", { status: "completed", detail: "Scanned files and finalized workspace indexing." });
      sendAgentEvent(res, {
        type: "thought_stream",
        phase: "thoughts",
        summary: "Analyzed Workspace",
        details: "Exploration complete. Environment ready.",
        status: "done",
      });
    };

    const contextSnapshot = () => [
      `USER REQUEST:\n${prompt}`,
      `CONNECTED TOOLS:\n${connectedTools.join(", ") || "none"}`,
      Object.keys(currentFilesState).length
        ? `CURRENT FILES:\n${Object.entries(currentFilesState).map(([filePath, content]) => `--- ${filePath} ---\n${String(content).slice(0, 12000)}`).join("\n\n")}`
        : "CURRENT FILES: none",
      Object.keys(currentDepsState).length
        ? `CURRENT DEPENDENCIES:\n${JSON.stringify(currentDepsState, null, 2)}`
        : "CURRENT DEPENDENCIES: none",
      observations.length ? `OBSERVATIONS:\n${observations.slice(-10).join("\n")}` : "",
    ].filter(Boolean).join("\n\n");

    const runControlledTool = async (tool: string, args: any) => {
      if (tool.startsWith("mcp__")) {
        try {
          const mcpResult = await executeMcpTool(tool, args);
          return { ok: true, observation: `MCP tool ${tool} executed successfully. Result:\n${JSON.stringify(mcpResult, null, 2)}` };
        } catch (e: any) {
          return { ok: false, observation: `MCP tool ${tool} failed: ${e.message}` };
        }
      }

      switch (tool) {
        case "code.analyze":
        case "code.inspect": {
          const target = args?.path ? String(args.path) : "";
          if (target) {
            const normPath = normSandpackPath(target.startsWith("/") ? target : `/${target}`);
            const content = currentFilesState[normPath];
            if (content !== undefined) {
              const range = lineRangeFromContent(content);
              emitExploreArtifact(normPath, content);
              return {
                ok: true,
                observation: `--- ${normPath} (lines ${range.lineStart}-${range.lineEnd}) ---\n${String(content).slice(0, 12000)}`,
              };
            }
          }
          await exploreWorkspace();
          const fileList = Object.keys(currentFilesState);
          const summary = `Workspace has ${fileList.length} file(s) and ${Object.keys(currentDepsState).length} dependencies.\nFiles: ${fileList.join(", ") || "none"}`;
          return { ok: true, observation: summary };
        }
        case "code.update": {
          const files = sanitizeModelFiles(args?.files);
          const deps = Array.isArray(args?.dependencies) ? args.dependencies : [];
          const updated: string[] = [];
          for (const [filePath, content] of Object.entries(files)) {
            const normPath = normSandpackPath(filePath);
            const prev = currentFilesState[normPath];
            const isNew = prev === undefined;
            sendAgentEvent(res, {
              type: "coding_action",
              verb: isNew ? "Creating" : "Editing",
              path: normPath,
              additions: 0,
              deletions: 0,
              status: "running",
              label: `${isNew ? "Creating" : "Editing"} ${normPath}`,
            });
            currentFilesState[normPath] = content;
            changedFiles.add(normPath);
            updated.push(normPath);
            const { additions, deletions } = diffLineCounts(prev, content);
            const range = lineRangeFromContent(content);
            sendAgentEvent(res, {
              type: "coding_action",
              verb: isNew ? "Created" : "Edited",
              path: normPath,
              additions,
              deletions,
              lineStart: range.lineStart,
              lineEnd: range.lineEnd,
              status: "done",
              label: `${isNew ? "Created" : "Edited"} ${normPath}`,
              summary: isNew ? `Added ${normPath}.` : `Updated ${normPath}.`,
            });
            sendAgentEvent(res, {
              type: isNew ? "file_created" : "file_updated",
              label: `${isNew ? "Created" : "Updated"} ${normPath}`,
              status: "done",
              file: normPath,
              content: content,
              summary: isNew ? `Added ${normPath}.` : `Updated ${normPath}.`,
              diff: { added: additions, removed: deletions },
            });
          }
          for (const dep of deps) {
            if (typeof dep === "string" && dep.trim()) currentDepsState[dep.trim()] = "latest";
          }
          return {
            ok: true,
            observation: updated.length ? `Updated ${updated.length} file(s): ${updated.join(", ")}.` : "No file changes were requested by the model.",
          };
        }
        case "code.delete": {
          const filePaths = Array.isArray(args?.files) ? args.files : [];
          const deleted: string[] = [];
          for (const filePath of filePaths) {
            if (currentFilesState[filePath]) {
              delete currentFilesState[filePath];
              changedFiles.add(filePath);
              deleted.push(filePath);
            }
          }
          return {
            ok: true,
            observation: deleted.length ? `Deleted ${deleted.length} file(s): ${deleted.join(", ")}.` : "No files matched for deletion.",
          };
        }
        case "office.generate": {
          try {
            const { type, topic, prompt: toolPrompt } = args;
            
            sendAgentEvent(res, {
              type: "tool_called",
              toolName: "office.generate",
              status: "running",
              summary: `Generating ${type} document for ${topic}...`,
              label: "Building Document"
            });
            
            const { execFileSync } = await import("child_process");
            try {
              const outputBuff = execFileSync('npx', ['-y', 'officecli', 'new', type || 'docx', topic || 'Document', '--prompt', toolPrompt || 'Content', '--mode', 'fast', '--local-preview'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
              const output = outputBuff.toString();
              const savedMatch = output.match(/Saved to\s+([^\n]+)/);
              let observation = `Officecli executed successfully.\nOutput: ${output.slice(0, 1000)}`;
              if (savedMatch && savedMatch[1]) {
                const filePath = savedMatch[1].trim(); // output/file.docx
                const cleanFilePath = filePath.replace(/^output\//, '');
                
                sendAgentEvent(res, {
                  type: "file_created",
                  verb: "Created",
                  path: `/office-outputs/${cleanFilePath}`,
                  file: `/office-outputs/${cleanFilePath}`,
                  status: "done",
                  label: `Generated ${cleanFilePath}`,
                  summary: `Generated Document ${cleanFilePath} successfully.`
                });
                
                observation += `\nDocument generated and available to the user at /office-outputs/${cleanFilePath}\nYou should output a markdown link for the user to [View / Download Document](/office-outputs/${cleanFilePath})`;
              }
              return { ok: true, observation };
            } catch (err: any) {
              return { ok: false, observation: `officecli execution failed: ${err.message}\nStdout: ${err.stdout}\nStderr: ${err.stderr}` };
            }
          } catch (e: any) {
             return { ok: false, observation: `office.generate failed: ${e.message}` };
          }
        }
        case "sandbox.shell":
        case "sandbox.shellExec": {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: args.command, cwd: args.cwd || "/workspace" }),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            
            if (shellRes.ok) {
              const data = await shellRes.json().catch(() => ({}));
              const out = data.output ?? data.error ?? JSON.stringify(data);
              return { ok: data.ok !== false, observation: String(out).slice(0, 120000) };
            }
            
            return {
              ok: false,
              observation: `Sandbox command execution failed. Status: ${shellRes.status}. Host-level shell execution fallback has been deprecated. All command execution must be done via the Cloud/WebContainer terminal in your browser.`
            };
          } catch (e: any) {
            console.warn("[Shell] Sandbox unreachable:", e.message);
            return {
              ok: false,
              observation: `Failed to execute sandbox command: Sandbox environment is currently offline or unreachable. Automated host-level command execution is disabled by user configuration.`
            };
          }
        }
        case "sandbox.writeFile": {
          try {
            const rel = toWorkspaceRelative(args.path);
            const writeRes = await fetch(`${computerUrl()}/fs/write`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: rel || args.path, content: args.content }),
            }).catch(() => null);

            if (!writeRes || !writeRes.ok) {
              // Local fallback
              const localPath = path.resolve(process.cwd(), "workspace", rel || args.path);
              mkdirSync(path.dirname(localPath), { recursive: true });
              writeFileSync(localPath, args.content, 'utf8');
            }

            let normPath = args.path.startsWith("/") ? args.path : `/${args.path}`;
            if (normPath.startsWith("/workspace/")) {
              normPath = normPath.replace("/workspace", "");
            }
            normPath = normSandpackPath(normPath);
            const prev = currentFilesState[normPath];
            const isNew = prev === undefined;
            const { additions, deletions } = diffLineCounts(prev, args.content);
            sendAgentEvent(res, {
              type: "coding_action",
              verb: isNew ? "Creating" : "Editing",
              path: normPath,
              additions: 0,
              deletions: 0,
              status: "running",
              label: `${isNew ? "Creating" : "Editing"} ${normPath}`,
            });
            currentFilesState[normPath] = args.content;
            changedFiles.add(normPath);
            const range = lineRangeFromContent(String(args.content || ""));
            sendAgentEvent(res, {
              type: "coding_action",
              verb: isNew ? "Created" : "Edited",
              path: normPath,
              additions,
              deletions,
              lineStart: range.lineStart,
              lineEnd: range.lineEnd,
              status: "done",
              label: `${isNew ? "Created" : "Edited"} ${normPath}`,
              summary: isNew ? `Added ${normPath}.` : `Updated ${normPath}.`,
            });
            sendAgentEvent(res, {
              type: isNew ? "file_created" : "file_updated",
              label: `${isNew ? "Created" : "Updated"} ${normPath}`,
              status: "done",
              file: normPath,
              content: args.content,
              summary: isNew ? `Added ${normPath}.` : `Updated ${normPath}.`,
              diff: { added: additions, removed: deletions },
            });

            return { ok: true, observation: `Wrote ${args.path} successfully` };
          } catch (e: any) {
            return { ok: false, observation: `sandbox.writeFile failed: ${e.message}` };
          }
        }
        case "sandbox.readFile": {
          try {
            const rel = toWorkspaceRelative(args.path);
            const readRes = await fetch(`${computerUrl()}/fs/read?path=${encodeURIComponent(rel || args.path)}`, {
              signal: AbortSignal.timeout(15_000),
            }).catch((e: any) => ({
              ok: false,
              json: async () => ({ error: e.message }),
            }));

            if (!readRes || !readRes.ok) {
              let normPath = args.path.startsWith("/") ? args.path : `/${args.path}`;
              if (normPath.startsWith("/workspace/myapp/")) {
                normPath = normPath.replace("/workspace/myapp", "");
              } else if (normPath.startsWith("/workspace/")) {
                normPath = normPath.replace("/workspace", "");
              } else if (normPath.startsWith("/myapp/")) {
                normPath = normPath.replace("/myapp", "");
              }
              normPath = normSandpackPath(normPath);
              const content = currentFilesState[normPath];
              if (content !== undefined) {
                const range = lineRangeFromContent(content);
                emitExploreArtifact(rel || args.path, content);
                return {
                  ok: true,
                  observation: `--- ${rel || args.path} (lines ${range.lineStart}-${range.lineEnd}) ---\n${content.slice(0, 12000)}`,
                };
              }

              // Fall back to reading from local filesystem
              try {
                const localPath = path.resolve(process.cwd(), "workspace", rel || args.path);
                const localContent = await fs.readFile(localPath, 'utf8');
                const range = lineRangeFromContent(localContent);
                emitExploreArtifact(rel || args.path, localContent);
                return {
                  ok: true,
                  observation: `--- ${rel || args.path} (lines ${range.lineStart}-${range.lineEnd}) ---\n${localContent.slice(0, 12000)}`,
                };
              } catch {
                return { ok: false, observation: `File not found: ${args.path}` };
              }
            }

            const data = await (readRes as Response).json();
            if (data.error) return { ok: false, observation: String(data.error) };
            const displayPath = rel || String(args.path || "");
            emitExploreArtifact(displayPath, data.content);
            const range = lineRangeFromContent(String(data.content || ""));
            return {
              ok: true,
              observation: `--- ${displayPath} (lines ${range.lineStart}-${range.lineEnd}) ---\n${String(data.content).slice(0, 12000)}`,
            };
          } catch (e: any) {
            return { ok: false, observation: `sandbox.readFile failed: ${e.message}` };
          }
        }
        case "desktop.screenshot": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'screenshot' }),
              signal: AbortSignal.timeout(15_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop screenshot failed. Make sure the desktop container is running: docker compose up desktop' };
            const data = await desktopRes.json();
            return { ok: true, observation: `Screenshot taken successfully. The desktop is visible. Image dimensions available. Analyze the screenshot to determine what is on screen and where to click/type next.`, screenshot: data.image };
          } catch (e: any) {
            return { ok: false, observation: `Desktop container not reachable at ${desktopUrl()}. The desktop container is not running. Start it with: docker compose up desktop. Error: ${e.message}` };
          }
        }
        case "desktop.moveMouse": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'move_mouse', coordinates: args?.coordinates }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop mouse move failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Moved mouse to (${args?.coordinates?.x}, ${args?.coordinates?.y}).` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.click": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'click_mouse', coordinates: args?.coordinates, button: args?.button || 'left', clickCount: args?.clickCount || 1 }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop click failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Clicked at (${args?.coordinates?.x}, ${args?.coordinates?.y}) with ${args?.button || 'left'} button.` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.doubleClick": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'double_click', coordinates: args?.coordinates }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop double-click failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Double-clicked at (${args?.coordinates?.x}, ${args?.coordinates?.y}).` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.type": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: args?.keys ? 'type_keys' : 'type_text', text: args?.text, keys: args?.keys }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop type failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Typed: ${args?.text || args?.keys?.join('+')}` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.keyCombo": {
          try {
            const combo = Array.isArray(args?.keys) ? args.keys.join('+') : args?.keys || '';
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'key_combo', keys: args?.keys }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop key combo failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Pressed key combo: ${combo}` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.scroll": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'scroll', coordinates: args?.coordinates, direction: args?.direction || 'down', amount: args?.amount || 3 }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop scroll failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Scrolled ${args?.direction || 'down'} by ${args?.amount || 3}.` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.openApp": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'open_app', app: args?.app }),
              signal: AbortSignal.timeout(15_000),
            });
            if (!desktopRes.ok) {
              const errData = await desktopRes.json().catch(() => ({}));
              return { ok: false, observation: `Failed to open app '${args?.app}': ${errData.error || 'Unknown error'}. The app may not be installed in the desktop container, or the desktop container is not running. Try: docker compose up desktop` };
            }
            const data = await desktopRes.json();
            return { ok: true, observation: `Launched: ${data.launched || args?.app}. Wait 2-3 seconds for the app to fully open, then take a screenshot to verify.` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.drag": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'drag', from: args?.from, to: args?.to }),
              signal: AbortSignal.timeout(10_000),
            });
            if (!desktopRes.ok) return { ok: false, observation: 'Desktop drag failed. Make sure Docker desktop container is running: docker compose up desktop' };
            return { ok: true, observation: `Dragged from (${args?.from?.x},${args?.from?.y}) to (${args?.to?.x},${args?.to?.y}).` };
          } catch (e: any) {
            return { ok: false, observation: `Desktop not available: ${e.message}. The desktop container is not running. Run: docker compose up desktop` };
          }
        }
        case "desktop.shellExec": {
          try {
            const desktopRes = await fetch(`${desktopUrl()}/computer-use`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'shell_exec', command: args?.command }),
              signal: AbortSignal.timeout(30_000),
            });
            if (!desktopRes.ok) throw new Error('Desktop shell exec failed');
            const data = await desktopRes.json();
            return { ok: true, observation: `Desktop shell output: ${String(data.output || '').slice(0, 12000)}` };
          } catch (e: any) {
            // Local fallback inside sandbox workspace
            try {
              const localCwd = path.resolve(process.cwd(), "workspace");
              const output = execSync(args?.command || "", {
                cwd: localCwd,
                timeout: 60_000,
                encoding: "utf8",
                maxBuffer: 1024 * 1024 * 10,
                shell: process.platform === "win32" ? "powershell.exe" : "/bin/sh",
              });
              return { ok: true, observation: `[Local Workspace Fallback Output]:\n${output || '(no output)'}` };
            } catch (localErr: any) {
              const out = [localErr.stdout, localErr.stderr].filter(Boolean).join("\n") || localErr.message;
              return { ok: false, observation: `Desktop shell failed, and local fallback failed as well:\n${out}` };
            }
          }
        }
        case "web.browse": {
          try {
            const u = String(args?.url || "").replace(/'/g, "'\\''");
            const browseRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                command: `curl -sL -m 15 '${u}' | head -c 12000`,
                cwd: "/workspace",
              }),
            }).catch(() => null);
            if (!browseRes || !browseRes.ok) {
              const fallback = await fetch(args?.url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "BudAgent/2.0" } }).catch(() => null);
              if (!fallback) return { ok: false, observation: "Could not fetch URL." };
              const text = await fallback.text();
              return { ok: true, observation: text.slice(0, 12000) };
            }
            const data = await browseRes.json();
            const out = data.output ?? data.error ?? "";
            return { ok: data.ok !== false, observation: String(out).slice(0, 12000) };
          } catch (e: any) {
            return { ok: false, observation: `Web browse failed: ${e.message}` };
          }
        }
        case "browser.run": {
          if (!body.isBrowserEnabled) {
            return { ok: false, observation: "Browser automation is not enabled. The user must toggle 'My Browser' on the client side." };
          }
          try {
            const script = args?.script || "";
            // We write the script to a temporary file locally and execute it via node, requiring playwright
            const tempFile = path.resolve(process.cwd(), `temp_playwright_${Date.now()}.js`);
            const code = `
              const { chromium } = require('playwright');
              (async () => {
                const browser = await chromium.launch({ headless: true });
                const page = await browser.newPage();
                try {
                  ${script}
                } catch (err) {
                  console.error(err);
                } finally {
                  await browser.close();
                }
              })();
            `;
            writeFileSync(tempFile, code, 'utf8');
            const { execSync } = require('child_process');
            const output = execSync(`node ${tempFile}`).toString();
            require('fs').unlinkSync(tempFile);
            
            return { ok: true, observation: output.slice(0, 12000) };
          } catch (e: any) {
            return { ok: false, observation: `browser.run failed: ${e.message}` };
          }
        }
        case "web.search": {
          try {
            const query = encodeURIComponent(args?.query || '');
            const searchRes = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
              headers: { 'User-Agent': 'BudAgent/2.0' },
              signal: AbortSignal.timeout(10000),
            });
            const text = await searchRes.text();
            const results = text.match(/class="result__a"[^>]*>([^<]+)/g)?.slice(0, 8).map(r => r.replace(/class="result__a"[^>]*>/, '')) || [];
            return { ok: true, observation: results.length > 0 ? `Search results for "${args?.query}":\n${results.join('\n')}` : 'No results found.' };
          } catch (e: any) {
            return { ok: false, observation: `Web search failed: ${e.message}` };
          }
        }
        case "file.edit": {
          // OpenCode-style exact string replacement edit
          const filePath = args?.path;
          const oldStr = args?.old_string || args?.oldString || args?.search;
          const newStr = args?.new_string || args?.newString || args?.replace;
          if (!filePath || oldStr === undefined || newStr === undefined) {
            return { ok: false, observation: "file.edit requires path, old_string, and new_string." };
          }
          try {
            const rel = toWorkspaceRelative(filePath);
            const readRes = await fetch(`${computerUrl()}/fs/read?path=${encodeURIComponent(rel || filePath)}`, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
            let content = "";
            if (readRes?.ok) {
              const data = await (readRes as Response).json();
              content = data.content || "";
            } else {
              const normPath = normSandpackPath(filePath.startsWith("/") ? filePath : `/${filePath}`);
              content = currentFilesState[normPath] || "";
            }
            if (!content.includes(oldStr)) {
              return { ok: false, observation: `Could not find the exact string to replace in ${filePath}. Make sure old_string matches exactly.` };
            }
            const updated = content.replace(oldStr, newStr);
            // Write back
            const writeRes = await fetch(`${computerUrl()}/fs/write`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: rel || filePath, content: updated }),
            }).catch(() => ({ ok: false }));
            const normPath = normSandpackPath(filePath.startsWith("/") ? filePath : `/${filePath}`);
            const prev = currentFilesState[normPath];
            currentFilesState[normPath] = updated;
            changedFiles.add(normPath);
            const { additions, deletions } = diffLineCounts(prev, updated);
            sendAgentEvent(res, { type: "file_updated", label: `Edited ${normPath}`, status: "done", file: normPath, content: updated, diff: { added: additions, removed: deletions } });
            return { ok: true, observation: `Edited ${filePath}: replaced ${oldStr.length} chars with ${newStr.length} chars.` };
          } catch (e: any) {
            return { ok: false, observation: `file.edit failed: ${e.message}` };
          }
        }
        case "file.grep": {
          // OpenCode-style regex content search
          try {
            const pattern = args?.pattern || args?.query || "";
            const searchPath = args?.path || "/workspace";
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: `grep -rn --include='*.{ts,tsx,js,jsx,json,css,html,md,py,prisma,sql,yaml,yml,env,sh}' '${pattern.replace(/'/g, "'\\''")}' ${searchPath} 2>/dev/null | head -50`, cwd: "/workspace" }),
              signal: AbortSignal.timeout(30_000),
            }).catch(() => null);
            if (!shellRes || !shellRes.ok) {
              // Fallback: search in-memory files
              const matches: string[] = [];
              const regex = new RegExp(pattern, "gi");
              for (const [fp, content] of Object.entries(currentFilesState)) {
                const lines = content.split("\n");
                lines.forEach((line, idx) => { if (regex.test(line)) matches.push(`${fp}:${idx + 1}: ${line.trim()}`); });
              }
              return { ok: true, observation: matches.length > 0 ? matches.slice(0, 30).join("\n") : `No matches for "${pattern}".` };
            }
            const data = await shellRes.json();
            return { ok: data.ok !== false, observation: String(data.output || data.error || "No matches found.").slice(0, 12000) };
          } catch (e: any) {
            return { ok: false, observation: `file.grep failed: ${e.message}. Make sure Docker is running: docker compose up computer` };
          }
        }
        case "file.glob": {
          // OpenCode-style file pattern matching
          try {
            const pattern = args?.pattern || "**/*";
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: `find /workspace -name '${pattern.replace(/'/g, "'\\''")}' -type f 2>/dev/null | head -100`, cwd: "/workspace" }),
              signal: AbortSignal.timeout(15_000),
            }).catch(() => null);
            if (!shellRes || !shellRes.ok) {
              const files = Object.keys(currentFilesState).filter(fp => fp.includes(pattern.replace("*", "")));
              return { ok: true, observation: files.length > 0 ? files.join("\n") : "No matching files." };
            }
            const data = await shellRes.json();
            return { ok: data.ok !== false, observation: String(data.output || "No matching files.").slice(0, 8000) };
          } catch (e: any) {
            return { ok: false, observation: `file.glob failed: ${e.message}. Make sure Docker is running: docker compose up computer` };
          }
        }
        case "file.list": {
          // List directory contents with tree view
          try {
            const targetPath = args?.path || "/workspace";
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: `find ${targetPath} -maxdepth ${args?.depth || 3} \\( -type f -o -type d \\) 2>/dev/null | head -200`, cwd: "/workspace" }),
              signal: AbortSignal.timeout(15_000),
            }).catch(() => null);
            if (!shellRes || !shellRes.ok) {
              const files = Object.keys(currentFilesState);
              return { ok: true, observation: `Files in workspace:\n${files.join("\n")}` };
            }
            const data = await shellRes.json();
            return { ok: data.ok !== false, observation: String(data.output || "Empty directory.").slice(0, 12000) };
          } catch (e: any) {
            return { ok: false, observation: `file.list failed: ${e.message}. Make sure Docker is running: docker compose up computer` };
          }
        }
        case "repo.clone": {
          // Clone a git repository into the workspace
          try {
            const url = args?.url || "";
            const dir = args?.directory || "";
            const cmd = dir ? `cd /workspace && git clone '${url}' '${dir}' 2>&1 | tail -20` : `cd /workspace && git clone '${url}' 2>&1 | tail -20`;
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: cmd, cwd: "/workspace" }),
              signal: AbortSignal.timeout(120_000),
            });
            if (!shellRes.ok) return { ok: false, observation: "Git clone failed — computer sandbox not available. Start with: docker compose up computer" };
            const data = await shellRes.json();
            return { ok: data.ok !== false, observation: String(data.output || data.error || "Clone complete.").slice(0, 8000) };
          } catch (e: any) {
            return { ok: false, observation: `repo.clone failed: ${e.message}. Make sure Docker is running: docker compose up computer` };
          }
        }
        case "repo.overview": {
          // Get a high-level overview of a repository
          try {
            const targetPath = args?.path || "/workspace";
            const cmd = `echo "=== Directory Structure ===" && find ${targetPath} -maxdepth 3 -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' 2>/dev/null | head -100 && echo "\\n=== Package Info ===" && cat ${targetPath}/package.json 2>/dev/null | head -40 || echo "(no package.json)" && echo "\\n=== README ===" && head -30 ${targetPath}/README.md 2>/dev/null || echo "(no README)"`;
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: cmd, cwd: "/workspace" }),
              signal: AbortSignal.timeout(20_000),
            }).catch(() => null);
            if (!shellRes || !shellRes.ok) {
              return { ok: true, observation: `Workspace has ${Object.keys(currentFilesState).length} files. In-memory file list:\n${Object.keys(currentFilesState).join("\n")}` };
            }
            const data = await shellRes.json();
            return { ok: data.ok !== false, observation: String(data.output || "").slice(0, 12000) };
          } catch (e: any) {
            return { ok: false, observation: `repo.overview failed: ${e.message}. Make sure Docker is running: docker compose up computer` };
          }
        }
        case "package.install": {
          // Install npm/pip/apt packages
          try {
            const manager = args?.manager || "npm";
            const packages = args?.packages || "";
            let cmd = "";
            if (manager === "npm") cmd = `cd /workspace && npm install ${packages} 2>&1 | tail -30`;
            else if (manager === "pip") cmd = `pip3 install ${packages} 2>&1 | tail -30`;
            else if (manager === "apt") cmd = `sudo apt-get install -y ${packages} 2>&1 | tail -30`;
            else return { ok: false, observation: `Unknown package manager: ${manager}. Use npm, pip, or apt.` };
            
            const shellRes = await fetch(`${computerUrl()}/sandbox/shell`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ command: cmd, cwd: "/workspace" }),
              signal: AbortSignal.timeout(120_000),
            }).catch(() => null); // Catch fetch error!
            
            if (shellRes && shellRes.ok) {
              const data = await shellRes.json();
              return { ok: data.ok !== false, observation: String(data.output || data.error || "Install complete.").slice(0, 8000) };
            }
            
            // Graceful Fallback if Docker is offline
            console.warn("[Package Install Fallback] Sandbox not available, running local/in-memory setup.");
            if (manager === "npm") {
              // 1. Update in-memory Sandpack files so the browser's WebContainer gets it
              const packageJsonPath = normSandpackPath("/package.json");
              let packageJson: any = {};
              try {
                packageJson = JSON.parse(currentFilesState[packageJsonPath] || "{}");
              } catch {
                packageJson = {};
              }
              if (!packageJson.dependencies) packageJson.dependencies = {};
              const pkgs = packages.split(/\s+/).filter(Boolean);
              pkgs.forEach((p: string) => {
                const parts = p.split("@");
                const name = parts[0];
                const version = parts[1] || "latest";
                packageJson.dependencies[name] = version;
              });
              const updatedContent = JSON.stringify(packageJson, null, 2);
              currentFilesState[packageJsonPath] = updatedContent;
              changedFiles.add(packageJsonPath);

              // 2. Update local file system package.json on host
              try {
                const localPath = path.resolve(process.cwd(), "workspace", "package.json");
                let localPkgJson: any = {};
                try {
                  localPkgJson = JSON.parse(await fs.readFile(localPath, 'utf8'));
                } catch {
                  localPkgJson = {};
                }
                if (!localPkgJson.dependencies) localPkgJson.dependencies = {};
                pkgs.forEach((p: string) => {
                  const parts = p.split("@");
                  const name = parts[0];
                  const version = parts[1] || "latest";
                  localPkgJson.dependencies[name] = version;
                });
                await fs.writeFile(localPath, JSON.stringify(localPkgJson, null, 2), 'utf8');
              } catch (fsErr: any) {
                console.warn("[Package Install Fallback] Failed to write local package.json:", fsErr.message);
              }

              // 3. Perform a local npm install in the host workspace using execSync
              try {
                execSync(`npm install ${packages} --no-audit --no-fund`, {
                  cwd: path.resolve(process.cwd(), "workspace"),
                  timeout: 60000,
                  encoding: 'utf8',
                });
              } catch (localNpmErr: any) {
                console.warn("[Package Install Fallback] Local npm install failed, but package.json has been updated:", localNpmErr.message);
              }

              return {
                ok: true,
                observation: `[Local Fallback Mode] Successfully added packages to package.json: ${packages}. Browser WebContainer and host dependencies are updated.`
              };
            }
            
            // For pip packages on the host machine
            if (manager === "pip") {
              try {
                const output = execSync(`pip3 install ${packages}`, {
                  cwd: path.resolve(process.cwd(), "workspace"),
                  timeout: 60000,
                  encoding: 'utf8',
                });
                return { ok: true, observation: `[Local Fallback] Installed pip packages:\n${output}` };
              } catch (pipErr: any) {
                return { ok: false, observation: `Failed to install pip packages locally: ${pipErr.message}` };
              }
            }

            return { ok: false, observation: `Package install failed — computer sandbox not available. Make sure Docker is running: docker compose up computer` };
          } catch (e: any) {
            return { ok: false, observation: `package.install failed: ${e.message}. Make sure Docker is running: docker compose up computer` };
          }
        }
        default:
          return { ok: false, observation: `Unknown controlled tool: ${tool}` };
      }
    };

    try {
      updateSwarmAgent("rmcs", { status: "thinking", detail: "Analyzing task intent and classifying project complexity and environment..." });
      const classification = await callJsonModel(
        body,
        "Classify the user's request and analyze goals. Return strict JSON: { \"taskType\": \"desktop_automation\" | \"browser_automation\" | \"office_generation\" | \"web_development\", \"projectType\": \"vite\" | \"nextjs\", \"goal\": \"string\", \"keyRequirements\": [\"string\"], \"outcomes\": [\"string\"], \"reason\": \"string\", \"complexity\": \"simple\" | \"complex\" }",
        `Request: "${prompt}"\n\nRules:
- taskType:
  * Use "desktop_automation" if the user wants to perform manual/coordinate tasks on the virtual Linux desktop, interact with OS apps (like Calc, Writer), screenshot, clicks, double-clicks, keys, local terminal commands, or general desktop app troubleshooting.
  * Use "browser_automation" if the user wants to crawl, crawl-scrape, search, interact with webpages on live external websites, log in, or run automated Playwright/Chromium browser scripts. No web development or HTML code workspace changes are needed.
  * Use "office_generation" if the user wants to generate Word (.docx) or Excel (.xlsx) documents.
  * Use "web_development" if the user wants to build, edit, or modify a web application (React, Next.js, HTML/JS/CSS, etc.) in the local workspace.
- projectType (only applicable for "web_development", otherwise default to "vite"):
  * Use "nextjs" if the request asks for Next.js or needs backend functionality, API routes, databases, etc.
  * Use "vite" for static frontend-only React apps.
- goal: A concise description of the user's main objective.
- keyRequirements: List the core technical/functional requirements extracted from the prompt.
- outcomes: List the expected concrete results/deliverables of the task.
- complexity:
  * Use "complex" if the application involves multiple architectural layers, complex states, multiple page configurations, router flows, or rich features.
  * Use "simple" if it is a single-screen component, simple style tweak, basic micro-utility, or a straightforward task.`
      ).catch(() => ({ 
        taskType: "web_development" as const, 
        projectType: "vite" as const, 
        goal: String(prompt).slice(0, 100),
        keyRequirements: ["Decompose user prompt", "Execute required changes"],
        outcomes: ["Complete requested tasks"],
        reason: "Fallback to Vite development",
        complexity: "complex" as const
      }));

      sendAgentEvent(res, {
        type: "project_type",
        projectType: classification.projectType,
        status: "done",
      });

      sendAgentEvent(res, {
        type: "thought_stream",
        phase: "thoughts",
        summary: `Request Analysis & Intent Classification`,
        details: `Goal: ${classification.goal}\n\nKey Requirements:\n${(classification.keyRequirements || []).map((r: string) => `- ${r}`).join('\n')}\n\nExpected Outcomes:\n${(classification.outcomes || []).map((o: string) => `- ${o}`).join('\n')}\n\nTask Category: ${classification.taskType} (${classification.reason || ''})\nComplexity: ${classification.complexity || 'complex'}`,
        status: "done",
      });

      updateSwarmAgent("thread-planner-blueprint", { status: "working", detail: `Decomposing user goals into an architectural roadmap for ${classification.projectType}...` });
      updateSwarmAgent("rmcs", { status: "waiting", detail: "Observing architectural planner outcomes..." });

      const planMode = body.planMode === true;
      const documentMode = body.documentMode === true;
      const excelMode = body.excelMode === true;
      const isComplex = classification.complexity === "complex";

      let stepTitles: string[] = [];
      let planSummary = "";
      
      const isApproval = prompt.toLowerCase().includes("approve") || 
                         prompt.toLowerCase().includes("proceed") || 
                         prompt.toLowerCase().includes("i approve");
      const bypassPlanning = prompt.toLowerCase().includes("just build") || 
                             prompt.toLowerCase().includes("bypass plan") || 
                             prompt.toLowerCase().includes("immediately");

      if (planMode) {
        // FIRST TURN IN PLAN MODE: ONLY MAKE PLAN (Create DOCX and return detailed markdown)
        sendAgentEvent(res, {
          type: "thought_stream",
          phase: "thinking",
          summary: "Drafting Detailed Technical Implementation Plan (Plan Mode)...",
          status: "running"
        });
        
        const planPrompt = `Develop a detailed technical implementation blueprint for the following task: "${prompt}".
Your response MUST be organized into these sections:
1. App Name: Choose a distinctive and humble literal name (no marketing prefixes)
2. Core Purpose: A clear 1-sentence description
3. PAGES & ROUTES: List all routes and files as bullet points
4. DATA MODELS: Clear database tables/schemas and model fields
5. AUTH STRATEGY: Select-case session/JWT details
6. COMPONENT ARCHITECTURE: Component layout list
7. EXTERNAL INTEGRATIONS: APIs or libraries needed
8. BUILD ORDER: Clear, numbered step-by-step roadmap

Format with highly professional headings and bullet points.`;

        const outlineText = await callJsonModel(
          body,
          "Create a professional, highly detailed Word document outline for a technical implementation blueprint. Return standard text content suitable for a Word document.",
          planPrompt
        ).then(r => r.outline || r.text || (typeof r === 'string' ? String(r) : JSON.stringify(r)))
         .catch(() => `Technical Implementation Blueprint for the requested changes: ${prompt}`);

        sendAgentEvent(res, {
          type: "tool_called",
          toolName: "office.generate",
          status: "running",
          summary: `Compiling Technical Implementation Plan docx...`,
          label: "Generating Blueprint"
        });

        const { execFileSync } = await import("child_process");
        try {
          const outputBuff = execFileSync('npx', [
            '-y', 'officecli', 'new', 'docx', 'Implementation Plan', 
            '--prompt', outlineText, 
            '--mode', 'fast', 
            '--local-preview'
          ], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
          
          const output = outputBuff.toString();
          const savedMatch = output.match(/Saved to\s+([^\n]+)/);
          if (savedMatch && savedMatch[1]) {
            const filePath = savedMatch[1].trim();
            const cleanFilePath = filePath.replace(/^output\//, '');
            const sourcePath = path.join(process.cwd(), "output", cleanFilePath);
            const targetPath = path.join(process.cwd(), "output", "Implementation_Plan.docx");
            const targetJsonPath = path.join(process.cwd(), "output", "Implementation_Plan.preview.json");
            const sourceJsonPath = sourcePath.replace(/\.docx$/i, '.preview.json');
            
            try {
              if (existsSync(targetPath)) {
                await fs.unlink(targetPath).catch(() => {});
              }
              await fs.rename(sourcePath, targetPath);
              if (existsSync(sourceJsonPath)) {
                if (existsSync(targetJsonPath)) {
                  await fs.unlink(targetJsonPath).catch(() => {});
                }
                await fs.rename(sourceJsonPath, targetJsonPath);
              }
            } catch (e) {
              console.warn("Failed to rename artifact, fallback to original paths", e);
            }
          }
          
          sendAgentEvent(res, {
            type: "file_created",
            verb: "Created",
            path: `/office-outputs/Implementation_Plan.docx`,
            file: `/office-outputs/Implementation_Plan.docx`,
            status: "done",
            label: `Generated Implementation_Plan.docx`,
            summary: `Generated Technical Implementation Plan successfully.`
          });
          
          sendAgentEvent(res, {
            type: "thought_stream",
            phase: "thoughts",
            summary: "Technical Implementation Plan Compiled",
            details: `Plan drafted and saved as a docx. Plan Mode was enabled, so no codebase changes were performed.`,
            status: "done"
          });
          
          sendAgentEvent(res, {
            type: "reporting",
            summary: "Technical Implementation plan is ready for review.",
            status: "done",
            text_response: `I have analyzed the workspace files and generated a comprehensive **Implementation Plan** in Plan Mode.

Please navigate to the **Document tab** to review the proposed architecture in the generated Word document, or read the outline below.

### Proposed Architecture Roadmap:
${outlineText}

**Next Steps**: If you're happy with this plan, simply turn off **Plan Mode** using the toggle in the input bar and click send/refresh to initiate the full build immediately!`
          });
          
          res.write(`data: ${JSON.stringify({ id: `final-${Date.now()}`, type: "complete", result: { done: true }, done: true })}\n\n`);
          res.end();
          return;
          
        } catch (err: any) {
          console.error("officecli failed during planning generation:", err);
          sendAgentEvent(res, {
            type: "reporting",
            summary: "Completed planning overview.",
            status: "done",
            text_response: `Here is the requested implementation plan:\n\n${outlineText}`
          });
          res.write(`data: ${JSON.stringify({ id: `final-${Date.now()}`, type: "complete", result: { done: true }, done: true })}\n\n`);
          res.end();
          return;
        }
      } else {
        // BUILD MODE ACTIVE: DIRECT CORE SYNTHESIS & DEVELOPMENT
        if (isApproval) {
          const plan = await callJsonModel(
            body,
            "Analyze the previous conversation history and proposed plan. Reconstruct the roadmap steps as JSON: { \"summary\": \"string\", \"steps\": [\"string\"] }",
            `Conversation History: ${JSON.stringify(history)}\n\nExtract and return the approved plan steps.`
          ).catch(() => ({ 
            summary: "Executing approved development plan", 
            steps: [
              classification.taskType === "desktop_automation" ? "Initialize desktop environment" :
              classification.taskType === "browser_automation" ? "Initialize browser and launch Playwright" :
              classification.taskType === "office_generation" ? "Initialize document guidelines" : `Initialize ${classification.projectType} environment`,
              "Apply approved features",
              "Verify implementation",
              "Complete task"
            ] 
          }));
          stepTitles = Array.isArray(plan.steps) && plan.steps.length 
            ? plan.steps.map((s: any) => String(s)) 
            : [
                classification.taskType === "desktop_automation" ? "Initialize desktop environment" :
                classification.taskType === "browser_automation" ? "Initialize browser and launch Playwright" :
                classification.taskType === "office_generation" ? "Initialize document guidelines" : `Initialize ${classification.projectType} environment`,
                "Apply approved features",
                "Verify implementation",
                "Complete task"
              ];
          planSummary = plan.summary || "Implementing approved system plan";
        } else {
          // DIRECT SYNTHESIS & EXECUTION (No blocking user approval required)
          const plan = await callJsonModel(
            body,
            "Create a clear, sequential file-by-file build roadmap based on the request. Return strict JSON: { \"summary\": \"string\", \"steps\": [\"string\"] }",
            `Prompt: "${prompt}"\nTask summary: ${classification.goal}\nIs Complex: ${isComplex}`
          ).catch(() => ({
            summary: "Executing direct software construction",
            steps: [
              classification.taskType === "desktop_automation" ? "Initialize desktop controls" :
              classification.taskType === "browser_automation" ? "Initialize local browser engine" :
              classification.taskType === "office_generation" ? "Initialize formatting" : `Map and indexes ${classification.projectType} design target`,
              "Construct custom logic and stylesheets",
              "Verify system compilation cleanly"
            ]
          }));
          stepTitles = Array.isArray(plan.steps) && plan.steps.length 
            ? plan.steps.map((s: any) => String(s)) 
            : [
                "Setup codebase context",
                "Synthesize and implement files",
                "Verify and repair system compile",
                "Complete"
              ];
          planSummary = plan.summary || "Executing autonomous developer build";
        }
      }

      const roadmapTodos = stepTitles.map((title: string, idx: number) => ({
        id: `todo-${idx}`,
        title,
      }));
      sendAgentEvent(res, {
        type: "run_title",
        summary: planSummary || "Task execution starting",
        label: "Run overview",
        status: "done",
      });
      sendAgentEvent(res, {
        type: "todo_roadmap",
        todos: roadmapTodos,
        status: "done",
      });

      updateSwarmAgent("thread-planner-blueprint", { status: "completed", detail: `Compiled custom ${roadmapTodos.length}-step architecture roadmap.` });

      if (classification.taskType === "web_development") {
        await exploreWorkspace();
      } else {
        console.log(`[Explore Bypass] Bypassing exploreWorkspace() for taskType: ${classification.taskType}`);
      }

      // Load project-specific instructions (AGENTS.md, CLAUDE.md, etc.)
      let projectSkillsPrompt = "";
      try {
        const skills = await loadProjectInstructions(computerUrl());
        projectSkillsPrompt = formatSkillsForPrompt(skills);
        if (skills.length > 0) {
          sendAgentEvent(res, {
            type: "thought_stream",
            phase: "thoughts",
            summary: `Loaded ${skills.length} project instruction file(s): ${skills.map(s => s.name).join(", ")}`,
            status: "done",
          });
        }
      } catch {
        /* Skills loading is optional */
      }

      for (let iteration = 1; iteration <= maxIterations; iteration++) {
        const focusTodo =
          roadmapTodos.length > 0
            ? roadmapTodos[Math.min(iteration - 1, roadmapTodos.length - 1)]
            : null;
        if (focusTodo) {
          sendAgentEvent(res, {
            type: "todo_focus",
            todoId: focusTodo.id,
            status: "running",
            label: focusTodo.title,
          });
        }
        
        updateSwarmAgent("rmcs", { status: "thinking", detail: `Coordinating swarm lane action for roadmap goal: "${focusTodo ? focusTodo.title : 'Executing task'}" (Step ${iteration}/${maxIterations})` });

        sendAgentEvent(res, {
          type: "thought_stream",
          phase: "thinking",
          status: "running",
          startedAt: Date.now(),
        });

        // Apply context compaction if observations are getting too large
        const contextText = contextSnapshot();
        let effectiveContext = contextText;
        if (needsCompaction(contextText)) {
          const { compacted, originalCount, keptCount } = compactConversationHistory(observations);
          observations.length = 0;
          observations.push(compacted);
          effectiveContext = contextSnapshot();
          console.log(`[Compaction] Compacted ${originalCount} observations → kept ${keptCount}`);
        }

        let safetyReflectorPrompt = "";
        if (consecutiveFailures >= 2) {
          safetyReflectorPrompt = `\n\n⚠️ META-COGNITIVE INTERVENTION:\nWarning: Your last ${consecutiveFailures} operations encountered consecutive errors or failed to modify target content cleanly. Do NOT repeat the previous failing pattern. Determine exactly where your environment, tools, or syntax assumption mismatch occurred, and devise an alternative plan. Choose a different file edit or diagnostic tool first if needed.`;
        }
        
        let browserPrompt = "";
        if (body.isBrowserEnabled) {
          browserPrompt = `\n\n[USER TOGGLED MY BROWSER ON]\nYou have full access to control the browser using the "browser.run" tool which evaluates Playwright NodeJS code. You can use this for any browser automation or scraping requested.`;
        }

        let taskTypePromptSuffix = "";
        const analysisDirectives = `\n
### CRITICAL DIRECTIVES FOR FILE CREATION AND MODIFICATION:
1. **Analyze Existing Code Before Creating or Editing Files**: You are STRICTLY REQUIRED to read and inspect existing files in the workspace (using "sandbox.readFile", "file.grep", etc.) before edit or creation. Understand the existing imports, file structure, and design context fully. NEVER create or edit files blindly.
2. **Double-Analyze and Verify After Creation or Editing**: Immediately after creating or updating any file, inspect it, verify imports, and run tools to ensure there are no syntax errors, missing imports, or compilation issues. Double check your changes to keep the application 100% building and functional.`;

        if (classification.taskType === "desktop_automation") {
          taskTypePromptSuffix = `\n\n[TASK CATEGORY: DESKTOP AUTOMATION]
You must operate in Desktop Automation mode:
- DO NOT perform file operations (like creating/updating code files, code.update, or sandbox.writeFile) on the workspace repository.
- Use only desktop/browser control tools: "desktop.screenshot", "desktop.moveMouse", "desktop.click", "desktop.type", "desktop.keyCombo", "desktop.openApp", "desktop.shellExec", and "browser.run".
- Stick strictly to resolving the user's request on the desktop/browser.`;
        } else if (classification.taskType === "browser_automation") {
          taskTypePromptSuffix = `\n\n[TASK CATEGORY: BROWSER AUTOMATION]
You must operate in Browser/Chrome Automation mode:
- DO NOT write, edit, or create React / Next.js / HTML web development code files inside the workspace. Do not construct a local website to demo things.
- Your goal is to automate Chrome and scrape or interact with real external internet webpages.
- Use ONLY browser/crawling tools: "browser.run" to execute Playwright scripts, "web.search" to find information, or "web.browse" to fetch markup.
- Execute browser scripts via "browser.run" to interact, login, or scrape data. Verify the scraped results, return them directly to the user, and finish.`;
        } else if (classification.taskType === "office_generation") {
          taskTypePromptSuffix = `\n\n[TASK CATEGORY: OFFICE GENERATION]
You must call the "office.generate" tool immediately to create the requested document, return the download link to the user, and finish. Do not perform any other file operations or workspace changes.`;
        } else {
          taskTypePromptSuffix = `\n\n[TASK CATEGORY: WEB DEVELOPMENT]
You are building or editing a web application in the workspace. Read the workspace files first to understand the context, then create or modify components using code tools.${analysisDirectives}`;
        }

        let modeSpecificPrompt = "";
        if (documentMode) {
          modeSpecificPrompt = `\n\n[DOCUMENT MODE ACTIVE]
You are in Document Mode. The user wants you to focus specifically on generating professional, multi-page Word documents. Follow these guidelines:
- Use the "office.generate" tool to create Word (.docx) documents when the user requests document creation.
- Generate documents with corporate-quality formatting: proper headings (H1, H2, H3), tables of contents, page breaks, styled tables, bullet lists, and professional typography.
- Structure content across multiple pages with clear section breaks and logical flow.
- Include proper headers/footers, page numbering, and professional margins.
- Prioritize content quality, clarity, and professional presentation.
- After generating, switch the user's view to the Document tab automatically.`;
        }
        if (excelMode) {
          modeSpecificPrompt += `\n\n[EXCEL MODE ACTIVE]
You are in Excel Mode. The user wants you to focus specifically on generating comprehensive Excel spreadsheets. Follow these guidelines:
- Use the "office.generate" tool to create Excel (.xlsx) files when the user requests spreadsheet creation.
- Generate spreadsheets with proper formulas (SUM, AVERAGE, VLOOKUP, IF, etc.), conditional formatting, data validation, and styled cells.
- Create multiple sheets/tabs when data benefits from separation (e.g., Data, Summary, Charts, Analysis).
- Use proper column headers, data types, number formatting, borders, and color-coded cells.
- Include summary rows, totals, and analytical formulas.
- After generating, switch the user's view to the Excel tab automatically.`;
        }

        const decision = await callJsonModel(
          body,
          OPENCODE_SYSTEM_PROMPT + projectSkillsPrompt + browserPrompt + mcpToolsPrompt + taskTypePromptSuffix + modeSpecificPrompt + getProviderPromptSuffix(body.provider || "gemini", body.model || ""),
          `${effectiveContext}${safetyReflectorPrompt}\n\nIteration ${iteration}/${maxIterations}. What is your next move?`
        ).catch((error) => {
          const errMsg = error?.message || "Model request failed";
          sendAgentEvent(res, {
            type: "error",
            label: errMsg,
            status: "error",
            summary: "Model request failed",
            observation: "Check API key in Settings, network connection, and model name.",
          });
          throw error;
        });

        sendAgentEvent(res, {
          type: "thought_stream",
          phase: "thoughts",
          summary: decision.summary || "",
          details: decision.text_response || "",
          status: "done",
        });

        // Parse and highlight active swarm sub-agent lanes
        const toolsToRun = Array.isArray(decision.tools) ? decision.tools : [];
        if (decision.tool) {
          toolsToRun.push({ tool: decision.tool, args: decision.args || {} });
        }

        const tNames = toolsToRun.map((t: any) => String(t.tool || "finish").toLowerCase());
        const hasTools = toolsToRun.length > 0;
        const firstTool = hasTools ? tNames[0] : "finish";

        let swarmFocusId = "";
        let swarmDetail = "";
        
        if (firstTool === "finish" || decision.done) {
          swarmFocusId = "rmcs";
          swarmDetail = "Collating deliverables & certifying build targets...";
        } else if (tNames.some((t: string) => t.includes("desktop") || t.includes("mouse") || t.includes("keyboard") || t.includes("click") || t.includes("type") || t.includes("screenshot"))) {
          swarmFocusId = "rmcs";
          swarmDetail = `Executing virtual OS desktop automation actions: ${tNames.join(", ")}`;
        } else if (tNames.some((t: string) => t.includes("gmail") || t.includes("calendar") || t.includes("sheets") || t.includes("meet") || t.includes("maps") || t.includes("photos") || t.includes("drive") || t.includes("excel") || t.includes("notion") || t.includes("telegram") || t.includes("discord") || t.includes("github"))) {
          swarmFocusId = "rmcs";
          swarmDetail = `Synchronizing external cloud integration API tools: ${tNames.join(", ")}`;
        } else if (tNames.some((t: string) => t.includes("create") || t.includes("update") || t.includes("patch") || t.includes("delete") || t.includes("write") || t.includes("edit"))) {
          swarmFocusId = "thread-builder-forge";
          swarmDetail = `Writing or patching files parallelly...`;
        } else if (tNames.some((t: string) => t.includes("view") || t.includes("grep") || t.includes("glob") || t.includes("list") || t.includes("read") || t.includes("search") || t.includes("browse"))) {
          swarmFocusId = "thread-scout-research";
          swarmDetail = `Searching or inspecting matching dataset pattern parallelly...`;
        } else {
          swarmFocusId = "thread-reviewer-qa";
          swarmDetail = `Executing process action or dependency audits...`;
        }

        // Put others to resting states, put active focus on working
        swarmState = swarmState.map(s => {
          if (s.id === swarmFocusId) {
            return { ...s, status: "working" as const, detail: swarmDetail };
          } else if (s.id === "rmcs") {
            return { ...s, status: "waiting" as const, detail: `Supervising ${swarmFocusId} execution lane...` };
          } else if (s.status === "working") {
            return { ...s, status: "idle" as const, detail: "Awaiting next task lane instructions" };
          }
          return s;
        });
        emitSwarmState();

        const phase = ["acting", "observing", "repairing", "reporting"].includes(decision.phase) ? decision.phase : "acting";

        if (decision.projectType) {
          sendAgentEvent(res, { type: "project_type", projectType: decision.projectType });
        }

        sendAgentEvent(res, {
          type: "acting",
          label: (firstTool === "finish" || decision.done) ? "Finishing" : "Action",
          status: "running",
          startedAt: Date.now(),
          toolName: "multiple-tools",
          summary: decision.summary || ((firstTool === "finish" || decision.done) ? "Preparing final results." : `Executing ${toolsToRun.length} sub-agent tools in parallel.`),
        });

        if (decision.done || firstTool === "finish") {
          observations.push(decision.final?.summary || decision.summary || "Run finished.");
          if (focusTodo) {
            sendAgentEvent(res, {
              type: "todo_focus",
              todoId: focusTodo.id,
              status: "done",
              label: focusTodo.title,
            });
          }
          break;
        }

        sendAgentEvent(res, {
          type: "tool_called",
          label: "Action",
          status: "running",
          toolName: "multiple-tools",
          summary: decision.summary || `Running ${toolsToRun.length} parallel tools...`,
        });

        const parallelPromises = toolsToRun.map(async (t: any) => {
           const mapped = mapAgentTool(t.tool, t.args || {});
           const result = await runControlledTool(mapped.tool, mapped.args).catch((error: any) => ({
             ok: false,
             observation: error?.message || `${t.tool} failed.`,
           }));
           return { tool: mapped.tool, result };
        });

        const parallelResults = await Promise.all(parallelPromises);

        let allOk = true;
        for (const { tool, result } of parallelResults) {
           observations.push(`${tool}: ${result.observation}`);
           if (!result.ok) allOk = false;
        }

        if (allOk) {
          consecutiveFailures = 0;
        } else {
          consecutiveFailures++;
        }

        const combinedObservation = parallelResults.map(({ tool, result }) => `[${tool}]: ${result.observation.slice(0, 500)}`).join('\n');

        sendAgentEvent(res, {
          type: "tool_result",
          label: "Observation",
          status: allOk ? "done" : "error",
          toolName: "multiple-tools",
          observation: combinedObservation,
          summary: allOk ? `Successfully finished ${toolsToRun.length} parallel queries.` : `Encountered errors in one or more parallel operations.`,
          completedAt: Date.now(),
        });

        sendAgentEvent(res, {
          type: "observing",
          label: "Observation",
          status: "done",
          observation: combinedObservation,
          completedAt: Date.now(),
        });

        // Transition working lanes back to finished completed/idle states
        swarmState = swarmState.map(s => {
          if (s.status === "working") {
            const outcome = allOk ? "completed" as const : "error" as const;
            const detailLabel = allOk ? `Successfully executed parallel tools.` : `Encountered error in parallel tools.`;
            return { ...s, status: outcome, detail: detailLabel };
          }
          return s;
        });
        emitSwarmState();

        if (focusTodo) {
          sendAgentEvent(res, {
            type: "todo_focus",
            todoId: focusTodo.id,
            status: allOk ? "done" : "error",
            label: focusTodo.title,
          });
        }
      }

      // Move all swarm state lanes to completed successfully
      swarmState = swarmState.map(s => ({
        ...s,
        status: "completed" as const,
        detail: s.id === "rmcs" ? "Mission accomplished. Swarm decommissioned." : "Elegantly finished all tasks."
      }));
      emitSwarmState();

      const final = await callJsonModel(
        body,
        "Return strict JSON only. Write a very brief, clean, and simple summary of what was actually built for the user under 'summary'. Focus only on user-facing features/outcomes and keep it short and friendly. Avoid technical jargon like data layers, Prisma, databases, or complex backend internals. Just list the core built features. Keep nextSteps and whatChanged as clean JSON arrays.",
        `${contextSnapshot()}\n\nReturn JSON: {"summary":"# Completed Features\\n\\nBuilt ...","nextSteps":["what to check"],"whatChanged":["..."]}`
      ).catch(() => ({
        summary: "Completed the autonomous workspace run.",
        nextSteps: ["Review the generated workspace."],
        whatChanged: [...changedFiles],
      }));

      sendAgentEvent(res, {
        type: "reporting",
        label: "Finish",
        status: "done",
        summary: final.summary || "Task completed successfully.",
        observation: Array.isArray(final.nextSteps) ? final.nextSteps.join("\n") : undefined,
        nextSteps: Array.isArray(final.nextSteps) ? final.nextSteps : [],
        whatChanged: Array.isArray(final.whatChanged) ? final.whatChanged : [...changedFiles],
        completedAt: Date.now(),
      });

      const result = {
        files: currentFilesState,
        dependencies: currentDepsState,
        thoughts: final.summary || observations.join("\n"),
        lastRun: {
          summary: final.summary || "Autonomous run completed.",
          iterations: Math.min(maxIterations, observations.length),
          changedFiles: [...changedFiles],
          nextSteps: Array.isArray(final.nextSteps) ? final.nextSteps : [],
        },
      };

      sendAgentEvent(res, { type: "complete", label: "Complete", status: "done", result });
    } catch (error: any) {
      sendAgentEvent(res, {
        type: "error",
        label: error?.message || "Agent stream failed",
        status: "error",
        summary: "The autonomous run stopped before completion.",
      });
    } finally {
      res.end();
    }
  });


  // ── Dedicated /sandbox/shell route (runs locally) ──
  app.post("/sandbox/shell", async (req, res) => {
    const command = req.body?.command;
    const cwd = req.body?.cwd || "/workspace";
    if (!command || typeof command !== "string") {
      return res.status(400).json({ ok: false, output: "command is required" });
    }

    // Local execution
    try {
      const localCwd = cwd.startsWith("/workspace")
        ? path.resolve(process.cwd(), "workspace", cwd.replace(/^\/workspace\/?/, "") || ".")
        : path.resolve(process.cwd(), "workspace");
      const output = execSync(command, {
        cwd: localCwd,
        timeout: 60_000,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 10,
        shell: process.platform === "win32" ? "powershell.exe" : "/bin/sh",
      });
      return res.json({ ok: true, output: output || "(no output)" });
    } catch (localErr: any) {
      const out = [localErr.stdout, localErr.stderr].filter(Boolean).join("\n") || localErr.message;
      return res.status(200).json({ ok: false, output: `[exit ${localErr.status || 1}]\n${out}` });
    }
  });

  // ── Sandbox health check (local only) ──
  app.get("/sandbox/health", async (_req, res) => {
    return res.json({ ok: true, docker: false, mode: "local", message: "Running in local mode. Shell commands execute locally." });
  });

  // ── Generic sandbox/fs routes (no-op since backend container is removed) ──
  app.all(["/sandbox/:path(*)", "/fs/:path(*)", "/health"], async (req, res) => {
    res.status(503).json({
      message: "Computer sandbox container is disabled",
      tip: "Everything runs in local-only mode. All operations execute directly on the local machine."
    });
  });



  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    runBootDiagnosis().catch((e) => console.error("Error during boot diagnosis:", e));
  });
}

startServer();

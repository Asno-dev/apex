import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const activeClients: Record<string, Client> = {};

export async function getMcpClient(serverName: string, env: Record<string, string>): Promise<Client | null> {
  if (activeClients[serverName]) {
    return activeClients[serverName];
  }

  let cmd = "npx";
  let args: string[] = [];

  switch (serverName) {
    case "google_workspace_mcp":
      // Since it's Python based, using uvx or relying on community npx wrapper.
      // If docker, we can try running a known JS wrapper, or use npx -y github:taylorwilsdon/google_workspace_mcp if it has package.json.
      // Fallback to npx -y @modelcontextprotocol/server-google-workspace if it existed.
      // Let's use npx and standard names, or fallback to python if configured.
      cmd = "npx";
      args = ["-y", "github:taylorwilsdon/google_workspace_mcp"];
      break;
    case "github_mcp":
      cmd = "npx";
      args = ["-y", "@modelcontextprotocol/server-github"];
      break;
    case "telegram_mcp":
      cmd = "npx";
      args = ["-y", "github:kuchin/telegram-mcp-server"];
      break;
    case "chrome_devtools_mcp":
      cmd = "npx";
      args = ["-y", "github:ChromeDevTools/chrome-devtools-mcp"];
      break;
    default:
      return null;
  }

  try {
    const transport = new StdioClientTransport({
      command: cmd,
      args: args,
      env: { ...process.env, ...env },
    });
    
    // Set a timeout for transport start
    const transportReady = transport.start();
    await Promise.race([
        transportReady,
        new Promise((_, reject) => setTimeout(() => reject(new Error("MCP transport start timeout")), 15000))
    ]);

    const client = new Client(
      {
        name: `bud-client-${serverName}`,
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    const clientInit = client.connect(transport);
    await Promise.race([
        clientInit,
        new Promise((_, reject) => setTimeout(() => reject(new Error("MCP client connect timeout")), 15000))
    ]);
    
    activeClients[serverName] = client;
    return client;
  } catch (err: any) {
    console.error(`Failed to initialize MCP client ${serverName}:`, err);
    return null;
  }
}

export async function getAllMcpTools(configs: Record<string, Record<string, string>>): Promise<{ serverName: string; tools: any[] }[]> {
  const result = [];
  for (const [serverName, env] of Object.entries(configs)) {
    if (!serverName.endsWith("_mcp")) continue;
    
    const client = await getMcpClient(serverName, env);
    if (!client) continue;

    try {
      const toolsResponse = await client.listTools();
      // append prefix to tool names
      const prefixedTools = (toolsResponse.tools || []).map((t: any) => ({
        ...t,
        originalName: t.name,
        name: `mcp__${serverName}__${t.name}`
      }));
      result.push({ serverName, tools: prefixedTools });
    } catch (e) {
      console.error(`Error listing tools for ${serverName}:`, e);
    }
  }
  return result;
}

export async function executeMcpTool(prefixedToolName: string, args: any): Promise<any> {
    const parts = prefixedToolName.split('__');
    if (parts.length < 3 || parts[0] !== 'mcp') {
        throw new Error(`Invalid MCP tool name: ${prefixedToolName}`);
    }
    const serverName = parts[1];
    const actualToolName = parts.slice(2).join('__'); // in case tool name has __

    const client = activeClients[serverName];
    if (!client) {
        throw new Error(`MCP Client ${serverName} is not active or connected.`);
    }

    try {
        const result = await client.callTool({
            name: actualToolName,
            arguments: args
        });
        return result;
    } catch (err: any) {
        throw new Error(`MCP Tool ${actualToolName} execution failed: ${err.message}`);
    }
}

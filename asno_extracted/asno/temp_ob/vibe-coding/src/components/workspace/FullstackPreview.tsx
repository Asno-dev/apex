import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Monitor,
  AlertCircle,
  ExternalLink,
  Loader2,
  Terminal,
  Play,
  Eye,
  Maximize,
  Minimize,
  RotateCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Copy,
  Check,
  Smartphone,
} from "lucide-react";
import { useStore } from "../../store/useStore";

const parseLogLine = (log: string) => {
  const clean = log.trim();
  let type: "build" | "log" | "debug" | "error" | "rejection" = "log";

  // Check unhandled rejections
  if (
    clean.includes("Unhandled Rejection") ||
    clean.includes("UnhandledPromiseRejection") ||
    clean.includes("WebSocket closed without opened")
  ) {
    type = "rejection";
  } else if (
    clean.toLowerCase().includes("error") ||
    clean.toLowerCase().includes("failed") ||
    clean.toLowerCase().includes("err!") ||
    clean.toLowerCase().includes("failed to connect to websocket")
  ) {
    type = "error";
  } else if (
    clean.includes("connecting...") ||
    clean.includes("[vite] connecting") ||
    clean.includes("HMR") ||
    clean.includes("websocket")
  ) {
    type = "debug";
  } else if (
    clean.includes("Render Start") ||
    clean.includes("Render End") ||
    clean.toLowerCase().includes("starting") ||
    clean.toLowerCase().includes("booting") ||
    clean.toLowerCase().includes("writing") ||
    clean.toLowerCase().includes("installing") ||
    clean.toLowerCase().includes("ready") ||
    clean.toLowerCase().includes("compiled") ||
    clean.startsWith("⚙️") ||
    clean.startsWith("✅") ||
    clean.startsWith("📂") ||
    clean.startsWith("📦") ||
    clean.startsWith("🚀") ||
    clean.startsWith("🌐") ||
    clean.startsWith("✏️")
  ) {
    type = "build";
  }

  // Remove matching wrapper quotes if message is wrapped in dual double quotes, like "CONNECTED"
  let parsedMessage = clean;
  if (
    parsedMessage.startsWith('"') &&
    parsedMessage.endsWith('"') &&
    parsedMessage.length > 2
  ) {
    parsedMessage = parsedMessage.substring(1, parsedMessage.length - 1);
  } else if (
    parsedMessage.startsWith("'") &&
    parsedMessage.endsWith("'") &&
    parsedMessage.length > 2
  ) {
    parsedMessage = parsedMessage.substring(1, parsedMessage.length - 1);
  }

  return { type, message: parsedMessage };
};

interface FullstackPreviewProps {
  project: any;
  isGenerating: boolean;
}

type PreviewStatus = "booting" | "installing" | "starting" | "ready" | "error";

// Singleton pattern to ensure only one WebContainer boots in the page lifecycle
let webcontainerPromise: Promise<any> | null = null;

async function getWebContainerInstance() {
  if (!webcontainerPromise) {
    webcontainerPromise = Promise.race([
      import("@webcontainer/api").then(({ WebContainer }) =>
        WebContainer.boot({ coep: "credentialless" }),
      ),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "WebContainer boot timed out after 15 seconds. This is often caused by missing SharedArrayBuffer or Cross-Origin Isolation iframe restrictions in your browser. Open in a New Tab to resolve.",
              ),
            ),
          15000,
        ),
      ),
    ]).catch((err) => {
      // Reset the cached promise so subsequent retries can attempt a fresh boot
      webcontainerPromise = null;
      throw err;
    });
  }
  return webcontainerPromise;
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

// Convert a flat file list from store into WebContainer directory structure
function healJson(jsonStr: string): string {
  let str = cleanEscapedQuotes(jsonStr.trim());
  if (!str) return "{}";

  // If there are markdown blocks, remove them first
  if (str.startsWith("```")) {
    const firstLineEnd = str.indexOf("\n");
    if (firstLineEnd !== -1) {
      str = str.substring(firstLineEnd);
    }
    if (str.endsWith("```")) {
      str = str.substring(0, str.length - 3);
    }
    str = str.trim();
  }

  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === "\\") {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        if (stack[stack.length - 1] === "{") {
          stack.pop();
        }
      } else if (char === "]") {
        if (stack[stack.length - 1] === "[") {
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
    if (open === "{") {
      str += "}";
    } else if (open === "[") {
      str += "]";
    }
  }

  return str;
}

function normalizePackageJson(
  content: string,
  requestedProjectType: "vite" | "nextjs" = "vite",
): string {
  let pkg: any = {};
  const cleaned = content.trim();
  try {
    pkg = JSON.parse(cleaned);
  } catch (e) {
    try {
      pkg = JSON.parse(healJson(cleaned));
    } catch (e2) {
      pkg = {};
    }
  }

  // Ensure default structure
  if (typeof pkg !== "object" || pkg === null) {
    pkg = {};
  }

  // Normalize dependencies schema: array input healing
  if (Array.isArray(pkg.dependencies)) {
    const arrayDeps = pkg.dependencies;
    pkg.dependencies = {};
    arrayDeps.forEach((dep: string) => {
      if (typeof dep === "string" && dep.trim()) {
        pkg.dependencies[dep.trim()] = "latest";
      }
    });
  } else if (
    typeof pkg.dependencies !== "object" ||
    pkg.dependencies === null
  ) {
    pkg.dependencies = {};
  }

  // Normalize devDependencies schema: array input healing
  if (Array.isArray(pkg.devDependencies)) {
    const arrayDevDeps = pkg.devDependencies;
    pkg.devDependencies = {};
    arrayDevDeps.forEach((dep: string) => {
      if (typeof dep === "string" && dep.trim()) {
        pkg.devDependencies[dep.trim()] = "latest";
      }
    });
  } else if (
    typeof pkg.devDependencies !== "object" ||
    pkg.devDependencies === null
  ) {
    pkg.devDependencies = {};
  }

  // Clean values and keys in dependencies and devDependencies
  const cleanedDeps: Record<string, string> = {};
  Object.entries(pkg.dependencies || {}).forEach(([k, v]) => {
    const cleanK = typeof k === "string" ? k.trim() : "";
    if (cleanK && !cleanK.startsWith(".") && !cleanK.startsWith("/")) {
      cleanedDeps[cleanK] = typeof v === "string" ? v.trim() : "latest";
    }
  });
  pkg.dependencies = cleanedDeps;

  const cleanedDevDeps: Record<string, string> = {};
  Object.entries(pkg.devDependencies || {}).forEach(([k, v]) => {
    const cleanK = typeof k === "string" ? k.trim() : "";
    if (cleanK && !cleanK.startsWith(".") && !cleanK.startsWith("/")) {
      cleanedDevDeps[cleanK] = typeof v === "string" ? v.trim() : "latest";
    }
  });
  pkg.devDependencies = cleanedDevDeps;

  // Ensure default TypeScript typings and package are preinstalled so we don't trigger automatic npm installs inside WebContainers
  if (!pkg.devDependencies["typescript"])
    pkg.devDependencies["typescript"] = "^5.4.5";
  if (!pkg.devDependencies["@types/react"])
    pkg.devDependencies["@types/react"] = "^18.3.1";
  if (!pkg.devDependencies["@types/react-dom"])
    pkg.devDependencies["@types/react-dom"] = "^18.3.0";
  if (!pkg.devDependencies["@types/node"])
    pkg.devDependencies["@types/node"] = "^20.12.7";

  // Detect project type
  const isNext =
    requestedProjectType === "nextjs" ||
    pkg.dependencies.next ||
    pkg.dependencies["@types/next"];

  if (!pkg.name) pkg.name = "vibe-app";
  if (!pkg.version) pkg.version = "1.0.0";
  if (!pkg.type && !isNext) {
    pkg.type = "module";
  } else if (isNext && pkg.type === "module") {
    delete pkg.type;
  }
  if (!pkg.scripts) pkg.scripts = {};

  if (isNext) {
    if (!pkg.scripts.dev) pkg.scripts.dev = "next dev";
    if (!pkg.scripts.build) pkg.scripts.build = "next build";
    if (!pkg.scripts.start) pkg.scripts.start = "next start";

    // Ensure essential Next dependencies
    const nextDeps = ["next", "react", "react-dom"];
    nextDeps.forEach((dep) => {
      // Force stable Next.js WebContainer version (React 18 / Next 14) to avoid SWC WASM/Memory errors
      if (dep === "next") {
        pkg.dependencies[dep] = "14.2.15";
        pkg.devDependencies["@next/swc-wasm-nodejs"] = "14.2.15";
      }
      if (dep === "react" || dep === "react-dom") {
        pkg.dependencies[dep] = "^18.3.1";
      }
    });

    if (pkg.devDependencies) {
      const typesReact = pkg.devDependencies["@types/react"] || "";
      if (
        !typesReact ||
        typesReact.startsWith("19") ||
        typesReact.startsWith("^19") ||
        typesReact === "latest"
      ) {
        pkg.devDependencies["@types/react"] = "^18.3.12";
      }
      const typesReactDom = pkg.devDependencies["@types/react-dom"] || "";
      if (
        !typesReactDom ||
        typesReactDom.startsWith("19") ||
        typesReactDom.startsWith("^19") ||
        typesReactDom === "latest"
      ) {
        pkg.devDependencies["@types/react-dom"] = "^18.3.1";
      }
    }
  } else {
    // Vite setup
    if (!pkg.scripts.dev) pkg.scripts.dev = "vite";
    if (!pkg.scripts.build) pkg.scripts.build = "vite build";
    if (!pkg.scripts.preview) pkg.scripts.preview = "vite preview";

    const viteDeps = ["react", "react-dom"];
    viteDeps.forEach((dep) => {
      if (!pkg.dependencies[dep]) {
        pkg.dependencies[dep] = "latest";
      }
    });

    if (!pkg.devDependencies) pkg.devDependencies = {};
    if (!pkg.devDependencies.vite && !pkg.dependencies.vite) {
      pkg.devDependencies.vite = "latest";
    }
    if (
      !pkg.devDependencies["@vitejs/plugin-react"] &&
      !pkg.dependencies["@vitejs/plugin-react"]
    ) {
      pkg.devDependencies["@vitejs/plugin-react"] = "latest";
    }
  }

  // Ensure dependencies consists of string values for installation safety
  Object.keys(pkg.dependencies).forEach((k) => {
    if (typeof pkg.dependencies[k] !== "string") {
      pkg.dependencies[k] = "latest";
    }
  });

  return JSON.stringify(pkg, null, 2);
}

function buildWebContainerFiles(
  files: Record<string, any>,
  projectType: "vite" | "nextjs" = "vite",
) {
  const root: any = {};
  const flatFiles = { ...files };

  // Inject WebContainer Next.js stability fixes automatically
  if (
    projectType === "nextjs" ||
    Object.keys(flatFiles).some((f) => f.includes("next.config"))
  ) {
    if (flatFiles[".babelrc"]) delete flatFiles[".babelrc"];
    if (flatFiles["/.babelrc"]) delete flatFiles["/.babelrc"];

    if (!flatFiles["tsconfig.json"] && !flatFiles["/tsconfig.json"]) {
      flatFiles["tsconfig.json"] =
        `{\n  "compilerOptions": {\n    "target": "es5",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": false,\n    "forceConsistentCasingInFileNames": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "node",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "plugins": [\n      {\n        "name": "next"\n      }\n    ],\n    "paths": {\n      "@/*": ["./*"]\n    }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}`;
    }
  }

  for (const [filePath, fileData] of Object.entries(flatFiles)) {
    const pathParts = filePath.split("/").filter(Boolean);
    let current = root;

    let contents =
      typeof fileData === "string"
        ? fileData
        : fileData && typeof fileData === "object" && "code" in fileData
          ? (fileData as any).code
          : "";

    if (filePath.endsWith("package.json")) {
      contents = normalizePackageJson(contents, projectType);
    }

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;

      if (isLast) {
        current[part] = {
          file: {
            contents,
          },
        };
      } else {
        if (!current[part]) {
          current[part] = {
            directory: {},
          };
        }
        if (!current[part].directory) {
          current[part] = {
            directory: {},
          };
        }
        current = current[part].directory;
      }
    }
  }
  return root;
}

export function FullstackPreview({
  project,
  isGenerating,
}: FullstackPreviewProps) {
  const [status, setStatus] = useState<PreviewStatus>("booting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogsCollapsed, setIsLogsCollapsed] = useState(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [copiedError, setCopiedError] = useState(false);
  const [previewMode, setPreviewMode] = useState<"webcontainer" | "local">("webcontainer");
  const [localPort, setLocalPort] = useState<string>("3000");

  useEffect(() => {
    if (project?.projectType) {
      setLocalPort(project.projectType === "vite" ? "5173" : "3000");
    }
  }, [project?.projectType]);

  const webcontainerRef = useRef<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const prevFilesRef = useRef<Record<string, string>>({});
  const activeProcessRef = useRef<any>(null);
  const installProcessRef = useRef<any>(null);
  const sessionRef = useRef<number>(0);
  const lastErrorRef = useRef<string>("");

  const { setDevServerRunning, isFullscreen, setIsFullscreen, currentError, previewDevice } =
    useStore();

  const isSABError =
    errorMessage.toLowerCase().includes("sharedarraybuffer") ||
    errorMessage.toLowerCase().includes("crossoriginisolated") ||
    errorMessage.toLowerCase().includes("postmessage");

  // Track global worker/sandbox errors that are rejected or thrown asynchronously
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (
        msg.toLowerCase().includes("sharedarraybuffer") ||
        msg.toLowerCase().includes("postmessage")
      ) {
        event.preventDefault(); // Prevent browser-level reporting of the expected cross-origin issue inside the test/parent wrapper
        console.warn(
          "Suppressing browser-level postMessage worker error inside embedded iframe. Escaper fallback provided.",
        );
        setStatus("error");
        setErrorMessage(
          msg ||
            "Failed to execute 'postMessage' on 'Worker': SharedArrayBuffer transfer requires self.crossOriginIsolated.",
        );
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || "");
      if (
        reason.toLowerCase().includes("sharedarraybuffer") ||
        reason.toLowerCase().includes("postmessage")
      ) {
        event.preventDefault(); // Suppress unhandled promise rejection error reporting
        console.warn(
          "Suppressing unhandled webworker rejection error inside embedded iframe. Escaper fallback provided.",
        );
        setStatus("error");
        setErrorMessage(
          reason ||
            "Failed to execute 'postMessage' on 'Worker': SharedArrayBuffer transfer requires self.crossOriginIsolated.",
        );
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const appendLog = (text: string) => {
    // Strip ANSI escape codes
    const cleanText = text
      .replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        "",
      )
      .replace(/\r/g, "\n");

    const trimmed = cleanText.trim();
    if (!trimmed) return;
    if (trimmed.length === 1 && "-\\|/".includes(trimmed)) return;

    // Ignore lines that are just a few periods or a loader
    if (/^[.\s]+$/.test(trimmed)) return;

    // Scan for compilation or load errors
    const lines = cleanText.split("\n");
    let detectedError = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lower = line.toLowerCase();

      if (
        line.includes("Failed to compile") ||
        line.includes("Module not found:") ||
        line.includes("Syntax error:") ||
        line.includes("RollupError:") ||
        line.includes("TypeScript error") ||
        line.includes("Compilation error") ||
        lower.includes("error: target container is not") ||
        line.includes("error during build") ||
        line.includes("sh: next: not found") ||
        line.includes("sh: vite: not found") ||
        (line.startsWith("npm ERR!") && lower.includes("failed"))
      ) {
        const context = lines
          .slice(Math.max(0, i), Math.min(lines.length, i + 8))
          .map((l) => l.trim())
          .filter(Boolean);
        detectedError = context.join("\n");
        break;
      }
    }

    if (detectedError && detectedError !== lastErrorRef.current) {
      lastErrorRef.current = detectedError;
      useStore.getState().setCurrentError(detectedError);
    }

    // Scan for successful compilation/building to auto-clear currentError
    let clearsError = false;
    for (const line of lines) {
      if (
        line.includes("Compiled successfully") ||
        line.includes("compiled successfully") ||
        line.includes("vite v") ||
        line.includes("Local:") ||
        line.includes("ready - started server on")
      ) {
        clearsError = true;
        break;
      }
    }

    if (clearsError) {
      lastErrorRef.current = "";
      useStore.getState().setCurrentError(null);
    }

    setLogs((prev) => {
      const newLines = cleanText
        .split("\n")
        .filter((l) => l.trim() && l.trim().length > 1);
      if (newLines.length === 0) return prev;
      const nextLogs = [...prev, ...newLines];
      // Keep only last 200 lines to prevent memory explosion / React DOM lag
      return nextLogs.length > 200
        ? nextLogs.slice(nextLogs.length - 200)
        : nextLogs;
    });
  };

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const initWebContainer = async () => {
    const currentSession = ++sessionRef.current;
    const isCurrent = () => currentSession === sessionRef.current;

    try {
      if (!isCurrent()) return;
      setStatus("booting");
      setErrorMessage("");
      setLogs([]);
      appendLog("⚙️ Starting StackBlitz WebContainer...");

      // Kill any existing processes before starting a new session
      if (activeProcessRef.current) {
        try {
          activeProcessRef.current.kill();
        } catch (e) {
          console.warn("Failed to kill active process:", e);
        }
        activeProcessRef.current = null;
      }
      if (installProcessRef.current) {
        try {
          installProcessRef.current.kill();
        } catch (e) {
          console.warn("Failed to kill install process:", e);
        }
        installProcessRef.current = null;
      }

      if (typeof window !== "undefined" && !window.crossOriginIsolated) {
        console.warn(
          "Window is not crossOriginIsolated, but attempting credentialless WebContainer boot...",
        );
      }

      const webcontainerInstance = await getWebContainerInstance();
      if (!isCurrent()) return;
      webcontainerRef.current = webcontainerInstance;

      appendLog("✅ WebContainer booted successfully!");

      // Write initial files
      appendLog("📂 Writing project files into in-browser workspace...");
      const filesObject = buildWebContainerFiles(
        project?.files || {},
        project?.projectType || "vite",
      );
      await webcontainerInstance.mount(filesObject);
      if (!isCurrent()) return;

      // Save written files in ref for future diff writes
      const filesState: Record<string, string> = {};
      Object.entries(project?.files || {}).forEach(
        ([path, fileData]: [string, any]) => {
          let content =
            typeof fileData === "string" ? fileData : fileData?.code || "";
          if (path.endsWith("package.json")) {
            content = normalizePackageJson(
              content,
              project?.projectType || "vite",
            );
          }
          filesState[path] = content;
        },
      );
      prevFilesRef.current = filesState;

      appendLog("📦 Installing dependencies via pnpm (takes ~5-15s)...");
      setStatus("installing");

      const installProcess = await webcontainerInstance.spawn("pnpm", [
        "install",
        "--no-frozen-lockfile",
        "--prefer-offline",
      ]);
      if (!isCurrent()) {
        try {
          installProcess.kill();
        } catch (e) {}
        return;
      }
      installProcessRef.current = installProcess;

      installProcess.output
        .pipeTo(
          new WritableStream({
            write(data) {
              if (isCurrent()) appendLog(data);
            },
          }),
        )
        .catch((err) => {
          console.warn("installProcess output pipe aborted/error:", err);
        });

      const installExitCode = await installProcess.exit;
      if (!isCurrent()) return;
      installProcessRef.current = null;
      if (installExitCode !== 0) {
        appendLog(
          `⚠️ Warning: pnpm install exited with code ${installExitCode}. Attempting to start development server anyway...`,
        );
      }

      // Automate Prisma setup if schema.prisma exists
      const hasPrisma = Object.keys(project?.files || {}).some((f) =>
        f.toLowerCase().includes("schema.prisma"),
      );
      if (hasPrisma) {
        appendLog("💾 Prisma schema detected. Initializing database and generating client...");
        try {
          const prismaProcess = await webcontainerInstance.spawn("npx", [
            "prisma",
            "db",
            "push",
            "--accept-to-lose-all-data",
          ]);
          prismaProcess.output
            .pipeTo(
              new WritableStream({
                write(data) {
                  if (isCurrent()) appendLog(data);
                },
              }),
            )
            .catch(() => {});
          const prismaExit = await prismaProcess.exit;
          if (prismaExit !== 0) {
            appendLog(`⚠️ Warning: Prisma db push exited with code ${prismaExit}.`);
          } else {
            appendLog("✅ Prisma database synchronized successfully!");
            
            // Seed if seed is configured in package.json or if typescript seed is present
            const packageJsonContentStr = project?.files?.["package.json"] || project?.files?.["/package.json"];
            let hasSeedScript = false;
            if (packageJsonContentStr) {
              const pStr = typeof packageJsonContentStr === "string" ? packageJsonContentStr : (packageJsonContentStr as any).code || "{}";
              try {
                const pj = JSON.parse(pStr);
                if (pj?.prisma?.seed || pj?.scripts?.["prisma:seed"]) {
                  hasSeedScript = true;
                }
              } catch(e) {}
            }
            if (hasSeedScript || Object.keys(project?.files || {}).some(f => f.includes("seed.ts") || f.includes("seed.js"))) {
              appendLog("🌱 Seeding database...");
              const seedProcess = await webcontainerInstance.spawn("npx", [
                "prisma",
                "db",
                "seed",
              ]);
              seedProcess.output
                .pipeTo(
                  new WritableStream({
                    write(data) {
                      if (isCurrent()) appendLog(data);
                    },
                  }),
                )
                .catch(() => {});
              const seedExit = await seedProcess.exit;
              if (seedExit !== 0) {
                appendLog(`⚠️ Warning: Database seeding exited with code ${seedExit}.`);
              } else {
                appendLog("🌱 Database seeded successfully!");
              }
            }
          }
        } catch (e: any) {
          appendLog(`❌ Prisma initialization failed: ${e.message || e}`);
        }
      }

      const packageJsonContent =
        project?.files?.["package.json"] || project?.files?.["/package.json"];
      let isVite = false;
      let isNext = false;

      try {
        if (packageJsonContent) {
          const pkgString =
            typeof packageJsonContent === "string"
              ? packageJsonContent
              : (packageJsonContent as any).code || "{}";
          let pkg: any = {};
          try {
            pkg = JSON.parse(pkgString);
          } catch (pe) {
            pkg = JSON.parse(healJson(pkgString));
          }
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          if (deps.vite) isVite = true;
          if (deps.next) isNext = true;
        }
      } catch (e) {
        // Ignore parse error
      }

      if (!isVite && !isNext) {
        if (project?.dependencies?.next) isNext = true;
        if (project?.dependencies?.vite) isVite = true;
      }

      let devProcess;
      const targetPort = 3002;

      if (isNext) {
        appendLog("🚀 Running Next.js development server...");
        setStatus("starting");

        // WebContainers do not support native binaries.
        // Delete the native optional dependencies so Next.js falls back to SWC WASM cleanly.
        try {
          await webcontainerInstance.fs.rm(
            "node_modules/@next/swc-linux-x64-gnu",
            { recursive: true, force: true },
          );
          await webcontainerInstance.fs.rm(
            "node_modules/@next/swc-linux-x64-musl",
            { recursive: true, force: true },
          );
          appendLog(
            "✅ Cleaned up native addons to force Next.js SWC WASM fallback",
          );
        } catch (e) {
          // Ignore
        }

        devProcess = await webcontainerInstance.spawn(
          "pnpm",
          ["run", "dev", "-H", "0.0.0.0", "-p", `${targetPort}`],
          {
            env: {
              NEXT_TELEMETRY_DISABLED: "1",
              CHOKIDAR_USEPOLLING: "1",
              WATCHPACK_POLLING: "true",
            },
          },
        );
      } else if (isVite) {
        appendLog("🚀 Running Vite development server...");
        setStatus("starting");
        devProcess = await webcontainerInstance.spawn("pnpm", [
          "run",
          "dev",
          "--host",
          "0.0.0.0",
          "--port",
          `${targetPort}`,
        ]);
      } else {
        appendLog("🚀 Running development server...");
        setStatus("starting");
        devProcess = await webcontainerInstance.spawn("pnpm", ["run", "dev"]); // Fallback, might not be targetPort
      }

      if (!isCurrent()) {
        try {
          devProcess.kill();
        } catch (e) {}
        return;
      }
      activeProcessRef.current = devProcess;

      devProcess.output
        .pipeTo(
          new WritableStream({
            write(data) {
              if (isCurrent()) appendLog(data);
            },
          }),
        )
        .catch((err) => {
          console.warn("devProcess output pipe aborted/error:", err);
        });

      // Listen for server-ready events
      webcontainerInstance.on("server-ready", (port: number, url: string) => {
        if (!isCurrent()) return;
        appendLog(`🌐 Dev server ready on port ${port} at ${url}`);
        setPreviewUrl(url);
        setStatus("ready");
        setIsLogsCollapsed(true);
        setDevServerRunning(true);
      });
    } catch (err: any) {
      if (!isCurrent()) return;
      activeProcessRef.current = null;
      installProcessRef.current = null;
      const errMsg = err?.message || "";
      const isSAB =
        errMsg.toLowerCase().includes("sharedarraybuffer") ||
        errMsg.toLowerCase().includes("crossoriginisolated") ||
        errMsg.toLowerCase().includes("postmessage");

      if (isSAB) {
        console.warn(
          "WebContainer initialization blocked due to iframe cross-origin isolation restrictions. Suppressing console.error signal.",
        );
      } else {
        console.error(err);
        useStore
          .getState()
          .setCurrentError(err.message || "Failed to initialize WebContainer");
      }

      setErrorMessage(err.message || "Failed to initialize WebContainer");
      setStatus("error");

      if (isSAB) {
        setIsLogsCollapsed(true);
      } else {
        setIsLogsCollapsed(false);
      }
    }
  };

  // Live File Sync: sync store edits into WebContainer filesystem for HMR
  useEffect(() => {
    if (!webcontainerRef.current || status === "booting" || status === "error")
      return;

    const syncFiles = async () => {
      const currentFiles = project?.files || {};
      const webcontainer = webcontainerRef.current;

      for (const [filePath, fileData] of Object.entries(currentFiles)) {
        let currentCode =
          typeof fileData === "string"
            ? fileData
            : (fileData as any)?.code || "";
        const prevCode = prevFilesRef.current[filePath];

        if (filePath.endsWith("package.json")) {
          currentCode = normalizePackageJson(
            currentCode,
            project?.projectType || "vite",
          );
        }

        if (currentCode !== prevCode) {
          try {
            // Write only modified or new files
            const pathParts = filePath.split("/").filter(Boolean);
            const dirParts = pathParts.slice(0, -1);

            if (dirParts.length > 0) {
              await webcontainer.fs.mkdir(dirParts.join("/"), {
                recursive: true,
              });
            }

            const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
            await webcontainer.fs.writeFile(cleanPath, currentCode);
            prevFilesRef.current[filePath] = currentCode;
            appendLog(`✏️ Synced modified file: ${cleanPath}`);
          } catch (e: any) {
            console.error(`Failed to sync file ${filePath}:`, e);
          }
        }
      }
    };

    syncFiles();
  }, [project?.files, status]);

  // Boot and Reboot on Project Switch
  useEffect(() => {
    if (project?.id && previewMode === "webcontainer") {
      initWebContainer();
    }
    return () => {
      // Cleanup running processes on unmount/project switch
      if (activeProcessRef.current) {
        try {
          activeProcessRef.current.kill();
        } catch (e) {}
        activeProcessRef.current = null;
      }
      if (installProcessRef.current) {
        try {
          installProcessRef.current.kill();
        } catch (e) {}
        installProcessRef.current = null;
      }
    };
  }, [project?.id, previewMode]);

  const handleRestart = () => {
    // Always reset the singleton promise to allow a fresh boot attempt
    webcontainerPromise = null;
    webcontainerRef.current = null;
    initWebContainer();
  };

  // Count errors and warnings
  const errorCount = logs.filter((l) => {
    const low = l.toLowerCase();
    return (
      low.includes("error") ||
      low.includes("failed") ||
      low.includes("err!") ||
      low.includes("unhandled rejection")
    );
  }).length;

  const warnCount = logs.filter((l) => {
    const low = l.toLowerCase();
    return (
      low.includes("warning") ||
      low.includes("warn") ||
      low.includes("deprecat")
    );
  }).length;

  const handleClearLogs = () => {
    setLogs([]);
  };

  if (!project || !project.files || Object.keys(project.files).length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#1e1e1e] text-gray-500 font-mono text-xs">
        <Loader2
          size={24}
          className="animate-spin text-indigo-500 mb-2 opacity-60"
        />
        <span>Waiting for project files...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#1e1e1e]">
      {/* Header bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#1a1a1a] px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#141414] p-1 shadow-inner h-[28px]">
            <button
              onClick={() => useStore.getState().setPreviewDevice("full")}
              className={`flex items-center justify-center rounded-lg px-2 h-full transition-all ${useStore.getState().previewDevice === "full" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-500 hover:text-gray-200"}`}
              title="Full Preview"
            >
              <Monitor size={13} />
            </button>
            <button
              onClick={() => useStore.getState().setPreviewDevice("mobile")}
              className={`flex items-center justify-center rounded-lg px-2 h-full transition-all ${useStore.getState().previewDevice === "mobile" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-500 hover:text-gray-200"}`}
              title="Mobile Preview"
            >
              <Smartphone size={13} />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#141414] p-1 shadow-inner h-[28px] ml-2">
            <button
              onClick={() => setPreviewMode("webcontainer")}
              className={`flex items-center justify-center rounded-lg px-2.5 h-full text-[10px] font-bold uppercase tracking-wider transition-all ${previewMode === "webcontainer" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
              title="WebContainer Mode"
            >
              WebContainer
            </button>
            <button
              onClick={() => setPreviewMode("local")}
              className={`flex items-center justify-center rounded-lg px-2.5 h-full text-[10px] font-bold uppercase tracking-wider transition-all ${previewMode === "local" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
              title="Local Server Mode"
            >
              Local Server
            </button>
          </div>

          {previewMode === "local" && (
            <div className="flex items-center gap-1.5 ml-2 h-[28px]">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Port:</span>
              <input
                type="text"
                value={localPort}
                onChange={(e) => setLocalPort(e.target.value.replace(/\D/g, ''))}
                className="w-16 h-full bg-[#141414] border border-white/5 rounded-lg px-2 text-[11px] font-mono text-white outline-none focus:border-white/10"
                placeholder="3000"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status === "ready"
                  ? "bg-green-500 animate-pulse"
                  : status === "error"
                    ? "bg-red-500"
                    : "bg-yellow-400 animate-pulse"
              }`}
            />
            <span className="text-xs font-medium text-gray-400">
              {status === "booting" && "Booting..."}
              {status === "installing" && "Installing..."}
              {status === "starting" && "Starting..."}
              {status === "ready" && "Ready"}
              {status === "error" && "Error"}
            </span>
          </div>

          {(status === "ready" || previewMode === "local") && (
            <>
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shadow-sm"
                title="Refresh App Frame"
              >
                <RotateCw size={14} />
              </button>
              <a
                href={previewMode === "local" ? `http://localhost:${localPort}` : previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shadow-sm"
                title="Open in New Tab"
              >
                <ExternalLink size={14} />
              </a>
            </>
          )}

          <button
            onClick={handleRestart}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shadow-sm"
            title="Reboot Environment"
          >
            <RefreshCw
              size={14}
              className={
                status !== "ready" && status !== "error" ? "animate-spin" : ""
              }
            />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shadow-sm"
            title={isFullscreen ? "Minimize Preview" : "Maximize Preview"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden relative bg-[#1e1e1e] flex flex-col">
        {/* Top interactive workspace / app preview */}
        <div className="flex-1 relative min-h-0 bg-[#1e1e1e] flex flex-col">
          {status === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#1e1e1e] overflow-y-auto">
              {isSABError ? (
                <div className="max-w-xl p-8 rounded-xl bg-[#252526] border border-amber-500/20 shadow-xl text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-100">
                        Iframe Security Restriction
                      </h3>
                      <p className="text-xs text-amber-500/80 font-mono">
                        SharedArrayBuffer & Cross-Origin Isolation Blocked
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed mb-6">
                    Your browser limits <strong>SharedArrayBuffer</strong> when
                    loaded inside an embedded preview frame. To resolve this and
                    boot the in-browser WebContainer engine instantly, please
                    load this workspace in a separate top-level tab!
                  </p>

                  <div className="space-y-2 bg-black/40 p-4 rounded-lg font-mono text-[11px] text-gray-400 mb-6 leading-relaxed border border-white/5">
                    <div className="text-emerald-400 font-semibold mb-1">
                      💡 Self-Resolving Escaper:
                    </div>
                    <div>1. Click "Open Workspace in New Tab" below.</div>
                    <div>
                      2. The background Service Worker automatically injects
                      secure headers.
                    </div>
                    <div>
                      3. The virtual Node.js engine launches instantly in your
                      browser sandbox!
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/10 text-center no-underline"
                    >
                      <ExternalLink size={16} />
                      Open Workspace in New Tab
                    </a>
                    <button
                      onClick={handleRestart}
                      className="flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <RefreshCw size={14} />
                      Retry Boot
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <AlertCircle
                    size={48}
                    className="mb-4 text-red-500 opacity-60"
                  />
                  <h3 className="text-xl font-bold text-gray-200 mb-2">
                    WebContainer Crash
                  </h3>
                  <p className="max-w-md text-gray-400 mb-6 font-mono text-xs text-left bg-black/30 p-3 rounded border border-white/5 max-h-[150px] overflow-auto">
                    {errorMessage || "An error occurred during build."}
                  </p>
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/30 transition-colors border border-red-500/20"
                  >
                    <RefreshCw size={14} />
                    Reboot & Retry
                  </button>
                </>
              )}
            </div>
          ) : (status === "ready" || previewMode === "local") ? (
            <div className={`relative flex-1 h-full w-full flex items-center justify-center min-h-0 bg-[#1e1e1e] ${previewDevice === 'mobile' ? 'py-6' : ''}`}>
              <div className={`relative transition-all duration-300 ease-in-out ${previewDevice === 'mobile' ? 'h-[95%] max-h-[812px] w-[375px] overflow-hidden rounded-[3rem] border-[12px] border-[#161B22] shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white flex flex-col' : 'h-full w-full flex flex-col'}`}>
                {previewDevice === 'mobile' && (
                  <>
                    <div className="absolute inset-x-0 top-0 z-10 mx-auto h-6 w-36 rounded-b-2xl bg-[#161B22]" />
                    <div className="absolute bottom-1.5 inset-x-0 z-10 mx-auto h-1 w-28 rounded-full bg-white/20" />
                  </>
                )}
                <iframe
                  key={iframeKey}
                  src={previewMode === "local" ? `http://localhost:${localPort}` : previewUrl}
                  className="h-full w-full border-none bg-white flex-1"
                  title="App Preview"
                  sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; cross-origin-isolated"
                />
              </div>
              {currentError && (
                <div className="absolute top-4 left-4 right-4 z-40 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-neutral-900/95 p-3.5 text-red-200 shadow-2xl backdrop-blur-md">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="rounded-lg bg-red-500/15 p-1.5 mt-0.5 shrink-0">
                        <AlertTriangle
                          size={14}
                          className="text-red-400 animate-pulse"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-red-300 leading-tight">
                          Compilation Error Detected
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono truncate leading-normal mt-0.5">
                          {typeof currentError === "string"
                            ? currentError.split("\n")[0]
                            : String(currentError).split("\n")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const errStr =
                            typeof currentError === "string"
                              ? currentError
                              : (currentError as any)?.message ||
                                String(currentError);
                          navigator.clipboard.writeText(errStr);
                          setCopiedError(true);
                          setTimeout(() => setCopiedError(false), 2000);
                        }}
                        className="flex h-7 px-2.5 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 text-[11px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all shadow-inner cursor-pointer"
                        title="Copy entire error log"
                      >
                        {copiedError ? (
                          <Check size={11} className="text-emerald-400" />
                        ) : (
                          <Copy size={11} />
                        )}
                        <span>{copiedError ? "Copied!" : "Copy Error"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#1e1e1e]">
              <div className="relative mb-6">
                <Loader2
                  size={48}
                  className="animate-spin text-indigo-500 opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="/bud-logo.svg" alt="Bud Logo" className="w-5 h-5 object-contain" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">
                {status === "booting" && "Booting Virtual Engine..."}
                {status === "installing" && "Running pnpm install..."}
                {status === "starting" && "Bootstrapping Next.js server..."}
              </h3>
              <p className="max-w-md text-gray-400 mb-6 font-sans">
                {status === "booting" &&
                  "Configuring StackBlitz WebAssembly Node.js engine inside your browser tab."}
                {status === "installing" &&
                  "Fetching packages directly to the browser virtual storage via pnpm. This takes around 10 seconds."}
                {status === "starting" &&
                  "Initializing the development server in your virtual Node environment. Almost ready!"}
              </p>
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-indigo-500 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"
                  style={{ width: "40%" }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mb-4">
                Stream output logging in console below
              </p>

              <button
                onClick={() => {
                  webcontainerPromise = null; // Clear cached promise
                  handleRestart();
                }}
                className="mt-2 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-white/10 hover:text-white transition-colors border border-white/10 opacity-60 hover:opacity-100"
              >
                <RefreshCw size={12} />
                Force Restart Engine
              </button>
            </div>
          )}
        </div>

        {/* Bottom Collapsible Logs Panel */}
        <div
          className={`mt-auto border-t border-white/5 bg-[#0b0b0c] transition-all duration-300 flex flex-col shrink-0 overflow-hidden ${
            isLogsCollapsed ? "h-[36px]" : "h-[250px]"
          }`}
        >
          {/* Console Top Bar */}
          <div
            onClick={() => setIsLogsCollapsed(!isLogsCollapsed)}
            className="flex h-9 items-center justify-between bg-[#151516] px-4 border-b border-white/5 cursor-pointer hover:bg-[#1a1a1c] select-none shrink-0"
          >
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-300 font-mono tracking-wider">
                CONSOLE LOGS
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearLogs();
                }}
                className="ml-4 text-[10px] font-sans font-medium text-zinc-500 hover:text-zinc-300 bg-zinc-800/40 border border-zinc-700/30 px-2 py-0.5 rounded transition-all"
              >
                Dismiss all
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Warnings Badge */}
              <div
                className="flex items-center gap-1.5 text-xs text-amber-500/90 font-mono font-semibold"
                title="Warnings"
              >
                <AlertTriangle size={12} />
                <span>{warnCount}</span>
              </div>

              {/* Errors Badge */}
              <div
                className="flex items-center gap-1.5 text-xs text-red-500/90 font-mono font-semibold"
                title="Errors"
              >
                <AlertCircle size={12} />
                <span>{errorCount}</span>
              </div>

              {/* Toggle Chevron */}
              <div className="text-zinc-500 ml-1">
                {isLogsCollapsed ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </div>
            </div>
          </div>

          {/* Console Output Block */}
          {!isLogsCollapsed && (
            <div className="flex-1 overflow-auto bg-black p-4 font-mono text-xs select-text leading-relaxed custom-scrollbar relative">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 italic text-[11px]">
                  No console logs generated.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {logs.map((log, index) => {
                    const parsed = parseLogLine(log);
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 border-b border-zinc-950/20 pb-0.5 last:border-0 group relative hover:bg-zinc-900/40 px-1 rounded transition-colors"
                      >
                        {/* Tag Pill Grid Label */}
                        <div className="w-[100px] shrink-0 select-none">
                          {parsed.type === "error" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/10 block text-center">
                              Error
                            </span>
                          )}
                          {parsed.type === "rejection" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase bg-pink-500/10 text-pink-400 border border-pink-500/15 block text-center leading-tight">
                              Rejection
                            </span>
                          )}
                          {parsed.type === "debug" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase bg-zinc-850 text-zinc-400 border border-zinc-700/50 block text-center">
                              Debug
                            </span>
                          )}
                          {parsed.type === "build" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/10 block text-center">
                              Build
                            </span>
                          )}
                          {parsed.type === "log" && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/10 block text-center">
                              Log
                            </span>
                          )}
                        </div>
                        {/* Message */}
                        <div
                          className={`flex-1 pr-12 whitespace-pre-wrap font-mono text-[11px] select-text break-words ${
                            parsed.type === "error" ||
                            parsed.type === "rejection"
                              ? "text-red-400/90"
                              : parsed.type === "build"
                                ? "text-teal-400/90"
                                : parsed.type === "debug"
                                  ? "text-zinc-500"
                                  : "text-zinc-300"
                          }`}
                        >
                          {parsed.message}
                        </div>

                        {/* Hover Copy Button */}
                        <div className="absolute right-2 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(parsed.message);
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 text-zinc-400 hover:text-white p-1 rounded transition-all cursor-pointer shadow"
                            title="Copy log line message"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

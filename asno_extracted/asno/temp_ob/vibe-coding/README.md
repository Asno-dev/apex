# AI Studio

A Vite + React app builder with a visible autonomous ReAct agent, code editing, live preview, Office artifacts, and version history.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Copy the example environment file and add the API keys you want to use:

```bash
cp .env.example .env
```

Supported app settings include:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

The in-app settings panel also lets you store provider keys in local browser storage.

## Autonomous Agent

The primary agent runs a bounded ReAct loop over controlled workspace tools:

- Think and plan with short public summaries
- Act through code updates, verification, and OfficeCLI artifact tools
- Observe results and repair when needed
- Report what changed and what to check next

The agent does not get arbitrary host-shell control. It works inside the app workspace, generated project files, connected tools, and app-managed artifacts.

## Office Artifacts

Word, Excel, and PowerPoint generation is powered by [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI). The app checks whether `officecli` is available and shows install guidance when it is missing.

Windows PowerShell install command:

```powershell
irm https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.ps1 | iex
```

Generated `.docx`, `.xlsx`, and `.pptx` files are stored under `.artifacts/`, ignored by Git, and shown in the Artifacts tab with preview/download actions.

## Scripts

- `npm run dev` - start the Express/Vite development server
- `npm run build` - build the frontend
- `npm run preview` - preview a production build
- `npm run lint` - run TypeScript checks

## Project Structure

```text
├── server.ts              # Express API + Vite middleware
├── src/
│   ├── App.tsx            # Main React app
│   ├── components/        # UI and agent components
│   ├── lib/               # Shared helpers and API clients
│   └── store/             # Zustand app state
└── package.json
```

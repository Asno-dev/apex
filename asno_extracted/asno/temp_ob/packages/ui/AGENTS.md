# OpenCodeAgent: Architecture and Capabilities Report

This document outlines the architecture, features, and capabilities of the AI agents running within the OpenCodeAgent ecosystem, detailing how they interact with codebases, the file system, and virtualized computing environments.

## 1. System Architecture

OpenCodeAgent utilizes a distributed, containerized microservices architecture (managed via `docker-compose.yml`) to separate the AI reasoning layer from the execution environments.

- **Agent Engine (`packages/agent`)**: A NestJS service that acts as the core "brain". It interfaces with LLMs (OpenAI, Anthropic) and orchestrates tools.
- **Computer Node (`packages/computer`)**: A headless, high-performance Ubuntu-based sandbox environment (allocating up to 8 CPUs and 8GB RAM) built for executing code, compiling, and running web servers.
- **Desktop Node (`packages/desktop`)**: A graphical virtual environment running an X11 server and VNC, enabling "Computer Use" capabilities (vision, mouse, keyboard).
- **UI Dashboard (`packages/ui`)**: The Next.js frontend that provides the unified interface (Terminal, Code Editor, Search, System Stats) to the user.

---

## 2. Agent Engine & Features

The Agent Engine (`packages/agent/src/tasks/ai.service.ts`) orchestrates tasks by evaluating user requests against a suite of tools. 

### Core Intelligence
- **Multi-Model Support**: Capable of utilizing OpenAI models (via function calling) and Anthropic models (for Computer Use and reasoning).
- **Task Management**: Queues and processes tasks, dispatching specific commands to either the headless computer node or the graphical desktop node based on the requirement.

### Agent Toolset
The agent is equipped with tools specifically designed to map to the endpoints exposed by the execution nodes:
- `desktop_action`: A unified tool allowing the AI to pass commands to the graphical environment.
- Code Editing & Terminal execution actions (handled dynamically via the computer node's API).

---

## 3. How the Agent Accesses and Modifies the Codebase (Vite, React, Next.js)

The agent does **not** rely on standard human IDEs to write code. Instead, it interacts directly with the high-performance **Computer Node** via a REST API and WebSockets.

### File System Access (`packages/computer/src/filesystem`)
The computer node exposes a comprehensive file system REST API that acts as the agent's "Code Editor":
- **Directory Traversal (`GET /fs/tree`)**: The agent retrieves recursive file tree structures to understand the project layout.
- **Deep Search (`GET /fs/search`)**: Allows the agent to grep through files, searching both filenames and code content for specific strings across the entire workspace.
- **File Read/Write (`GET /fs/read`, `POST /fs/write`)**: The agent can read existing code (e.g., `page.tsx`, `vite.config.js`) and overwrite files with newly generated code. It supports both UTF-8 text and binary formats (images, etc.).
- **Operations**: Create directories (`/fs/mkdir`) and delete files (`/fs/delete`).

### Terminal Access (`packages/computer/src/terminal`)
- **WebSocket PTY**: The agent connects to virtual pseudo-terminals (PTYs). 
- **Executing Frameworks**: To build a React/Vite app or a full-stack Next.js app, the agent opens a terminal session and runs commands natively in the sandbox:
  ```bash
  npx create-next-app@latest my-app
  npm install
  npm run dev
  ```
- Port mapping (e.g., `3002:3002` in Docker) ensures that the Next.js/Vite development server running in the sandbox is accessible to the agent (via localhost requests) and to the user via the browser.

---

## 4. How the Agent Interacts with the Virtual Desktop & Computer

For tasks that require visual feedback or interaction with standard graphical applications (like browser testing, QA, or using GUI apps), the agent utilizes the **Desktop Node**.

### "Computer Use" API (`packages/desktop/computer-agent.js`)
The Desktop node exposes a `/computer-use` API. This allows the AI agent to mimic human interaction on a virtual screen:
- **Vision (`screenshot`)**: The agent executes a screenshot command (`import -window root`) and receives a base64 encoded image back. It feeds this image to vision models (like Claude 3.5 Sonnet) to analyze the screen state.
- **Mouse Control (`xdotool`)**: By analyzing coordinates on the screenshot, the agent can issue commands to:
  - `move_mouse` to specific X, Y coordinates.
  - `click_mouse` (Left, Right, Middle), `double_click`, and `drag`.
  - `scroll` up or down.
- **Keyboard Input**: The agent can send raw keystrokes to the OS:
  - `type_text`: For typing URLs or code into a visible GUI window.
  - `type_keys` / `key_combo`: For issuing shortcuts like `ctrl+c`, `alt+f2`, `Enter`.
- **Application Launching (`open_app`)**: The agent can programmatically launch software pre-installed in the X11 environment:
  - Browsers: `firefox`, `chrome`
  - Editors: `vscode`, `mousepad`, `gedit`
  - Office suites: `libreoffice`

### Workflow Example: End-to-End Web App Development
1. **Scaffold**: The agent uses the Terminal API on the Computer Node to run `npm create vite@latest`.
2. **Code**: It uses the Filesystem API to write React components to `/workspace/src/App.jsx`.
3. **Run**: It uses the Terminal API to run `npm run dev`.
4. **Test (Visual)**: It asks the Desktop Node to `open_app` (Chrome) and navigate to `http://computer:3002`.
5. **Verify**: It takes a `screenshot` from the Desktop Node to visually verify the Vite app rendered correctly.

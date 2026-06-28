export const defaultProjectFiles = {
  '/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  '/src/main.tsx': `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
  '/src/store/dbStore.ts': `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface DBState {
  tasks: Task[];
  addTask: (title: string, category: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useDBStore = create<DBState>()(
  persist(
    (set) => ({
      tasks: [
        { id: "1", title: "Verify WebAssembly sandboxed Node VM", category: "Backend", status: "completed", createdAt: new Date().toISOString() },
        { id: "2", title: "Mount Vite lightweight workspace", category: "Workspace", status: "completed", createdAt: new Date().toISOString() },
        { id: "3", title: "Deploy Zustand persistent stores", category: "Database", status: "pending", createdAt: new Date().toISOString() }
      ],
      addTask: (title, category) => set((state) => ({
        tasks: [
          {
            id: Math.random().toString(36).substring(2, 9),
            title,
            category,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          ...state.tasks
        ]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }))
    }),
    {
      name: 'vibe_fast_db_tasks',
    }
  )
);`,
  '/src/App.tsx': `import React, { useState, useEffect } from 'react';
import { useDBStore } from './store/dbStore';
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';

export default function App() {
  const { tasks, addTask, updateTask, deleteTask } = useDBStore();
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle, category);
    setNewTitle('');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-zinc-500 font-mono text-xs">
        <Loader2 className="animate-spin mr-2" size={14} />
        Loading persistent database...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white relative pb-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/85 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">Vite React Workspace</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">STATE MANAGEMENT // ZUSTAND PERSISTED</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 relative z-10">
        <div className="text-center space-y-3 max-w-xl mx-auto py-6">
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-semibold uppercase px-2.5 py-1 rounded-full tracking-wider">
            Zustand Store Active
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Vibe Coding Sandbox
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your local storage database is integrated. Add tasks below, refresh the page, and observe how Zustand preserves the data across resets!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-[#0e0e11] border border-zinc-900/40 rounded-2xl p-5">
              <h3 className="font-semibold text-white text-sm mb-4">Add New Record</h3>
              <form onSubmit={handleAddTask} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Task title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-2 text-xs text-zinc-300 cursor-pointer outline-none focus:border-indigo-500/30"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Local Database Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-555 text-zinc-500">No tasks in your database. Add some using the form!</p>
            ) : (
              <div className="divide-y divide-zinc-900">
                {tasks.map((task) => (
                  <div key={task.id} className="py-3 flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                        className="text-zinc-500 hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <span className={\`text-sm truncate \${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-200'}\`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                        {task.category}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}`,
  '/package.json': `{
  "name": "vibe-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "vite": "^5.4.11",
    "@vitejs/plugin-react": "^4.3.3"
  }
}`
};

export const defaultNextJsProjectFiles = {
  '/app/layout.tsx': `import "./globals.css";
import React from "react";

export const metadata = {
  title: "Next.js Fullstack Portal",
  description: "Next.js lightweight, browser-safe fullstack template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#09090b] text-zinc-100 min-h-screen selection:bg-indigo-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}`,
  '/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #09090b;
}

pre, code {
  font-family: 'JetBrains Mono', monospace;
}`,
  '/app/page.tsx': `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [user, setUser] = useState<any>({ email: 'guest@example.com', role: 'Developer', isLoggedIn: true });

  useEffect(() => {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleAuth = () => {
    if (user.isLoggedIn) {
      const loggedOut = { email: '', role: '', isLoggedIn: false };
      setUser(loggedOut);
      localStorage.setItem('user_session', JSON.stringify(loggedOut));
    } else {
      const loggedIn = { email: 'guest@example.com', role: 'Developer', isLoggedIn: true };
      setUser(loggedIn);
      localStorage.setItem('user_session', JSON.stringify(loggedIn));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/85 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">Next.js Fullstack Engine</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">PORT 3000 // LIGHT WEIGHT MODE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-zinc-900/60 border border-zinc-855 text-xs text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono">NodeVM: Active</span>
          </div>

          <div className="flex items-center gap-3">
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5">
                <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shadow-md shadow-indigo-600/20 text-white">
                  G
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-medium text-zinc-300 leading-none">{user.email}</p>
                  <p className="text-[9px] text-indigo-400 font-mono leading-none mt-1">{user.role}</p>
                </div>
                <button
                  onClick={toggleAuth}
                  className="ml-2 text-zinc-300 text-[10px] font-semibold tracking-wider font-mono uppercase bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded transition-all hover:bg-zinc-900 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={toggleAuth}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-505 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col justify-center items-center text-center gap-6 relative z-10">
        <div className="mx-auto w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
          <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="space-y-3 max-w-xl">
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-semibold uppercase px-2.5 py-1 rounded-full tracking-wider">
            Fullstack Prebuilt Environment Ready
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Lightweight Next.js Architecture
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your workspace is pre-initialized with all directories and configurations: direct isomorphic state management, custom database sync, and beautiful, responsive UI. Fast compilation, zero native driver compilation lags!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            Enter Dashboard Sandbox
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 px-5 py-3 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
          >
            Access Login Gateway
          </Link>
        </div>

        <div className="w-full max-w-lg mt-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 text-left text-xs space-y-4">
          <p className="font-semibold text-white flex items-center gap-2 border-b border-zinc-850 pb-2">
            <span>⚙️ Initialized Project Packages</span>
          </p>
          <div className="grid grid-cols-2 gap-3 text-zinc-400 font-mono">
            <div>🚀 Next.js 14 App Router</div>
            <div>⚡ Light-speed Boots</div>
            <div>💾 LocalStorage Sync Cache</div>
            <div>☁️ Firebase/Supabase Ready</div>
            <div>🎨 Tailwind + CSS variables</div>
            <div>🤖 Type-safe Zod + Hook Forms</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-[11px] text-zinc-555 text-zinc-500 font-mono relative z-10 w-full">
        Fast-Boot-Sandbox Session
      </footer>
    </div>
  );
}`,
  '/app/(auth)/login/page.tsx': `'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    const session = { email: data.email, role: 'Developer', isLoggedIn: true };
    localStorage.setItem('user_session', JSON.stringify(session));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-850 p-6 rounded-2xl shadow-xl space-y-6 relative z-10">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Sign In</h2>
          <p className="text-xs text-zinc-400 mt-1">Access Next.js fullstack portal</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Email</label>
            <input
              type="email"
              defaultValue="guest@example.com"
              {...register('email')}
              className="w-full bg-zinc-950 border border-zinc-855 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            {errors.email?.message && (
              <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Password</label>
            <input
              type="password"
              defaultValue="password123"
              {...register('password')}
              className="w-full bg-zinc-950 border border-zinc-855 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            {errors.password?.message && (
              <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold transition-all font-mono cursor-pointer"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-[11px] text-zinc-500">
          Don't have an account? <Link href="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}`,
  '/app/(auth)/register/page.tsx': `'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validations';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    const session = { email: data.email, role: 'Developer', isLoggedIn: true };
    localStorage.setItem('user_session', JSON.stringify(session));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-955 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-850 p-6 rounded-2xl shadow-xl space-y-6 relative z-10">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-zinc-400 mt-1">Get started with fullstack engine</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full bg-zinc-955 border border-zinc-850 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            {errors.name?.message && (
              <p className="text-[10px] text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-zinc-955 border border-zinc-850 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            {errors.email?.message && (
              <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-zinc-955 border border-zinc-850 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            {errors.password?.message && (
              <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all font-mono cursor-pointer"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-[11px] text-zinc-500">
          Already have an account? <Link href="/login" className="text-indigo-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}`,
  '/app/(dashboard)/layout.tsx': `import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 flex-1 relative overflow-auto">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}`,
  '/app/(dashboard)/dashboard/page.tsx': `'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useDBStore } from '@/lib/store';

export default function DashboardPage() {
  const { tasks, addTask, updateTask, deleteTask } = useDBStore();
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [mounted, setMounted] = useState(false);

  // Hydration guard to avoid SSR mismatch with localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle, category);
    setNewTitle('');
  };

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 italic text-xs font-mono">
        <Loader2 className="animate-spin mr-2" size={14} />
        Connecting to virtual database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fullstack Metrics</h1>
          <p className="text-zinc-400 text-xs mt-1">Lightweight state engine persisted in browser sandbox localStorage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4">
          <p className="text-xs font-mono text-zinc-500 uppercase">Database Tasks</p>
          <p className="text-3xl font-bold text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4">
          <p className="text-xs font-mono text-zinc-500 uppercase">Completed</p>
          <p className="text-3xl font-bold text-indigo-400 mt-1">
            {tasks.filter((t: any) => t.status === 'completed').length}
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-4">
          <p className="text-xs font-mono text-zinc-500 uppercase">Pending</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">
            {tasks.filter((t: any) => t.status === 'pending').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0e0e11] border border-zinc-900/40 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Create SQL Row</h3>
            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-2 text-xs text-zinc-300 cursor-pointer outline-none focus:border-indigo-500/30"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="API Route">API Route</option>
                  <option value="Auth">Auth</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Active Database Records</h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-zinc-500">No rows in tasks table. Add some tasks using the form!</p>
          ) : (
            <div className="divide-y divide-zinc-900">
              {tasks.map((task: any) => (
                <div key={task.id} className="py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                      className="text-zinc-500 hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span className={\`text-sm truncate \${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-200'}\`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                      {task.category}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`,
  '/app/api/[resource]/route.ts': `import { NextRequest, NextResponse } from "next/server";
import { LocalDB } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { resource: string } }
) {
  if (params.resource !== "tasks") {
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
  }

  try {
    const data = LocalDB.getTasks();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { resource: string } }
) {
  if (params.resource !== "tasks") {
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
    }

    const task = LocalDB.addTask(parsed.data.title, parsed.data.category);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`,
  '/app/api/[resource]/[id]/route.ts': `import { NextRequest, NextResponse } from "next/server";
import { LocalDB } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { resource: string, id: string } }
) {
  if (params.resource !== "tasks") {
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
  }

  try {
    const tasks = LocalDB.getTasks();
    const task = tasks.find(t => t.id === params.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { resource: string, id: string } }
) {
  if (params.resource !== "tasks") {
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = taskSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
    }

    const task = LocalDB.updateTask(params.id, parsed.data);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { resource: string, id: string } }
) {
  if (params.resource !== "tasks") {
    return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
  }

  try {
    const success = LocalDB.deleteTask(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`,
  '/components/layout/Navbar.tsx': `import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 w-full">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          </div>
        </div>
        <span className="font-semibold tracking-wide text-zinc-100 font-sans text-sm">NextJS Fullstack Portal</span>
      </div>
      <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
        <Link href="/" className="hover:text-zinc-100 transition-colors">Home</Link>
        <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">Dashboard</Link>
        <Link href="/login" className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-505 transition-all font-semibold">Sign In</Link>
      </div>
    </nav>
  );
}`,
  '/components/layout/Sidebar.tsx': `import Link from 'next/link';
import React from 'react';
import { LayoutDashboard, CheckSquare, Settings, User } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-950 bg-zinc-900/10 min-h-screen hidden md:block shrink-0 p-4">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Navigator</p>
        </div>
        <div className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900/50 rounded-lg group transition-colors">
            <LayoutDashboard className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900/50 rounded-lg group transition-colors">
            <CheckSquare className="w-4 h-4 text-zinc-505 group-hover:text-indigo-400" />
            <span>My Tasks</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900/50 rounded-lg group transition-colors">
            <User className="w-4 h-4 text-zinc-555 text-zinc-500 group-hover:text-indigo-400" />
            <span>User Profile</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900/50 rounded-lg group transition-colors">
            <Settings className="w-4 h-4 text-zinc-555 text-zinc-500 group-hover:text-indigo-400" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}`,
  '/components/layout/Footer.tsx': `import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500 font-mono w-full">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>&copy; {new Date().getFullYear()} Next.js Prebuilt Fullstack. All ...</span>
        <span>Fast Sandbox Runtime</span>
      </div>
    </footer>
  );
}`,
  '/lib/db.ts': `export interface Task {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

const PERSIST_KEY = "next_fast_db_tasks";

const initialTasks: Task[] = [
  { id: "1", title: "Verify WebAssembly sandboxed Node VM", category: "Backend", status: "completed", createdAt: new Date().toISOString() },
  { id: "2", title: "Mount next.js lightweight workspace", category: "Workspace", status: "completed", createdAt: new Date().toISOString() },
  { id: "3", title: "Deploy reactive agents to prompt box", category: "AI Swarm", status: "pending", createdAt: new Date().toISOString() }
];

let cachedTasks: Task[] | null = null;

function getCachedTasks(): Task[] {
  if (cachedTasks !== null) return cachedTasks;
  
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        cachedTasks = JSON.parse(stored);
        return cachedTasks!;
      }
    } catch(e) {}
  }
  
  cachedTasks = [...initialTasks];
  return cachedTasks;
}

function saveCachedTasks(tasks: Task[]) {
  cachedTasks = tasks;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(tasks));
    } catch(e) {}
  }
}

export class LocalDB {
  static getTasks(): Task[] {
    return getCachedTasks();
  }

  static addTask(title: string, category: string): Task {
    const tasks = getCachedTasks();
    const task: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      category,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(task);
    saveCachedTasks(tasks);
    return task;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = getCachedTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    tasks[index] = { ...tasks[index], ...updates };
    saveCachedTasks(tasks);
    return tasks[index];
  }

  static deleteTask(id: string): boolean {
    const tasks = getCachedTasks();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    saveCachedTasks(filtered);
    return true;
  }
}`,
  '/lib/store.ts': `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface DBState {
  tasks: Task[];
  addTask: (title: string, category: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useDBStore = create<DBState>()(
  persist(
    (set) => ({
      tasks: [
        { id: "1", title: "Verify WebAssembly sandboxed Node VM", category: "Backend", status: "completed", createdAt: new Date().toISOString() },
        { id: "2", title: "Mount next.js lightweight workspace", category: "Workspace", status: "completed", createdAt: new Date().toISOString() },
        { id: "3", title: "Deploy reactive agents to prompt box", category: "AI Swarm", status: "pending", createdAt: new Date().toISOString() }
      ],
      addTask: (title, category) => set((state) => ({
        tasks: [
          {
            id: Math.random().toString(36).substring(2, 9),
            title,
            category,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          ...state.tasks
        ]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }))
    }),
    {
      name: 'next_fast_db_tasks',
    }
  )
);`,
  '/lib/validations.ts': `import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["pending", "completed"]).default("pending"),
});`,
  '/lib/utils.ts': `import { clsx, type ClassValue } from "clsx";
import { tailwindMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return tailwindMerge(clsx(inputs));
}`,
  '/hooks/useFeature.ts': `import { useState, useEffect } from 'react';

export function useFeature() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
  }, []);

  return { active };
}`,
  '/.env.local': `NEXT_PUBLIC_APP_URL="http://localhost:3000"`,
  '/tailwind.config.ts': `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
};
export default config;`,
  '/types/index.ts': `export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
}`,
  '/package.json': `{
  "name": "vibe-next-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "14.2.15",
    "@next/swc-wasm-nodejs": "14.2.15",
    "lucide-react": "^0.468.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "framer-motion": "^11.0.8",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.12.7",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3"
  }
}`,
  '/postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
  '/next.config.mjs': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
};

export default nextConfig;`,
  '/tsconfig.json': `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`
};

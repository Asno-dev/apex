import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        { id: '1', role: 'assistant', content: 'Hello! I am Bud. How can I help you today?', timestamp: Date.now() }
      ],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, id: Math.random().toString(36).substring(7), timestamp: Date.now() },
          ],
        })),
      clearChat: () => set({ messages: [] }),
    }),
    { name: 'chat-storage' }
  )
);
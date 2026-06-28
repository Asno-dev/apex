import { useState, useRef, KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="relative flex items-center">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full resize-none rounded-lg border bg-transparent p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="absolute right-2 p-2 text-primary hover:bg-muted rounded-md disabled:opacity-50"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
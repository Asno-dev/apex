import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn("flex w-full gap-4 p-4", isAssistant ? "bg-muted/50" : "bg-background")}>
      <div className={cn("flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow", isAssistant ? "bg-primary text-primary-foreground" : "bg-background")}>
        {isAssistant ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="leading-7 text-sm">{message.content}</p>
      </div>
    </div>
  );
}
import { SSEEvent, TodoItem, ActionStep, ThoughtBlock, BudMessage } from './types';

const COMPUTER_URL = process.env.NEXT_PUBLIC_COMPUTER_URL || 'http://localhost:4000';

/**
 * Send a task to the Bud agent backend and stream responses via SSE.
 * Transforms raw SSE events into structured BudMessage with to-do items.
 */
export async function executeTask(
  task: string,
  apiKey: string,
  provider: string,
  model: string,
  onUpdate: (message: BudMessage) => void,
  onError: (error: string) => void,
): Promise<void> {
  const messageId = `bud-${Date.now()}`;
  let currentTodoIndex = -1;
  let todoCounter = 0;

  const message: BudMessage = {
    id: messageId,
    type: 'assistant',
    content: '',
    timestamp: Date.now(),
    titleSummary: `Working on: ${task}`,
    todos: [],
    isStreaming: true,
    iteration: 0,
    maxIterations: 100,
  };

  // Helper to create a new to-do
  const createTodo = (title: string): TodoItem => {
    todoCounter++;
    return {
      id: `todo-${todoCounter}`,
      title,
      status: 'pending',
      thoughts: [],
      actions: [],
      isExpanded: true,
    };
  };

  // Helper to get or create current to-do
  const getCurrentTodo = (fallbackTitle?: string): TodoItem => {
    if (currentTodoIndex < 0 || currentTodoIndex >= (message.todos?.length || 0)) {
      const todo = createTodo(fallbackTitle || 'Processing...');
      message.todos = [...(message.todos || []), todo];
      currentTodoIndex = message.todos.length - 1;
    }
    return message.todos![currentTodoIndex];
  };

  try {
    const response = await fetch(`${COMPUTER_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, apiKey, provider, model }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(`Server error ${response.status}: ${errorText}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event: SSEEvent = JSON.parse(jsonStr);
          processEvent(event, message, getCurrentTodo, createTodo, () => currentTodoIndex, (i: number) => { currentTodoIndex = i; });
          onUpdate({ ...message, todos: [...(message.todos || [])] });
        } catch (parseErr) {
          // Skip malformed SSE data
        }
      }
    }

    // Mark as complete
    message.isStreaming = false;
    onUpdate({ ...message });
  } catch (err: any) {
    onError(err.message || 'Connection failed');
    message.isStreaming = false;
    onUpdate({ ...message });
  }
}

function processEvent(
  event: SSEEvent,
  message: BudMessage,
  getCurrentTodo: (title?: string) => TodoItem,
  createTodo: (title: string) => TodoItem,
  getTodoIndex: () => number,
  setTodoIndex: (i: number) => void,
) {
  switch (event.type) {
    case 'thinking': {
      const todo = getCurrentTodo('Analyzing the task');
      todo.status = 'thinking';
      if (event.message?.trim()) {
        todo.thoughts.push({
          id: `thought-${Date.now()}`,
          content: event.message.trim(),
          timestamp: Date.now(),
        });
      }
      break;
    }

    case 'planning': {
      const iteration = event.iteration || 0;
      message.iteration = iteration;

      if (iteration > 1) {
        // Complete previous to-do and start a new one
        const prevTodo = message.todos?.[getTodoIndex()];
        if (prevTodo && prevTodo.status !== 'completed') {
          prevTodo.status = 'completed';
          prevTodo.isExpanded = false;
        }
        const newTodo = createTodo(event.message || `Step ${iteration}`);
        newTodo.status = 'thinking';
        message.todos = [...(message.todos || []), newTodo];
        setTodoIndex(message.todos.length - 1);
      } else {
        const todo = getCurrentTodo(event.message || 'Planning approach');
        todo.status = 'thinking';
        todo.title = event.message || todo.title;
      }
      break;
    }

    case 'tool_start': {
      const todo = getCurrentTodo(event.label || 'Executing');
      todo.status = 'in-progress';

      const action: ActionStep = {
        id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tool: event.tool || 'unknown',
        label: event.label || event.tool || 'Action',
        status: 'active',
        input: event.input,
        timestamp: Date.now(),
      };

      // Detect file operations
      if (event.tool === 'file_write' || event.tool === 'file_read' || event.tool === 'file_list') {
        const filePath = event.input || '';
        action.file = {
          path: filePath,
          action: event.tool === 'file_write' ? 'created' : event.tool === 'file_read' ? 'read' : 'read',
          additions: 0,
          deletions: 0,
        };
      }

      todo.actions.push(action);
      break;
    }

    case 'tool_result': {
      const todo = getCurrentTodo();
      const lastAction = todo.actions[todo.actions.length - 1];
      if (lastAction) {
        lastAction.status = event.success ? 'completed' : 'error';
        lastAction.output = typeof event.output === 'string' ? event.output : JSON.stringify(event.output);

        // Calculate diff stats for file operations
        if (lastAction.file && lastAction.output) {
          const lines = lastAction.output.split('\n').length;
          if (lastAction.file.action === 'created' || lastAction.file.action === 'edited') {
            lastAction.file.additions = lines;
            lastAction.file.content = lastAction.output;
          }
        }
      }
      break;
    }

    case 'done': {
      // Complete the current to-do
      const todo = message.todos?.[getTodoIndex()];
      if (todo) {
        todo.status = 'completed';
        todo.isExpanded = false;
      }
      message.summary = event.message || 'Task completed.';
      message.isStreaming = false;
      break;
    }

    case 'error': {
      const todo = getCurrentTodo('Error occurred');
      todo.status = 'error';
      todo.actions.push({
        id: `error-${Date.now()}`,
        tool: 'error',
        label: event.message || 'An error occurred',
        status: 'error',
        timestamp: Date.now(),
      });
      break;
    }
  }
}

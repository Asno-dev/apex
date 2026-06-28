import { useEffect, useRef } from 'react';
import { Terminal, Code, FileText, Globe, CheckCircle, XCircle, Loader2, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { useComputerStore, type ExecutionStep } from '../../store/useComputerStore';
import { useState } from 'react';

function getStepIcon(step: ExecutionStep) {
  switch (step.type) {
    case 'thinking': return <Zap size={12} className="text-purple-400" />;
    case 'planning': return <Zap size={12} className="text-indigo-400" />;
    case 'tool_start': {
      if (step.tool?.includes('shell') || step.tool?.includes('python') || step.tool?.includes('node'))
        return <Terminal size={12} className="text-emerald-400" />;
      if (step.tool?.includes('file'))
        return <FileText size={12} className="text-amber-400" />;
      if (step.tool?.includes('browser') || step.tool?.includes('http'))
        return <Globe size={12} className="text-blue-400" />;
      return <Code size={12} className="text-cyan-400" />;
    }
    case 'tool_result':
      return step.success !== false ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />;
    case 'error': return <XCircle size={12} className="text-red-400" />;
    case 'done': return <CheckCircle size={12} className="text-emerald-400" />;
    default: return <Loader2 size={12} className="text-gray-500 animate-spin" />;
  }
}

function getStepColor(step: ExecutionStep) {
  switch (step.type) {
    case 'thinking': case 'planning': return 'border-l-indigo-500/30';
    case 'tool_start': return 'border-l-cyan-500/30';
    case 'tool_result': return step.success !== false ? 'border-l-emerald-500/30' : 'border-l-red-500/30';
    case 'error': return 'border-l-red-500/30';
    case 'done': return 'border-l-emerald-500/30';
    default: return 'border-l-gray-500/30';
  }
}

function StepItem({ step }: { step: ExecutionStep }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOutput = step.output && step.output.length > 0;
  const hasScreenshot = !!step.screenshot;

  return (
    <div className={`border-l-2 ${getStepColor(step)} pl-3 py-1.5 animate-slide-up`}>
      <button onClick={() => (hasOutput || hasScreenshot) && setIsExpanded(!isExpanded)} className="flex items-start gap-2 w-full text-left group">
        <div className="mt-0.5 shrink-0">{getStepIcon(step)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-gray-300 leading-relaxed">
            {step.label || step.message || step.tool || step.type}
          </div>
          {step.input && step.type === 'tool_start' && (
            <div className="text-[10px] text-gray-600 font-mono truncate mt-0.5">{step.input.slice(0, 100)}</div>
          )}
          {step.iteration && (
            <div className="text-[9px] text-gray-700 mt-0.5">iteration {step.iteration}</div>
          )}
        </div>
        {(hasOutput || hasScreenshot) && (
          <div className="shrink-0 mt-0.5">
            {isExpanded ? <ChevronDown size={10} className="text-gray-600" /> : <ChevronRight size={10} className="text-gray-600" />}
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="mt-1.5 ml-5">
          {hasOutput && (
            <pre className="text-[10px] text-gray-500 font-mono bg-white/3 rounded-md p-2 max-h-40 overflow-auto whitespace-pre-wrap leading-relaxed border border-white/5">
              {step.output!.slice(0, 3000)}
              {step.output!.length > 3000 && '\n... [truncated]'}
            </pre>
          )}
          {hasScreenshot && (
            <img src={`data:image/png;base64,${step.screenshot}`} alt="Screenshot" className="mt-1 max-w-full rounded-md border border-white/10" />
          )}
        </div>
      )}
    </div>
  );
}

export function ComputerExecutionLog() {
  const { executionSteps, isExecuting, clearExecutionSteps } = useComputerStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [executionSteps.length]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Execution Log</span>
          {isExecuting && <Loader2 size={10} className="text-indigo-400 animate-spin" />}
        </div>
        {executionSteps.length > 0 && (
          <button onClick={clearExecutionSteps} className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors">
            Clear
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {executionSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-3">
              <img src="/bud-logo.svg" alt="Bud Logo" className="w-5 h-5 opacity-40 hover:opacity-75 transition-opacity" />
            </div>
            <div className="text-[11px] text-gray-600">No execution history</div>
            <div className="text-[10px] text-gray-700 mt-1">Send a task to see agent actions here</div>
          </div>
        ) : (
          executionSteps.map(step => <StepItem key={step.id} step={step} />)
        )}
      </div>

      {executionSteps.length > 0 && (
        <div className="border-t border-white/5 px-3 py-1.5 shrink-0">
          <div className="text-[10px] text-gray-600">
            {executionSteps.length} steps
            {isExecuting && ' • Running...'}
            {!isExecuting && executionSteps.some(s => s.type === 'done') && ' • Complete'}
          </div>
        </div>
      )}
    </div>
  );
}

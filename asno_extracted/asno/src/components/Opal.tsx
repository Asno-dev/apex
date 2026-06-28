import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { callAiAPI } from '../lib/aiClient';
import { 
  Sparkles, X, Sliders, Play, Plus, Trash2, Cpu, FileText, ArrowRight,
  RefreshCw, CheckCircle, HelpCircle, Layers, Settings, Terminal, Layout
} from 'lucide-react';

interface OpalNode {
  id: string;
  type: 'input' | 'prompt' | 'llm' | 'output';
  title: string;
  x: number;
  y: number;
  value: string; // user input, prompt text, or generated response
  placeholder?: string;
}

export const Opal: React.FC = () => {
  const { setOpalOpen, customAlert } = useApp() as any;
  
  const [nodes, setNodes] = useState<OpalNode[]>([
    { id: 'in-1', type: 'input', title: 'User Query Input', x: 40, y: 150, value: 'Write a haiku about programming in React.', placeholder: 'Enter prompt input...' },
    { id: 'pr-1', type: 'prompt', title: 'System Prompt Template', x: 260, y: 150, value: 'You are a poetic coding assistant. Respond in clear lines.', placeholder: 'System guidelines...' },
    { id: 'llm-1', type: 'llm', title: 'Gemini 1.5 Flash Engine', x: 480, y: 150, value: 'Model: gemini-1.5-flash' },
    { id: 'out-1', type: 'output', title: 'Application Output Window', x: 700, y: 150, value: '', placeholder: 'AI output will appear here...' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const addNode = (type: OpalNode['type']) => {
    const nodeTitles = {
      input: 'User Input',
      prompt: 'System Prompt',
      llm: 'AI Engine',
      output: 'Output Console'
    };
    const nextX = nodes.length * 150 + 50;
    const newNode: OpalNode = {
      id: `node-${Math.random().toString(36).substring(2, 9)}`,
      type,
      title: nodeTitles[type],
      x: nextX < 850 ? nextX : 300,
      y: 200,
      value: '',
      placeholder: type === 'llm' ? 'Model configuration...' : 'Type settings or content...'
    };
    setNodes(prev => [...prev, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateNodeValue = (id: string, value: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, value } : n));
  };

  const handleRunWorkflow = async () => {
    const inputNode = nodes.find(n => n.type === 'input');
    const promptNode = nodes.find(n => n.type === 'prompt');
    const outputNode = nodes.find(n => n.type === 'output');
    
    if (!inputNode || !outputNode) {
      customAlert?.('Your workflow must contain at least one User Query Input and one Application Output Window node.', 'Workflow Invalid');
      return;
    }

    setIsRunning(true);
    try {
      const userMessage = inputNode.value;
      const systemInstruction = promptNode?.value || 'You are an advanced workflow helper.';
      
      const reply = await callAiAPI(
        userMessage,
        [],
        'gemini',
        'gemini-1.5-flash',
        localStorage.getItem('ai_studio_key_gemini') || 'temporary',
        systemInstruction
      );
      
      // Update output node with the actual response
      setNodes(prev => prev.map(n => n.type === 'output' ? { ...n, value: reply } : n));
      customAlert?.('🎉 AI Workflow run completed successfully!', 'Workflow Success');
    } catch (e: any) {
      console.error(e);
      customAlert?.(`Workflow run failed: ${e.message || String(e)}`, 'Workflow Error');
    } finally {
      setIsRunning(false);
    }
  };

  const loadSampleApp = (preset: 'haiku' | 'translator' | 'summarizer') => {
    if (preset === 'haiku') {
      setNodes([
        { id: 'in-1', type: 'input', title: 'User Query Input', x: 40, y: 150, value: 'A stormy sunset over clean code', placeholder: 'Enter prompt input...' },
        { id: 'pr-1', type: 'prompt', title: 'System Prompt Template', x: 260, y: 150, value: 'You are a Zen master. Write a beautiful 3-line haiku based on the input.', placeholder: 'System guidelines...' },
        { id: 'llm-1', type: 'llm', title: 'Gemini 1.5 Flash Engine', x: 480, y: 150, value: 'Model: gemini-1.5-flash' },
        { id: 'out-1', type: 'output', title: 'Application Output Window', x: 700, y: 150, value: '', placeholder: 'AI output will appear here...' },
      ]);
    } else if (preset === 'translator') {
      setNodes([
        { id: 'in-1', type: 'input', title: 'English Input Text', x: 40, y: 150, value: 'Good morning! Let\'s build something beautiful today.', placeholder: 'Text to translate...' },
        { id: 'pr-1', type: 'prompt', title: 'French Translator instruction', x: 260, y: 150, value: 'Translate the English input text into elegant French. Output ONLY the translation.', placeholder: 'System guidelines...' },
        { id: 'llm-1', type: 'llm', title: 'Gemini 1.5 Flash Engine', x: 480, y: 150, value: 'Model: gemini-1.5-flash' },
        { id: 'out-1', type: 'output', title: 'French Output Console', x: 700, y: 150, value: '', placeholder: 'French text output...' },
      ]);
    } else if (preset === 'summarizer') {
      setNodes([
        { id: 'in-1', type: 'input', title: 'Long Text Passage', x: 40, y: 150, value: 'React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies. React can be used as a base in the development of single-page, mobile, or server-rendered applications with frameworks like Next.js.', placeholder: 'Paste text to summarize...' },
        { id: 'pr-1', type: 'prompt', title: 'Bullet Summarizer Instruction', x: 260, y: 150, value: 'Summarize the input passage into 3 concise key bullet points.', placeholder: 'System guidelines...' },
        { id: 'llm-1', type: 'llm', title: 'Gemini 1.5 Flash Engine', x: 480, y: 150, value: 'Model: gemini-1.5-flash' },
        { id: 'out-1', type: 'output', title: 'Key Takeaways Window', x: 700, y: 150, value: '', placeholder: 'AI bullets summary...' },
      ]);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="full-page-tool-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={16} color="white" />
          </div>
          <div>
            <h2 className="heading-font" style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Google Opal
              <span className="premium-tool-badge" style={{ fontSize: '10px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 6px', borderRadius: '20px' }}>AI App Builder</span>
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chain AI nodes, format inputs, and design visual mini-apps without code</span>
          </div>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select 
            onChange={(e) => loadSampleApp(e.target.value as any)}
            style={{ padding: '6px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">-- Load Preset App --</option>
            <option value="haiku">Zen Haiku Generator</option>
            <option value="translator">English-to-French Translator</option>
            <option value="summarizer">Smart Bullets Summarizer</option>
          </select>

          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white',
              fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
            }}
          >
            {isRunning ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
            Run Workflow App
          </button>

          <button onClick={() => setOpalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }} className="hover-bg">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Left Toolbar */}
        <div style={{ width: '220px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ADD NODE BLOCKS</span>
          <button onClick={() => addNode('input')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }} className="hover-border">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
            User Query Input
          </button>
          <button onClick={() => addNode('prompt')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }} className="hover-border">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            System Prompt Template
          </button>
          <button onClick={() => addNode('llm')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }} className="hover-border">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1' }} />
            Gemini AI Engine
          </button>
          <button onClick={() => addNode('output')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }} className="hover-border">
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ec4899' }} />
            Output Window
          </button>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <strong>How it works</strong>: Input feeds into Prompt, Prompt configures LLM, and LLM displays output. Connect inputs by running the app pipeline!
          </span>
        </div>

        {/* Node Canvas Area */}
        <div style={{ flexGrow: 1, position: 'relative', overflow: 'auto', background: 'var(--bg-primary)', padding: '40px' }}>
          
          {/* Draggable grid background representation */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4 }} />

          {/* Node objects map */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            {nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <React.Fragment key={node.id}>
                  {index > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', margin: '0 -10px' }}>
                      <ArrowRight size={16} />
                    </div>
                  )}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      width: '200px', borderRadius: '12px', border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)', overflow: 'hidden', boxShadow: isSelected ? '0 8px 24px rgba(99,102,241,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s', cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      padding: '8px 12px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{node.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }} className="hover-color">
                        <X size={12} />
                      </button>
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {node.type === 'llm' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.06)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.15)' }}>
                          <Cpu size={14} style={{ color: '#6366f1' }} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{node.value}</span>
                        </div>
                      ) : (
                        <textarea
                          value={node.value}
                          onChange={(e) => updateNodeValue(node.id, e.target.value)}
                          placeholder={node.placeholder}
                          style={{
                            width: '100%', height: '80px', border: '1px solid var(--border-color)',
                            borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            padding: '6px 8px', fontSize: '11px', outline: 'none', resize: 'none', lineHeight: '1.4'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {nodes.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Layout size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div style={{ fontSize: '13px' }}>Node canvas is empty. Add blocks from the left sidebar to build your app!</div>
            </div>
          )}
        </div>

        {/* Right side configuration inspector */}
        <div style={{ width: '280px', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
          <h4 className="heading-font" style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Node Inspector</h4>
          
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>NODE TYPE</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{selectedNode.type}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Rename Title</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={e => {
                    const t = e.target.value;
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, title: t } : n));
                  }}
                  className="search-input"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '12px' }}
                />
              </div>

              {selectedNode.type !== 'llm' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Edit Content Value</label>
                  <textarea
                    value={selectedNode.value}
                    onChange={e => updateNodeValue(selectedNode.id, e.target.value)}
                    style={{ width: '100%', height: '140px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '11px', lineHeight: '1.4' }}
                  />
                </div>
              )}
              
              <button
                onClick={() => deleteNode(selectedNode.id)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                className="hover-bg"
              >
                <Trash2 size={12} />
                Delete Node Block
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <HelpCircle size={20} style={{ opacity: 0.3, marginBottom: '6px', margin: '0 auto' }} />
              <div>Select a node on the canvas to inspect and configure its attributes.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Opal;

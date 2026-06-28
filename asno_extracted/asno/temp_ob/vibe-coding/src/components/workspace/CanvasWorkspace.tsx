import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  ReactFlowProvider,
  NodeResizer,
  Panel,
  BackgroundVariant,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FileText, Image as ImageIcon, Link as LinkIcon, Code, Video, Music, FileSpreadsheet, Bot, Send, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateChatResponse } from '../../lib/gemini';
import ReactMarkdown from 'react-markdown';

// Custom Node types

const BlockNode = ({ data, id, selected }: { data: any, id: string, selected?: boolean }) => {
  const [content, setContent] = useState(data.content || '');

  const renderContent = () => {
    switch (data.type) {
      case 'text':
        return (
          <textarea
            className="w-full h-full min-h-[60px] bg-transparent border-none outline-none resize-none text-gray-200 text-sm nodrag"
            value={content}
            onChange={(e) => { setContent(e.target.value); data.content = e.target.value; }}
            placeholder="Type something..."
          />
        );
      case 'image':
        return <img src={content} alt="Block" className="w-full h-auto rounded" draggable={false} />;
      case 'code':
        return (
          <textarea
            className="w-full h-full min-h-[100px] bg-black/50 font-mono text-gray-300 text-xs p-2 rounded border border-white/10 outline-none resize-none nodrag"
            value={content}
            onChange={(e) => { setContent(e.target.value); data.content = e.target.value; }}
          />
        );
      case 'file':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={24} className="text-gray-400 shrink-0" />
            <span className="truncate text-sm text-gray-200">{data.fileName || 'Document'}</span>
          </div>
        );
      case 'link':
        return (
          <a href={content} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline truncate block">
            {content || 'Empty Link'}
          </a>
        );
      case 'ai':
        return (
          <div className="flex flex-col gap-2 relative">
             <div className="text-xs text-indigo-300 font-medium flex items-center gap-1 mb-1">
                <Bot size={14} /> Agent
             </div>
             <div className="text-sm text-gray-200 max-h-[200px] overflow-auto nodrag p-1">
                <ReactMarkdown>{content || 'I can see everything linked to me. Ask me something.'}</ReactMarkdown>
             </div>
             <div className="flex mt-2">
               <input
                 type="text"
                 className="flex-1 bg-black/40 border border-white/10 rounded-l p-1.5 text-xs text-white outline-none nodrag"
                 placeholder="Ask agent..."
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                      data.onAsk(id, e.currentTarget.value);
                      e.currentTarget.value = '';
                   }
                 }}
               />
               <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-r border border-indigo-600" title="Send">
                 <Send size={14} />
               </button>
             </div>
          </div>
        );
      default:
        return <div className="text-sm text-gray-300">{content}</div>;
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case 'text': return <FileText size={12} />;
      case 'image': return <ImageIcon size={12} />;
      case 'code': return <Code size={12} />;
      case 'file': return <FileSpreadsheet size={12} />;
      case 'link': return <LinkIcon size={12} />;
      case 'ai': return <Bot size={12} />;
      default: return <FileText size={12} />;
    }
  };

  return (
    <div className={`relative w-full h-full min-w-[200px] min-h-[50px] shadow-2xl rounded-xl border ${data.type === 'ai' ? 'border-indigo-500/50 bg-indigo-900/20' : 'border-white/10 bg-[#1e1e1e]'} backdrop-blur-md transition-all group flex flex-col`}>
      <NodeResizer minWidth={200} minHeight={50} isVisible={selected} handleClassName="w-2 h-2 bg-indigo-500 border-none rounded-sm" lineClassName="border-indigo-500/50" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500 border-2 border-[#1e1e1e]" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500 border-2 border-[#1e1e1e]" id="left" />
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <button onClick={() => data.onDelete(id)} className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40">
           <Trash2 size={12} />
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-2 text-gray-500">
           {getIcon()}
           <span className="text-[10px] uppercase font-bold tracking-wider">{data.type}</span>
        </div>
        {renderContent()}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500 border-2 border-[#1e1e1e]" id="right" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-2 border-[#1e1e1e]" />
    </div>
  );
};

const nodeTypes = {
  customBlock: BlockNode,
};

const CoordinateDisplay = () => {
  const { x, y, zoom } = useViewport();
  return (
    <Panel position="bottom-left" className="bg-[#1e1e1e] border border-white/10 px-2 py-1 flex gap-3 text-[10px] text-gray-500 rounded-md font-mono mb-[60px] md:mb-0">
      <span>X: {Math.round(x)}</span>
      <span>Y: {Math.round(y)}</span>
      <span>{Math.round(zoom * 100)}%</span>
    </Panel>
  );
};

function CanvasWorkspaceContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const { addAgentEvent } = useStore();

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  // AI ask function tracking connected nodes and calling Gemini
  const askAgent = useCallback(async (agentNodeId: string, question: string) => {
     // Find edges connected to this AI node (agentNodeId is target or source)
     const connectedEdges = edges.filter(e => e.target === agentNodeId || e.source === agentNodeId);
     const connectedNodeIds = connectedEdges.map(e => e.source === agentNodeId ? e.target : e.source);
     const connectedNodes = nodes.filter(n => connectedNodeIds.includes(n.id));

     const contextData = connectedNodes.map(n => `Type: ${n.data.type}, Content: ${n.data.content}`).join('\n\n---BLOCK---\n\n');
     
     // Update agent node to "thinking..."
     setNodes((nds) => nds.map((n) => {
       if (n.id === agentNodeId) {
         return {
           ...n,
           data: { ...n.data, content: `🤔 Thinking about your question: "${question}"...\n\nAnalyzing ${connectedNodes.length} connected blocks...` }
         };
       }
       return n;
     }));

     try {
       const state = useStore.getState();
       const geminiKey = state.apiKeys['gemini'];
       
       const prompt = `You are an AI embedded in a visual infinite canvas. You are connected to ${connectedNodes.length} blocks.
User Question: "${question}"

Below is the context from the connected blocks:
${contextData ? contextData : 'No connected context.'}

Please answer the user's question concisely based on the context above. If you don't know or if it's not in the context, say so gracefully. Return markdown formatting for readability.`;

       const response = await generateChatResponse(prompt, geminiKey, 'gemini-3.5-flash');

       setNodes((nds) => nds.map((n) => {
         if (n.id === agentNodeId) {
           return {
             ...n,
             data: { 
               ...n.data, 
               content: `**Response:**\n\n${response}` 
             }
           };
         }
         return n;
       }));
     } catch (err: any) {
        setNodes((nds) => nds.map((n) => {
         if (n.id === agentNodeId) {
           return {
             ...n,
             data: { 
               ...n.data, 
               content: `**Error:** Failed to get response from Gemini.\n\n${err.message}` 
             }
           };
         }
         return n;
       }));
     }

  }, [edges, nodes, setNodes]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = wrapperRef.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Handle text drop
      const textData = event.dataTransfer.getData('text/plain');
      const htmlData = event.dataTransfer.getData('text/html');

      // Handle files
      const files = Array.from(event.dataTransfer.files);

      if (files.length > 0) {
        files.forEach((file, i) => {
          const filePos = { x: position.x + (i * 20), y: position.y + (i * 20) };
          const newNode: Node = {
            id: `node-${Date.now()}-${i}`,
            type: 'customBlock',
            position: filePos,
            data: { 
               fileName: file.name, 
               type: file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('text/') ? 'text' :
                     file.type.startsWith('video/') ? 'video' : 'file',
               content: '',
               onDelete: deleteNode
            },
          };

          // If image, create object URL
          if (file.type.startsWith('image/')) {
            newNode.data.content = URL.createObjectURL(file);
          } else {
             // For text files, read content
             if (file.type.startsWith('text/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                   setNodes((nds) => nds.map((n) => n.id === newNode.id ? { ...n, data: { ...n.data, content: e.target?.result as string } } : n));
                };
                reader.readAsText(file);
             }
          }

          setNodes((nds) => nds.concat(newNode));
        });
      } else if (textData) {
        // Determine if it's a URL or code snippet
        const isUrl = /^(https?:\/\/\S+)$/i.test(textData);
        let blockType = 'text';
        if (isUrl) blockType = 'link';
        else if (textData.includes('{') && textData.includes('}')) blockType = 'code';

        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: 'customBlock',
          position,
          data: { type: blockType, content: textData, onDelete: deleteNode },
        };
        setNodes((nds) => nds.concat(newNode));
      } else if (htmlData) {
         // Create generic block for dropped HTML
         const newNode: Node = {
          id: `node-${Date.now()}`,
          type: 'customBlock',
          position,
          data: { type: 'text', content: textData || 'Dropped Content', onDelete: deleteNode },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, deleteNode]
  );

  const addNodeFromMenu = (type: string) => {
     if (!reactFlowInstance) return;
     
     // Center of view
     const position = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

     const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'customBlock',
        position,
        data: { 
           type, 
           content: type === 'ai' ? 'I am an AI assistant block. Connect me to other blocks to give me context!' : '', 
           onDelete: deleteNode,
           onAsk: type === 'ai' ? askAgent : undefined
        },
      };
      setNodes((nds) => nds.concat(newNode));
  };


  return (
    <div className="flex-1 w-full h-full relative" ref={wrapperRef}>
       <div className="absolute top-4 left-4 z-10 flex gap-2">
         <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-1.5 shadow-2xl flex gap-1 items-center">
            <button onClick={() => addNodeFromMenu('text')} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Add Text Block">
               <FileText size={16} />
            </button>
            <button onClick={() => addNodeFromMenu('code')} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Add Code Block">
               <Code size={16} />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1"></div>
            <button onClick={() => addNodeFromMenu('ai')} className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5" title="Add Embedded AI Agent">
               <Bot size={16} />
               <span className="text-xs font-semibold pr-1">Add Agent Node</span>
            </button>
         </div>
       </div>

       <div className="absolute bottom-4 right-8 z-10">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-3 rounded-xl max-w-[280px] shadow-2xl">
              <h3 className="text-sm text-white font-semibold mb-1">Canvas Mode Tips</h3>
              <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                 <li>Drag &amp; drop files, images, or text anywhere</li>
                 <li>Connect blocks by dragging between the dots</li>
                 <li>Add an Agent block and connect it to your notes/files for context-aware answers</li>
              </ul>
          </div>
       </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.05}
        maxZoom={5}
        className="bg-[#0f0f11]"
      >
        <Panel position="top-center" className="bg-[#1e1e1e] border border-white/10 px-4 py-2 mt-4 flex items-center gap-3 rounded-xl shadow-2xl pointer-events-auto">
           <span className="text-xl">🎨</span>
           <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Visual Workspace</span>
              <span className="text-[10px] text-gray-400">Created Setup</span>
           </div>
        </Panel>
        <CoordinateDisplay />
        <Background variant={BackgroundVariant.Dots} color="rgba(255, 255, 255, 0.15)" gap={24} size={1} />
        <Controls className="bg-[#1e1e1e] border-white/10 fill-white text-white" />
        <MiniMap 
           nodeStrokeColor={(n) => {
             if (n.data?.type === 'ai') return '#6366f1';
             return '#333';
           }}
           nodeColor={(n) => {
             if (n.data?.type === 'ai') return '#4f46e5';
             return '#1e1e1e';
           }}
           maskColor="rgba(0, 0, 0, 0.7)"
           className="bg-[#1e1e1e] border border-white/10 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}

export function CanvasWorkspace() {
   return (
      <ReactFlowProvider>
         <CanvasWorkspaceContent />
      </ReactFlowProvider>
   );
}

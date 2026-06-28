import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { callAiAPI } from '../lib/aiClient';
import { 
  Sparkles, X, Play, Image as ImageIcon, Video, Compass, RefreshCw,
  Sliders, Film, Monitor, Tv, BookOpen, Layers, Send, ChevronRight
} from 'lucide-react';

interface StoryboardScene {
  number: number;
  title: string;
  description: string;
  camera: string;
  lighting: string;
  imagePrompt: string;
  bgColor: string; // generated visual thumbnail color gradient
}

export const GoogleFlow: React.FC = () => {
  const { setGoogleFlowOpen, customAlert } = useApp() as any;
  const [videoConcept, setVideoConcept] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number | null>(null);

  const handleGenerateStoryboard = async () => {
    if (!videoConcept.trim()) {
      customAlert?.('Please describe your video concept or cinematic story.', 'Input Required');
      return;
    }

    setIsGenerating(false);
    setIsGenerating(true);
    try {
      const systemPrompt = `You are Google Flow, an AI storyboard artist and cinematic director.
Generate a structured storyboard sequence of exactly 3 scenes based on the user's video concept.
Each scene must include:
- Scene title
- Story description
- Camera movement/angle configuration
- Lighting settings
- A detailed Image prompt (tailored for Google Imagen/Veo)

Respond ONLY with a valid JSON block containing an array of scenes matching this structure:
[
  {
    "number": 1,
    "title": "Scene Name",
    "description": "Visual actions, character actions and events in detail",
    "camera": "Camera shot details (e.g., Wide tracking shot, Close-up pan)",
    "lighting": "Lighting mood (e.g., Golden hour sunlight, Neon backlight)",
    "imagePrompt": "Detailed scene prompt for AI image generators"
  }
]`;
      
      const reply = await callAiAPI(
        videoConcept,
        [],
        'gemini',
        'gemini-1.5-flash',
        localStorage.getItem('ai_studio_key_gemini') || 'temporary',
        systemPrompt
      );
      
      const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      const presetGradients = [
        'linear-gradient(135deg, #1f4068 0%, #162447 100%)',
        'linear-gradient(135deg, #f07b3f 0%, #ea5455 100%)',
        'linear-gradient(135deg, #480032 0%, #df0054 100%)',
        'linear-gradient(135deg, #0575e6 0%, #00f2fe 100%)'
      ];
      
      const formatted: StoryboardScene[] = parsed.map((item: any, idx: number) => ({
        ...item,
        bgColor: presetGradients[idx % presetGradients.length]
      }));
      
      setScenes(formatted);
      setActiveSceneIdx(0);
    } catch (e: any) {
      console.error(e);
      customAlert?.(`Failed to generate storyboard: ${e.message || String(e)}`, 'Storyboard Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedScene = activeSceneIdx !== null ? scenes[activeSceneIdx] : null;

  return (
    <div className="full-page-tool-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #ff3366, #ff007f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film size={16} color="white" />
          </div>
          <div>
            <h2 className="heading-font" style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Google Flow
              <span className="premium-tool-badge" style={{ fontSize: '10px', background: 'rgba(255,0,127,0.1)', color: '#ff007f', border: '1px solid rgba(255,0,127,0.2)', padding: '2px 6px', borderRadius: '20px' }}>AI Video Studio</span>
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Map out cinematic storyboards, camera actions, and prompts powered by Google Veo & Imagen</span>
          </div>
        </div>
        <button onClick={() => setGoogleFlowOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }} className="hover-bg">
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left concept settings panel */}
        <div style={{ width: '340px', borderRight: '1px solid var(--border-color)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <h3 className="heading-font" style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
            <Video size={16} style={{ color: 'var(--accent-color)' }} />
            Cinematic Board
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Cinematic Video Description</label>
            <textarea
              placeholder="Describe your film scene or commercial. E.g. A futuristic astronaut walking through a neon rainforest, discovering a glowing crystal artifact."
              value={videoConcept}
              onChange={e => setVideoConcept(e.target.value)}
              style={{ width: '100%', flexGrow: 1, minHeight: '180px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '13px', lineHeight: '1.5' }}
            />
          </div>

          <button 
            onClick={handleGenerateStoryboard}
            disabled={isGenerating}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff3366, #ff007f)', color: 'white',
              fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(255,0,127,0.25)', transition: 'all 0.2s'
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Drawing Storyboards...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate Storyboard
              </>
            )}
          </button>
        </div>

        {/* Right workspace panels */}
        <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', background: 'var(--bg-primary)' }}>
          {scenes.length > 0 ? (
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              
              {/* Storyboard timeline grid */}
              <div style={{ width: '380px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>STORYBOARD PANELS</span>
                {scenes.map((scene, idx) => {
                  const isActive = activeSceneIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSceneIdx(idx)}
                      style={{
                        display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', border: isActive ? '1.5px solid #ff007f' : '1px solid var(--border-color)',
                        background: isActive ? 'rgba(255,0,127,0.03)' : 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {/* Visual placeholder color box representing canvas rendering */}
                      <div style={{ width: '70px', height: '84px', borderRadius: '8px', background: scene.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '9px', fontWeight: 700, color: '#fff', opacity: 0.8 }}>#{scene.number}</span>
                        <ImageIcon size={16} color="white" style={{ opacity: 0.7 }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>SCENE {scene.number}</span>
                          <h4 style={{ margin: '2px 0 0 0', fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scene.title}</h4>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>🎥 {scene.camera.split(' ')[0]} ...</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Storyboard active detail preview panel */}
              {selectedScene && (
                <div style={{ flexGrow: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff007f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scene {selectedScene.number} Detail Overview</span>
                      <h1 className="heading-font" style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedScene.title}</h1>
                    </div>
                  </div>

                  {/* Scene mockup thumbnail */}
                  <div 
                    style={{
                      height: '240px', width: '100%', borderRadius: '16px', background: selectedScene.bgColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
                      <Video size={14} />
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>Google Flow Playback Stage</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={18} color="white" />
                      </div>
                      <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>Preview Scene {selectedScene.number}</span>
                    </div>

                    {/* Blurry circles for cinematic depth */}
                    <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255, 0, 127, 0.4)', filter: 'blur(80px)', top: '-20px', right: '-40px' }} />
                    <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.3)', filter: 'blur(60px)', bottom: '-20px', left: '-20px' }} />
                  </div>

                  {/* Scene Info cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>🎥 CAMERA CONFIGURATION</span>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{selectedScene.camera}</p>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>💡 LIGHTING SETUP</span>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{selectedScene.lighting}</p>
                    </div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>📝 SCENE ACTIONS & DIALOGUE</span>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{selectedScene.description}</p>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,0,127,0.03)', border: '1px solid rgba(255,0,127,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>🤖 AI IMAGE GENERATION PROMPT</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedScene.imagePrompt);
                          customAlert?.('Prompt copied to clipboard!');
                        }}
                        style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Copy Prompt
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>"{selectedScene.imagePrompt}"</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,51,102,0.1), rgba(255,0,127,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Film size={36} style={{ color: '#ff007f' }} />
              </div>
              <h2 className="heading-font" style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Google Flow Storyboard Setup</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '460px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                Enter your film idea, script concept, or commercial story in the left panel and click "Generate Storyboard". Google Flow will map out professional storyboard panels with director specifications!
              </p>
              <button 
                onClick={() => setVideoConcept('A futuristic cyberpunk traveler arriving at a neon city-gate on a levitating bike, greeted by an AI holographic guard.')}
                className="cover-btn"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Load Sample Concept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleFlow;

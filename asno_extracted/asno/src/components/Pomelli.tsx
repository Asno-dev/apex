import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { callAiAPI } from '../lib/aiClient';
import { 
  Sparkles, Wrench, ShieldAlert, X, Sliders, Play, Save, Copy, 
  Trash2, Globe, Heart, Megaphone, FileText, Image as ImageIcon,
  Check, Palette, HelpCircle, RefreshCw, Send, CheckCircle2, ChevronRight
} from 'lucide-react';

interface BrandDNA {
  name: string;
  slogan: string;
  colors: string[];
  tone: string;
  audience: string;
  values: string[];
  summary: string;
}

interface CampaignAsset {
  id: string;
  type: 'ad' | 'social' | 'email' | 'slogan';
  platform: string;
  title: string;
  content: string;
  imageUrl?: string;
}

export const Pomelli: React.FC = () => {
  const { setPomelliOpen, customAlert } = useApp() as any;
  const [businessInput, setBusinessInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isGeneratingDNA, setIsGeneratingDNA] = useState(false);
  
  const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
  const [activeTab, setActiveTab] = useState<'dna' | 'campaigns' | 'scenes'>('dna');
  
  // Campaigns generation
  const [campaignTopic, setCampaignTopic] = useState('Product Launch');
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [assets, setAssets] = useState<CampaignAsset[]>([]);
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);
  
  // Product scenes
  const [selectedScene, setSelectedScene] = useState('minimalist');
  const [sceneText, setSceneText] = useState('Unlock Your True Potential');
  const [sceneBg, setSceneBg] = useState('linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)');
  
  const handleGenerateDNA = async () => {
    if (!businessInput.trim() && !websiteUrl.trim()) {
      customAlert?.('Please describe your business or provide a website URL.', 'Input Required');
      return;
    }
    
    setIsGeneratingDNA(true);
    try {
      const systemPrompt = `You are Google Labs Pomelli, an AI brand specialist.
Based on the user's business description or URL, establish a detailed "Business DNA" profile.
Respond ONLY with a valid JSON block containing the following structure:
{
  "name": "Short Brand Name",
  "slogan": "A catchy, short, and memorable slogan",
  "colors": ["HexColor1", "HexColor2", "HexColor3"],
  "tone": "Descriptive tone (e.g. Modern & Minimalist, Warm & Caring)",
  "audience": "Primary target audience description",
  "values": ["Value 1", "Value 2", "Value 3"],
  "summary": "A 2-3 sentence branding summary"
}`;
      
      const prompt = `Business URL: ${websiteUrl}\nDescription:\n${businessInput}`;
      
      // Use the helper model, fallback is configured inside callAiAPI
      const reply = await callAiAPI(prompt, [], 'gemini', 'gemini-1.5-flash', localStorage.getItem('ai_studio_key_gemini') || 'temporary', systemPrompt);
      
      // Extract JSON content from potential Markdown block
      const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setBrandDNA(parsed);
      setActiveTab('dna');
    } catch (e: any) {
      console.error(e);
      customAlert?.(`Failed to generate Brand DNA: ${e.message || String(e)}`, 'Branding Setup Error');
    } finally {
      setIsGeneratingDNA(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!brandDNA) return;
    
    setIsGeneratingCampaign(true);
    try {
      const systemPrompt = `You are Google Labs Pomelli. Generate 4 creative marketing campaign assets for the brand based on its DNA.
The assets must cover:
1. Social Media Post (Instagram/LinkedIn)
2. Search Engine Ad (Google Ads copy)
3. Direct Email Newsletter draft
4. Creative Slogans/Headlines

Respond ONLY with a valid JSON block containing an array of assets:
[
  {
    "type": "social",
    "platform": "Instagram/LinkedIn",
    "title": "Campaign Post Title",
    "content": "Full post content including copy and hashtags"
  },
  {
    "type": "ad",
    "platform": "Google Search Ad",
    "title": "Ad Copy",
    "content": "Headline 1 | Headline 2\\nDescription line of the search ad"
  },
  {
    "type": "email",
    "platform": "Email Newsletter",
    "title": "Monthly Digest / Promo",
    "content": "Subject: [Subject Line]\\n\\nDear [Customer],\\n\\n[Email Body copy]"
  },
  {
    "type": "slogan",
    "platform": "Billboard / Banner Headline",
    "title": "Hero Copy Ideas",
    "content": "1. Slogan idea 1\\n2. Slogan idea 2\\n3. Slogan idea 3"
  }
]`;
      
      const prompt = `Brand DNA:
Name: ${brandDNA.name}
Slogan: ${brandDNA.slogan}
Tone: ${brandDNA.tone}
Audience: ${brandDNA.audience}
Campaign Topic: ${campaignTopic}`;
      
      const reply = await callAiAPI(prompt, [], 'gemini', 'gemini-1.5-flash', localStorage.getItem('ai_studio_key_gemini') || 'temporary', systemPrompt);
      const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      const formatted = parsed.map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substring(2, 9)
      }));
      
      setAssets(formatted);
    } catch (e: any) {
      console.error(e);
      customAlert?.(`Failed to generate campaign assets: ${e.message || String(e)}`, 'Campaign Setup Error');
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  const copyAsset = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAssetId(id);
    setTimeout(() => setCopiedAssetId(null), 1500);
  };

  const scenesList = [
    { id: 'minimalist', name: 'Minimalist Studio', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { id: 'sunset', name: 'Golden Hour Sunset', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'forest', name: 'Emerald Forest Walk', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
    { id: 'cyber', name: 'Neon Cyberpunk Grid', bg: 'linear-gradient(135deg, #2e0854 0%, #051622 100%)' },
    { id: 'neutral', name: 'Clean Organic Sand', bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }
  ];

  return (
    <div className="full-page-tool-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #f5af19, #f12711)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={16} color="white" />
          </div>
          <div>
            <h2 className="heading-font" style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Google Labs Pomelli
              <span className="premium-tool-badge" style={{ fontSize: '10px', background: 'rgba(241,39,17,0.1)', color: '#f12711', border: '1px solid rgba(241,39,17,0.2)', padding: '2px 6px', borderRadius: '20px' }}>AI Marketing Studio</span>
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Analyze business profiles and instantly generate custom-tailored campaign assets</span>
          </div>
        </div>
        <button onClick={() => setPomelliOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }} className="hover-bg">
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left branding setup panel */}
        <div style={{ width: '340px', borderRight: '1px solid var(--border-color)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <h3 className="heading-font" style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
            <Palette size={16} style={{ color: 'var(--accent-color)' }} />
            Branding Workspace
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Business Website URL</label>
            <input 
              type="text" 
              placeholder="e.g. www.designstudio.com" 
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="search-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Describe Business / Concept</label>
            <textarea
              placeholder="What do you build or sell? E.g. A local organic coffee shop sourcing beans directly from fair-trade farmers in South America, serving artisanal pastries."
              value={businessInput}
              onChange={e => setBusinessInput(e.target.value)}
              style={{ width: '100%', flexGrow: 1, minHeight: '160px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '13px', lineHeight: '1.5' }}
            />
          </div>

          <button 
            onClick={handleGenerateDNA}
            disabled={isGeneratingDNA}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #f5af19, #f12711)', color: 'white',
              fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(241,39,17,0.25)', transition: 'all 0.2s'
            }}
          >
            {isGeneratingDNA ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Analyzing Business DNA...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Establish Brand DNA
              </>
            )}
          </button>
        </div>

        {/* Right workspace/preview pane */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
          {brandDNA ? (
            <>
              {/* Tab menu */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '0 20px', flexShrink: 0 }}>
                <button 
                  onClick={() => setActiveTab('dna')} 
                  className={`tab-btn ${activeTab === 'dna' ? 'active' : ''}`}
                  style={{ padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, borderBottom: activeTab === 'dna' ? '2px solid #f12711' : '2px solid transparent', color: activeTab === 'dna' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  🧬 Brand DNA Profile
                </button>
                <button 
                  onClick={() => setActiveTab('campaigns')} 
                  className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
                  style={{ padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, borderBottom: activeTab === 'campaigns' ? '2px solid #f12711' : '2px solid transparent', color: activeTab === 'campaigns' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  📢 Marketing Campaigns
                </button>
                <button 
                  onClick={() => setActiveTab('scenes')} 
                  className={`tab-btn ${activeTab === 'scenes' ? 'active' : ''}`}
                  style={{ padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, borderBottom: activeTab === 'scenes' ? '2px solid #f12711' : '2px solid transparent', color: activeTab === 'scenes' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  🖼️ Visual Scene Mockup
                </button>
              </div>

              {/* Tab Content */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '30px' }}>
                {activeTab === 'dna' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <h1 className="heading-font" style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{brandDNA.name}</h1>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {brandDNA.colors.map((color, idx) => (
                          <div key={idx} style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: color, border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }} title={color} />
                        ))}
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--text-muted)', margin: 0 }}>"{brandDNA.slogan}"</p>
                    
                    <div style={{ padding: '18px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeft: '4px solid #f12711' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#f12711', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Brand Strategy</span>
                      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{brandDNA.summary}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>🎯 TARGET AUDIENCE</span>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{brandDNA.audience}</p>
                      </div>
                      
                      <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>🗣️ BRAND TONE</span>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{brandDNA.tone}</p>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '12px', color: 'var(--text-primary)' }}>✨ BRAND VALUES & CORE OBJECTIVES</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {brandDNA.values.map((v, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(241,39,17,0.06)', border: '1px solid rgba(241,39,17,0.15)', color: 'var(--text-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                            <CheckCircle2 size={12} style={{ color: '#f12711' }} />
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'campaigns' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Campaign Focus / Core Offering</label>
                        <input 
                          type="text" 
                          value={campaignTopic}
                          onChange={e => setCampaignTopic(e.target.value)}
                          placeholder="e.g. Summer discount, New subscription service"
                          className="search-input"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                      <button 
                        onClick={handleGenerateCampaign}
                        disabled={isGeneratingCampaign}
                        style={{ padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isGeneratingCampaign ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            Writing Campaign...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Generate Campaigns
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {assets.map(asset => (
                        <div key={asset.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)' }}>
                            <span style={{ fontWeight: 700, fontSize: '12px', color: '#f12711', textTransform: 'uppercase' }}>
                              {asset.type === 'social' ? '📱 Social post' : asset.type === 'ad' ? '🔍 Google ad' : asset.type === 'email' ? '📧 Email Promo' : '📢 Taglines'}
                            </span>
                            <button 
                              onClick={() => copyAsset(asset.id, asset.content)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}
                              className="hover-color"
                            >
                              {copiedAssetId === asset.id ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                              {copiedAssetId === asset.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div style={{ padding: '18px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{asset.title}</h4>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', flexGrow: 1 }}>{asset.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {assets.length === 0 && (
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          <Megaphone size={28} style={{ opacity: 0.3, marginBottom: '10px' }} />
                          <div>No campaign materials generated yet. Click "Generate Campaigns" to create copies.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'scenes' && (
                  <div style={{ display: 'flex', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
                    {/* Scene configurations */}
                    <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>SELECT BACKGROUND STAGE</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {scenesList.map(scene => (
                          <button
                            key={scene.id}
                            onClick={() => {
                              setSelectedScene(scene.id);
                              setSceneBg(scene.bg);
                            }}
                            style={{
                              textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                              border: selectedScene === scene.id ? '1px solid #f12711' : '1px solid var(--border-color)',
                              background: selectedScene === scene.id ? 'rgba(241,39,17,0.04)' : 'var(--bg-secondary)',
                              cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)'
                            }}
                          >
                            {scene.name}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Hero Statement Override</label>
                        <input 
                          type="text" 
                          value={sceneText}
                          onChange={e => setSceneText(e.target.value)}
                          className="search-input"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Stage Preview */}
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE CAMPAIGN STAGE PREVIEW</span>
                      <div 
                        style={{
                          height: '340px', width: '100%', borderRadius: '16px', background: sceneBg,
                          position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: brandDNA.colors[0] }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: selectedScene === 'cyber' ? '#fff' : '#0f172a' }}>{brandDNA.name.toUpperCase()}</span>
                        </div>
                        
                        {/* Mock product box */}
                        <div 
                          style={{
                            width: '130px', height: '180px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 2
                          }}
                        >
                          <div style={{ fontSize: '9px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pomelli Scene</div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'white', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Sparkles size={14} style={{ color: brandDNA.colors[0] }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{brandDNA.name}</span>
                          </div>
                          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Artisanal Mockup</div>
                        </div>

                        {/* Blurred circles in background */}
                        <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', backgroundColor: brandDNA.colors[0], filter: 'blur(60px)', opacity: 0.5, top: '20px', left: '40px' }} />
                        <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: brandDNA.colors[1] || brandDNA.colors[0], filter: 'blur(50px)', opacity: 0.4, bottom: '20px', right: '40px' }} />

                        {/* Title text overlay */}
                        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', zIndex: 3 }}>
                          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: selectedScene === 'cyber' ? '#fff' : '#0f172a', textShadow: '0 2px 4px rgba(255,255,255,0.2)', width: '70%', lineHeight: '1.2' }}>
                            {sceneText}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'linear-gradient(135deg, rgba(245,175,25,0.1), rgba(241,39,17,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Megaphone size={36} style={{ color: '#f12711' }} />
              </div>
              <h2 className="heading-font" style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Pomelli AI Brand Setup</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '460px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                Type your company name and details in the left panel, and click "Establish Brand DNA". Pomelli will instantly extract campaign templates and marketing assets tailored to your brand!
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {
                    setWebsiteUrl('www.stitchcraft.com');
                    setBusinessInput('Handcrafted leather goods and premium travel bags, designed for modern adventurers. Focus on durability, timeless style, and sustainable materials.');
                  }}
                  className="cover-btn"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  Load Sample Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pomelli;

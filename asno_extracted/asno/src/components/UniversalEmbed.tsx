import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Block } from '../types';
import { Globe, ExternalLink, X } from 'lucide-react';

// Embed App Registry: maps block type → embed metadata
const EMBED_REGISTRY: Record<string, { name: string; color: string; icon: string; placeholder: string; transform: (url: string) => string }> = {
  'twitter': { name: 'X / Twitter', color: '#000', icon: '𝕏', placeholder: 'Paste tweet URL (e.g. https://twitter.com/user/status/...)', transform: (url) => `https://platform.twitter.com/embed/Tweet.html?url=${encodeURIComponent(url)}` },
  'spotify': { name: 'Spotify', color: '#1DB954', icon: '🎵', placeholder: 'Paste Spotify track/album/playlist URL...', transform: (url) => { const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/); return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0` : url; } },
  'soundcloud': { name: 'SoundCloud', color: '#ff5500', icon: '🔊', placeholder: 'Paste SoundCloud track URL...', transform: (url) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&visual=true` },
  'codepen': { name: 'CodePen', color: '#000', icon: '⌨️', placeholder: 'Paste CodePen pen URL...', transform: (url) => url.replace('/pen/', '/embed/') + '?default-tab=result' },
  'codesandbox': { name: 'CodeSandbox', color: '#151515', icon: '📦', placeholder: 'Paste CodeSandbox URL...', transform: (url) => { const match = url.match(/codesandbox\.io\/(?:s|p)\/([a-zA-Z0-9-]+)/); return match ? `https://codesandbox.io/embed/${match[1]}?fontsize=14&hidenavigation=1` : url; } },
  'replit': { name: 'Replit', color: '#F26207', icon: '💻', placeholder: 'Paste Replit URL...', transform: (url) => url.includes('?embed=true') ? url : url + '?embed=true' },
  'excalidraw': { name: 'Excalidraw', color: '#6965db', icon: '✏️', placeholder: 'Paste Excalidraw URL...', transform: (url) => url },
  'miro': { name: 'Miro', color: '#050038', icon: '🖼️', placeholder: 'Paste Miro board URL...', transform: (url) => { const match = url.match(/miro\.com\/app\/board\/([a-zA-Z0-9_=]+)/); return match ? `https://miro.com/app/embed/${match[1]}` : url; } },
  'canva': { name: 'Canva', color: '#00C4CC', icon: '🎨', placeholder: 'Paste Canva design URL...', transform: (url) => url.replace('/design/', '/embed/') },
  'typeform': { name: 'Typeform', color: '#262627', icon: '📝', placeholder: 'Paste Typeform URL...', transform: (url) => url },
  'calendly': { name: 'Calendly', color: '#006BFF', icon: '📅', placeholder: 'Paste Calendly link...', transform: (url) => url },
  'google-sheets': { name: 'Google Sheets', color: '#0F9D58', icon: '📊', placeholder: 'Paste Google Sheets URL...', transform: (url) => url.replace(/\/edit.*$/, '/htmlembed') },
  'google-slides': { name: 'Google Slides', color: '#F4B400', icon: '📽️', placeholder: 'Paste Google Slides URL...', transform: (url) => url.replace('/pub', '/embed').replace('/edit', '/embed') },
  'google-forms': { name: 'Google Forms', color: '#673AB7', icon: '📋', placeholder: 'Paste Google Forms URL...', transform: (url) => url.replace('/viewform', '/viewform?embedded=true') },
  'google-calendar': { name: 'Google Calendar', color: '#4285F4', icon: '📅', placeholder: 'Paste Google Calendar embed URL...', transform: (url) => url },
  'whimsical': { name: 'Whimsical', color: '#7B61FF', icon: '🧠', placeholder: 'Paste Whimsical URL...', transform: (url) => url.replace('/board/', '/embed/') },
  'lucidchart': { name: 'Lucidchart', color: '#F96B12', icon: '📐', placeholder: 'Paste Lucidchart URL...', transform: (url) => url },
  'pitch': { name: 'Pitch', color: '#73F5A1', icon: '📊', placeholder: 'Paste Pitch presentation URL...', transform: (url) => url.replace('/deck/', '/embed/') },
  'prezi': { name: 'Prezi', color: '#3181FF', icon: '🎬', placeholder: 'Paste Prezi URL...', transform: (url) => url.replace('/p/', '/embed/') },
  'vimeo': { name: 'Vimeo', color: '#1ab7ea', icon: '🎬', placeholder: 'Paste Vimeo URL...', transform: (url) => { const match = url.match(/vimeo\.com\/(\d+)/); return match ? `https://player.vimeo.com/video/${match[1]}` : url; } },
  'dailymotion': { name: 'Dailymotion', color: '#00d2f3', icon: '📺', placeholder: 'Paste Dailymotion URL...', transform: (url) => { const match = url.match(/video\/([a-z0-9]+)/i); return match ? `https://www.dailymotion.com/embed/video/${match[1]}` : url; } },
  'twitch': { name: 'Twitch', color: '#9146FF', icon: '🎮', placeholder: 'Paste Twitch channel or clip URL...', transform: (url) => { const match = url.match(/twitch\.tv\/(\w+)/); return match ? `https://player.twitch.tv/?channel=${match[1]}&parent=${window.location.hostname}` : url; } },
  'tiktok': { name: 'TikTok', color: '#010101', icon: '🎵', placeholder: 'Paste TikTok video URL...', transform: (url) => `https://www.tiktok.com/embed/v2/${url.split('/').pop()}` },
  'instagram': { name: 'Instagram', color: '#E1306C', icon: '📸', placeholder: 'Paste Instagram post URL...', transform: (url) => url.replace(/\/?$/, '/embed') },
  'pinterest': { name: 'Pinterest', color: '#E60023', icon: '📌', placeholder: 'Paste Pinterest pin URL...', transform: (url) => url },
  'linkedin': { name: 'LinkedIn', color: '#0A66C2', icon: '💼', placeholder: 'Paste LinkedIn post embed URL...', transform: (url) => url },
  'reddit': { name: 'Reddit', color: '#FF4500', icon: '🤖', placeholder: 'Paste Reddit post URL...', transform: (url) => url.replace(/\/?$/, '.embed') },
  'medium': { name: 'Medium', color: '#000', icon: '📖', placeholder: 'Paste Medium article URL...', transform: (url) => url },
  'substack': { name: 'Substack', color: '#FF6719', icon: '📰', placeholder: 'Paste Substack post URL...', transform: (url) => url },
  'gist': { name: 'GitHub Gist', color: '#24292e', icon: '📋', placeholder: 'Paste GitHub Gist URL...', transform: (url) => url + '.pibb' },
  'jsfiddle': { name: 'JSFiddle', color: '#4679A4', icon: '🎯', placeholder: 'Paste JSFiddle URL...', transform: (url) => url.replace(/\/?$/, '/embedded/result,js,html,css/') },
  'stackblitz': { name: 'StackBlitz', color: '#1389FD', icon: '⚡', placeholder: 'Paste StackBlitz URL...', transform: (url) => url.replace('edit', 'embed') },
  'observable': { name: 'Observable', color: '#25292e', icon: '📊', placeholder: 'Paste Observable notebook URL...', transform: (url) => url.replace('observablehq.com/', 'observablehq.com/embed/') },
  'desmos': { name: 'Desmos', color: '#2D70B3', icon: '📈', placeholder: 'Paste Desmos graph URL...', transform: (url) => { const match = url.match(/calculator\/([a-zA-Z0-9]+)/); return match ? `https://www.desmos.com/calculator/${match[1]}?embed` : url; } },
  'wolfram': { name: 'Wolfram Alpha', color: '#DD1100', icon: '🧮', placeholder: 'Paste Wolfram Alpha URL...', transform: (url) => url },
  'kaggle': { name: 'Kaggle', color: '#20BEFF', icon: '📊', placeholder: 'Paste Kaggle notebook URL...', transform: (url) => url.replace('/code/', '/embed/') },
  'streamlit': { name: 'Streamlit', color: '#FF4B4B', icon: '🌊', placeholder: 'Paste Streamlit app URL...', transform: (url) => url },
  'tableau': { name: 'Tableau', color: '#E97627', icon: '📊', placeholder: 'Paste Tableau public URL...', transform: (url) => url },
  'power-bi': { name: 'Power BI', color: '#F2C811', icon: '📊', placeholder: 'Paste Power BI embed URL...', transform: (url) => url },
  'mixpanel': { name: 'Mixpanel', color: '#7856FF', icon: '📈', placeholder: 'Paste Mixpanel embed URL...', transform: (url) => url },
  'amplitude': { name: 'Amplitude', color: '#1A237E', icon: '📈', placeholder: 'Paste Amplitude embed URL...', transform: (url) => url },
  'hotjar': { name: 'Hotjar', color: '#FF3C00', icon: '🔥', placeholder: 'Paste Hotjar URL...', transform: (url) => url },
  'intercom': { name: 'Intercom', color: '#1F8DED', icon: '💬', placeholder: 'Paste Intercom URL...', transform: (url) => url },
  'zendesk': { name: 'Zendesk', color: '#03363D', icon: '🎧', placeholder: 'Paste Zendesk embed URL...', transform: (url) => url },
  'hubspot': { name: 'HubSpot', color: '#FF7A59', icon: '🧲', placeholder: 'Paste HubSpot form/page URL...', transform: (url) => url },
  'asana': { name: 'Asana', color: '#F06A6A', icon: '✅', placeholder: 'Paste Asana project embed URL...', transform: (url) => url },
  'monday': { name: 'Monday.com', color: '#FF3D57', icon: '📋', placeholder: 'Paste Monday.com embed URL...', transform: (url) => url },
  'clickup': { name: 'ClickUp', color: '#7B68EE', icon: '✓', placeholder: 'Paste ClickUp embed URL...', transform: (url) => url },
  'linear': { name: 'Linear', color: '#5E6AD2', icon: '📐', placeholder: 'Paste Linear embed URL...', transform: (url) => url },
  'jira': { name: 'Jira', color: '#0052CC', icon: '🎫', placeholder: 'Paste Jira embed URL...', transform: (url) => url },
  'confluence': { name: 'Confluence', color: '#172B4D', icon: '📝', placeholder: 'Paste Confluence page URL...', transform: (url) => url },
  'basecamp': { name: 'Basecamp', color: '#1D2D35', icon: '⛺', placeholder: 'Paste Basecamp URL...', transform: (url) => url },
  'todoist': { name: 'Todoist', color: '#E44332', icon: '✅', placeholder: 'Paste Todoist embed URL...', transform: (url) => url },
  'abstract': { name: 'Abstract', color: '#191A1B', icon: '🎨', placeholder: 'Paste Abstract URL...', transform: (url) => url },
  'invision': { name: 'InVision', color: '#FF3366', icon: '🖼️', placeholder: 'Paste InVision prototype URL...', transform: (url) => url },
  'sketch': { name: 'Sketch', color: '#FDAD00', icon: '💎', placeholder: 'Paste Sketch Cloud URL...', transform: (url) => url.replace(/\/?$/, '/embed') },
  'zeplin': { name: 'Zeplin', color: '#FDBD39', icon: '📐', placeholder: 'Paste Zeplin URL...', transform: (url) => url },
  'marvel': { name: 'Marvel', color: '#1FB6FF', icon: '🦸', placeholder: 'Paste Marvel prototype URL...', transform: (url) => url },
  'framer': { name: 'Framer', color: '#05F', icon: '🖼️', placeholder: 'Paste Framer prototype URL...', transform: (url) => url.replace(/\/?$/, '?embed=1') },
  'webflow': { name: 'Webflow', color: '#4353FF', icon: '🌐', placeholder: 'Paste Webflow site URL...', transform: (url) => url },
  'bubble': { name: 'Bubble', color: '#3A3A3A', icon: '🫧', placeholder: 'Paste Bubble app URL...', transform: (url) => url },
  'retool': { name: 'Retool', color: '#3D3D3D', icon: '🔧', placeholder: 'Paste Retool app URL...', transform: (url) => url },
  'notion-embed': { name: 'Notion Page', color: '#000', icon: '📄', placeholder: 'Paste Notion public page URL...', transform: (url) => url },
  'coda': { name: 'Coda', color: '#F46A54', icon: '📄', placeholder: 'Paste Coda doc URL...', transform: (url) => url.replace(/\/?$/, '/embed') },
};

interface UniversalEmbedProps {
  block: Block;
  pageId: string;
}

export const UniversalEmbed: React.FC<UniversalEmbedProps> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const [inputUrl, setInputUrl] = useState('');
  const embedType = block.type as string;
  const registry = EMBED_REGISTRY[embedType];
  const src = block.properties?.src || '';

  if (!registry) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Embed type "{embedType}" is not configured.
      </div>
    );
  }

  const embedUrl = src ? registry.transform(src) : '';
  const iframeHeight = ['spotify', 'soundcloud'].includes(embedType) ? '152px'
    : ['twitter', 'instagram', 'reddit'].includes(embedType) ? '520px'
    : '420px';

  return (
    <div style={{ width: '100%', margin: '14px 0' }} data-block-id={block.id}>
      {embedUrl ? (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: iframeHeight, border: 'none', background: 'var(--bg-primary)' }}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            title={`${registry.name} Embed`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          />
          <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>{registry.icon}</span>
              <span style={{ fontWeight: 600, color: registry.color }}>{registry.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>Embed</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="cover-btn" onClick={() => window.open(src, '_blank')} style={{ padding: '2px 6px', fontSize: '10px', display: 'flex', gap: '3px', alignItems: 'center' }}>
                <ExternalLink size={10} /> Open
              </button>
              <button className="cover-btn" onClick={() => updateBlock(pageId, block.id, { properties: { src: '' } })} style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--danger-color)' }}>
                <X size={10} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputUrl.trim()) {
              updateBlock(pageId, block.id, { properties: { src: inputUrl.trim() } });
            }
          }}
          style={{ padding: '16px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{registry.icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: registry.color }}>{registry.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Paste a URL to embed</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder={registry.placeholder}
              className="search-input"
              style={{ flexGrow: 1, padding: '8px 12px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', background: 'var(--bg-primary)', color: 'inherit', outline: 'none' }}
            />
            <button type="submit" className="cover-btn" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, background: registry.color, color: '#fff' }}>
              Embed
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Export registry for SlashMenu use
export const getEmbedRegistry = () => EMBED_REGISTRY;
export const getEmbedTypes = () => Object.keys(EMBED_REGISTRY);

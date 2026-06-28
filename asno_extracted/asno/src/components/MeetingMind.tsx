import React, { useState, useRef, useEffect } from 'react';
import { useApp, generateId } from '../AppContext';
import { callAiAPI } from '../lib/aiClient';
import {
  Mic, MicOff, Square, Play, Pause, Clock, Calendar, Users, FileText,
  Sparkles, Download, Share2, Tag, ChevronRight, ChevronDown, Plus,
  X, Check, Search, Send, MessageSquare, Layers, List, Bookmark,
  AlertCircle, CheckSquare, HelpCircle, ArrowRight, Zap, Settings,
  Volume2, Radio, StopCircle, Timer, BarChart3, Copy, ExternalLink,
  Headphones, BookOpen, Star, Edit3, Eye, Filter, Moon, Bell
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Speaker {
  id: string;
  label: string;
  color: string;
  voiceTag?: string;
}

interface TranscriptSegment {
  id: string;
  speakerId: string;
  text: string;
  timestamp: number; // seconds from start
  confidence: number;
}

interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  done: boolean;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number; // seconds
  status: 'upcoming' | 'recording' | 'processing' | 'done';
  participants: string[];
  tags: string[];
  roughNotes: string;
  transcript: TranscriptSegment[];
  speakers: Speaker[];
  summary?: {
    executive: string;
    actionItems: ActionItem[];
    decisions: string[];
    keyPoints: string[];
    openQuestions: string[];
    followUps: string[];
  };
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────
const SPEAKER_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const SAMPLE_TRANSCRIPT: TranscriptSegment[] = [
  { id: 't1', speakerId: 'sp1', text: "Alright everyone, let's kick off. Main agenda today is the Q3 roadmap review and the pricing decision.", timestamp: 2, confidence: 0.97 },
  { id: 't2', speakerId: 'sp2', text: "Before we start, can someone share the latest retention numbers? I want to make sure we're aligned.", timestamp: 15, confidence: 0.95 },
  { id: 't3', speakerId: 'sp3', text: "Sure. MoM retention is at 78%, up from 71% last quarter. Churn is mostly from the free tier.", timestamp: 28, confidence: 0.98 },
  { id: 't4', speakerId: 'sp1', text: "Great. That's actually above target. So the pricing question: do we increase the Pro plan from $12 to $15?", timestamp: 42, confidence: 0.96 },
  { id: 't5', speakerId: 'sp2', text: "I'm for it. The value prop is strong, and $15 is still below competitors like Notion at $16.", timestamp: 58, confidence: 0.94 },
  { id: 't6', speakerId: 'sp3', text: "Agreed, but we should grandfather existing users for at least 6 months. We don't want churn from loyalty fallout.", timestamp: 74, confidence: 0.97 },
  { id: 't7', speakerId: 'sp1', text: "Decided. $15 Pro starting August 1st, grandfathering existing users through December. Sarah, can you draft the announcement email?", timestamp: 92, confidence: 0.99 },
  { id: 't8', speakerId: 'sp2', text: "On it. I'll have a draft by Friday.", timestamp: 105, confidence: 0.98 },
  { id: 't9', speakerId: 'sp3', text: "One more thing — the mobile app. Should we push the iOS launch to Q4? The Android bugs are still unresolved.", timestamp: 118, confidence: 0.96 },
  { id: 't10', speakerId: 'sp1', text: "Yes, let's push iOS to Q4. James, target October 15th. Get the Android team to prioritize the three critical bugs first.", timestamp: 134, confidence: 0.97 },
];

const SAMPLE_MEETING: Meeting = {
  id: 'mtg-1',
  title: 'Q3 Roadmap & Pricing Review',
  date: new Date(Date.now() - 86400000 * 2).toISOString(),
  duration: 2340,
  status: 'done',
  participants: ['Alex Chen', 'Sarah Park', 'James Liu'],
  tags: ['roadmap', 'pricing', 'q3'],
  roughNotes: `- retention up 78% ✓
- pricing: raise pro to $15?
- grandfather old users
- mobile: push ios to Q4
- android bugs critical`,
  transcript: SAMPLE_TRANSCRIPT,
  speakers: [
    { id: 'sp1', label: 'Alex Chen', color: '#6366f1' },
    { id: 'sp2', label: 'Sarah Park', color: '#ec4899' },
    { id: 'sp3', label: 'James Liu', color: '#10b981' },
  ],
  summary: {
    executive: 'The team reviewed Q3 metrics — retention hit 78% MoM, above target. Key decisions: Pro plan price increase to $15 (Aug 1st) with grandfathering for existing users through December, and iOS launch pushed to Q4 (target Oct 15th) pending Android critical bug fixes.',
    actionItems: [
      { id: 'ai1', task: 'Draft pricing announcement email', owner: 'Sarah Park', dueDate: 'Friday', done: false },
      { id: 'ai2', task: 'Fix 3 critical Android bugs', owner: 'James Liu', dueDate: 'Oct 1', done: false },
      { id: 'ai3', task: 'iOS App Store submission', owner: 'James Liu', dueDate: 'Oct 15', done: false },
    ],
    decisions: [
      'Pro plan raised to $15/month starting August 1st',
      'Existing users grandfathered at $12 until December 31st',
      'iOS launch delayed to Q4, targeting October 15th',
    ],
    keyPoints: [
      'MoM retention reached 78% (target was 75%)',
      'Churn concentrated in free tier — converting to paid is key focus',
      'Competitor pricing analysis: Notion at $16, Obsidian at $13',
      'Android has 3 critical bugs blocking mobile launch',
    ],
    openQuestions: [
      'What channels to use for the pricing announcement?',
      'Should we offer a discount window before the price hike?',
    ],
    followUps: [
      'Sarah to send pricing email draft by Friday',
      'Engineering to share Android bug resolution ETA by EOD',
    ],
  },
};

// ─── Format helpers ───────────────────────────────────────────────────────────
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};
const fmtDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const RecordingBadge: React.FC<{ elapsed: number }> = ({ elapsed }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, color: '#ef4444'
  }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite' }} />
    REC {fmtTime(elapsed)}
  </div>
);

const TranscriptView: React.FC<{ segments: TranscriptSegment[]; speakers: Speaker[]; activeTs?: number }> = ({ segments, speakers, activeTs }) => {
  const getSpeaker = (id: string) => speakers.find(s => s.id === id) || { label: 'Unknown', color: '#888' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {segments.map(seg => {
        const sp = getSpeaker(seg.speakerId);
        const isActive = activeTs !== undefined && Math.abs(seg.timestamp - activeTs) < 5;
        return (
          <div key={seg.id} style={{
            display: 'flex', gap: '10px', padding: '10px 12px',
            borderRadius: '8px',
            background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
            border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <div style={{ minWidth: '38px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {fmtTime(seg.timestamp)}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: sp.color, marginBottom: '2px', display: 'block' }}>{sp.label}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{seg.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SummaryView: React.FC<{ meeting: Meeting }> = ({ meeting }) => {
  const { summary } = meeting;
  if (!summary) return null;
  const [actionItems, setActionItems] = useState(summary.actionItems);

  const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px', marginTop: '20px' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
    </div>
  );

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Executive summary */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08))', borderRadius: '10px', padding: '14px 16px', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Executive Summary</div>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{summary.executive}</p>
      </div>

      {/* Action items */}
      <SectionHeader icon={<CheckSquare size={14} />} title="Action Items" color="#10b981" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {actionItems.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '9px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, done: !a.done } : a))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: item.done ? '#10b981' : 'var(--text-muted)', marginTop: '1px', flexShrink: 0 }}>
              {item.done ? <Check size={15} /> : <Square size={15} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.task}</span>
              <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👤 {item.owner}</span>
                {item.dueDate && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📅 Due {item.dueDate}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decisions */}
      <SectionHeader icon={<Zap size={14} />} title="Decisions Made" color="#f59e0b" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {summary.decisions.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.15)' }}>
            <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✅</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Key points */}
      <SectionHeader icon={<List size={14} />} title="Key Discussion Points" color="#6366f1" />
      <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {summary.keyPoints.map((k, i) => (
          <li key={i} style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{k}</li>
        ))}
      </ul>

      {/* Open questions */}
      <SectionHeader icon={<HelpCircle size={14} />} title="Open Questions" color="#ec4899" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {summary.openQuestions.map((q, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(236,72,153,0.06)', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.15)' }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>❓</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{q}</span>
          </div>
        ))}
      </div>

      {/* Follow-ups */}
      <SectionHeader icon={<ArrowRight size={14} />} title="Follow-Ups" color="#3b82f6" />
      <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {summary.followUps.map((f, i) => (
          <li key={i} style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{f}</li>
        ))}
      </ul>
    </div>
  );
};

// ─── Square icon ─────────────────────────────────────────────────────────────
const Square: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

// ─── Main MeetingMind component ───────────────────────────────────────────────
const MeetingMind: React.FC = () => {
  const { customAlert, setBrainRoomOpen } = useApp() as any;

  const [meetings, setMeetings] = useState<Meeting[]>([SAMPLE_MEETING]);
  const [activeMeetingId, setActiveMeetingId] = useState<string>('mtg-1');
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'notes' | 'chat'>('summary');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [roughNotesDraft, setRoughNotesDraft] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hi! I've analysed this meeting. Ask me anything — e.g. *What did Sarah commit to?* or *Summarize the pricing decision.*" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbackTs, setPlaybackTs] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const timerRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<any>(null); // Web Speech API SpeechRecognition

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || meetings[0];

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordingElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const startRecording = () => {
    const id = generateId();
    const now = new Date().toISOString();
    const newMeeting: Meeting = {
      id, title: newMeetingTitle || 'Untitled Meeting',
      date: now, duration: 0, status: 'recording',
      participants: [], tags: [], roughNotes: '',
      transcript: [], speakers: [{ id: 'sp-me', label: 'Me', color: '#6366f1' }],
    };
    setMeetings(prev => [newMeeting, ...prev]);
    setActiveMeetingId(id);
    setIsRecording(true);
    setRecordingElapsed(0);
    setRoughNotesDraft('');
    setActiveTab('notes');
    setShowNewMeeting(false);
    
    // Start Web Speech API live transcription
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      let elapsedSecs = 0;
      
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (!text) return;
          const seg: TranscriptSegment = {
            id: generateId(),
            speakerId: 'sp-me',
            text,
            timestamp: elapsedSecs,
            confidence: result[0].confidence || 0.9
          };
          elapsedSecs += Math.ceil(text.split(' ').length / 2); // rough time estimate
          setMeetings(prev => prev.map(m => m.id === id
            ? { ...m, transcript: [...m.transcript, seg] }
            : m
          ));
        }
      };
      
      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e.error);
      };
      
      recognition.start();
      speechRef.current = recognition;
    }
  };

  const stopRecording = async () => {
    // Stop Web Speech API if active
    if (speechRef.current) {
      speechRef.current.stop();
      speechRef.current = null;
    }
    setIsRecording(false);
    const finalNotes = roughNotesDraft;
    setMeetings(prev => prev.map(m => m.id === activeMeetingId
      ? { ...m, status: 'processing', duration: recordingElapsed, roughNotes: finalNotes }
      : m));
    
    try {
      // Build transcript text for AI to analyze
      const transcriptText = activeMeeting?.transcript.map(seg => {
        const sp = activeMeeting.speakers.find(s => s.id === seg.speakerId);
        return `[${fmtTime(seg.timestamp)}] ${sp?.label || 'Speaker'}: ${seg.text}`;
      }).join('\n') || '';

      const systemPrompt = `You are MeetingMind AI, an expert meeting analyzer and note-taker.
Given the meeting transcript and rough notes, generate a comprehensive meeting summary.
Respond ONLY with a valid JSON object matching this structure:
{
  "executive": "2-3 sentence executive summary",
  "actionItems": [{"id":"a1","task":"Task description","owner":"Person name","dueDate":"Date or timeframe","done":false}],
  "decisions": ["Decision 1", "Decision 2"],
  "keyPoints": ["Key point 1", "Key point 2"],
  "openQuestions": ["Open question 1"],
  "followUps": ["Follow-up item 1"]
}`;

      const prompt = `Meeting Title: ${activeMeeting?.title || 'Meeting'}
Date: ${new Date().toLocaleDateString()}
Duration: ${fmtTime(recordingElapsed)}

ROUGH NOTES:
${finalNotes}

TRANSCRIPT:
${transcriptText || '(No transcript available — summary from rough notes only)'}`;

      const apiKey = localStorage.getItem('ai_studio_key_gemini') || 'temporary';
      const reply = await callAiAPI(prompt, [], 'gemini', 'gemini-1.5-flash', apiKey, systemPrompt);
      const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      setMeetings(prev => prev.map(m => m.id === activeMeetingId
        ? { ...m, status: 'done', summary: parsed }
        : m));
    } catch (e) {
      // fallback: mark done without summary
      setMeetings(prev => prev.map(m => m.id === activeMeetingId ? { ...m, status: 'done' } : m));
    }

    setActiveTab('summary');
    customAlert?.('✨ MeetingMind AI has finished analyzing your meeting!', 'AI Enhancement Complete');
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isGenerating) return;
    const q = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setIsGenerating(true);
    
    try {
      const transcriptText = activeMeeting?.transcript.map(seg => {
        const sp = activeMeeting.speakers.find(s => s.id === seg.speakerId);
        return `[${fmtTime(seg.timestamp)}] ${sp?.label || 'Speaker'}: ${seg.text}`;
      }).join('\n') || '';

      const summaryContext = activeMeeting?.summary
        ? `Executive Summary: ${activeMeeting.summary.executive}\n\nKey Decisions: ${activeMeeting.summary.decisions?.join('; ')}`
        : '';

      const systemPrompt = `You are MeetingMind AI, a smart meeting Q&A assistant. 
You have access to the full transcript and summary of the user's meeting. 
Answer concisely and precisely based on what was said. If information isn't in the transcript, say so.
Use markdown bold (**text**) for key terms and names.`;

      const contextPrompt = `MEETING: "${activeMeeting?.title}"
DATE: ${activeMeeting?.date ? new Date(activeMeeting.date).toLocaleDateString() : 'Unknown'}

${summaryContext}

TRANSCRIPT:
${transcriptText || '(No transcript)'}

USER QUESTION: ${q}`;

      const apiKey = localStorage.getItem('ai_studio_key_gemini') || 'temporary';
      const answer = await callAiAPI(contextPrompt, [], 'gemini', 'gemini-1.5-flash', apiKey, systemPrompt);
      setChatMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (e: any) {
      const errMsg = e?.message?.includes('429') 
        ? '⚠️ AI quota exceeded. Please check your Gemini API key quota or switch models.'
        : `⚠️ AI error: ${e?.message || String(e)}`;
      setChatMessages(prev => [...prev, { role: 'ai', text: errMsg }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTranscript = activeMeeting?.transcript.filter(seg =>
    !searchQuery || seg.text.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar: React.FC = () => (
    <div style={{
      width: '240px', flexShrink: 0, borderRight: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>MeetingMind</span>
          </div>
          <button onClick={() => (useApp() as any).setMeetingMindOpen?.(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
            <X size={16} />
          </button>
        </div>
        {/* New meeting button / Record */}
        {isRecording ? (
          <RecordingBadge elapsed={recordingElapsed} />
        ) : (
          <button onClick={() => setShowNewMeeting(true)} style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white',
            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
            <Mic size={13} />
            New Recording
          </button>
        )}
      </div>

      {/* Meeting list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {meetings.map(mtg => (
          <button key={mtg.id} onClick={() => setActiveMeetingId(mtg.id)} style={{
            width: '100%', textAlign: 'left', padding: '10px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: mtg.id === activeMeetingId ? 'var(--bg-secondary)' : 'transparent',
            transition: 'background 0.15s', marginBottom: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{mtg.title}</span>
              {mtg.status === 'recording' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />}
              {mtg.status === 'processing' && <span style={{ fontSize: '10px', color: '#f59e0b' }}>⚙️</span>}
              {mtg.status === 'done' && <span style={{ fontSize: '10px', color: '#10b981' }}>✓</span>}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {fmtDate(mtg.date)} · {fmtDuration(mtg.duration || recordingElapsed)}
            </div>
            {mtg.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                {mtg.tags.slice(0, 2).map(t => (
                  <span key={t} style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>#{t}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Bottom stats */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{meetings.length}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Meetings</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {meetings.reduce((acc, m) => acc + (m.summary?.actionItems.length || 0), 0)}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Actions</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {Math.round(meetings.reduce((acc, m) => acc + m.duration, 0) / 3600)}h
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Recorded</div>
        </div>
      </div>
    </div>
  );

  // ── Main content ─────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', height: '100%', background: 'var(--bg-primary)', overflow: 'hidden', fontFamily: 'inherit'
    }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .mm-tab-btn { background: none; border: none; cursor: pointer; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; transition: all 0.15s; }
        .mm-tab-btn:hover { background: var(--bg-secondary); }
        .mm-tab-btn.active { background: var(--bg-secondary); color: var(--accent-color); }
        .mm-icon-btn { background: none; border: 1px solid var(--border-color); cursor: pointer; padding: 5px 10px; border-radius: 6px; font-size: 11px; display: flex; align-items: center; gap: 5px; color: var(--text-muted); transition: all 0.15s; }
        .mm-icon-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
      `}</style>

      <Sidebar />

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Meeting header */}
        {activeMeeting && (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {activeMeeting.status === 'recording' && <RecordingBadge elapsed={recordingElapsed} />}
                    {activeMeeting.status === 'processing' && (
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 600 }}>⚙️ Processing…</span>
                    )}
                    {activeMeeting.status === 'done' && (
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600 }}>✓ Enhanced</span>
                    )}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{activeMeeting.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '5px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />{fmtDate(activeMeeting.date)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} />{fmtDuration(activeMeeting.duration || recordingElapsed)}</span>
                    {activeMeeting.participants.length > 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={11} />{activeMeeting.participants.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {isRecording && (
                    <button onClick={stopRecording} style={{
                      padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '5px'
                    }}>
                      <StopCircle size={13} />Stop & Enhance
                    </button>
                  )}
                  <button className="mm-icon-btn"><Share2 size={12} />Share</button>
                  <button className="mm-icon-btn"><Download size={12} />Export</button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                {(['summary', 'transcript', 'notes', 'chat'] as const).map(tab => (
                  <button key={tab} className={`mm-tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)} style={{ color: activeTab === tab ? '#6366f1' : 'var(--text-muted)' }}>
                    {tab === 'summary' && <><Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />Summary</>}
                    {tab === 'transcript' && <><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Transcript</>}
                    {tab === 'notes' && <><Edit3 size={12} style={{ display: 'inline', marginRight: 4 }} />Rough Notes</>}
                    {tab === 'chat' && <><MessageSquare size={12} style={{ display: 'inline', marginRight: 4 }} />Ask AI</>}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'chat' ? '0' : '20px 24px' }}>
              {activeTab === 'summary' && (
                activeMeeting.summary
                  ? <SummaryView meeting={activeMeeting} />
                  : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Sparkles size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>AI Summary Not Yet Available</div>
                      <div style={{ fontSize: '12px' }}>
                        {activeMeeting.status === 'recording' ? 'Stop the recording to trigger AI enhancement.' : 'The meeting is still being processed…'}
                      </div>
                    </div>
                  )
              )}
              {activeTab === 'transcript' && (
                <div>
                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search transcript…"
                      style={{ width: '100%', paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  {/* Speakers legend */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {activeMeeting.speakers.map(sp => (
                      <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: sp.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sp.label}</span>
                      </div>
                    ))}
                  </div>
                  <TranscriptView segments={filteredTranscript} speakers={activeMeeting.speakers} activeTs={playbackTs} />
                  {filteredTranscript.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>
                      {activeMeeting.transcript.length === 0
                        ? 'No transcript yet. Start a recording to capture audio.'
                        : 'No results for your search.'}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'notes' && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit3 size={12} />
                    Jot rough notes during the meeting — AI merges them with the transcript after.
                  </div>
                  <textarea
                    value={isRecording ? roughNotesDraft : activeMeeting.roughNotes}
                    onChange={e => isRecording ? setRoughNotesDraft(e.target.value) : undefined}
                    readOnly={!isRecording}
                    placeholder={isRecording ? "Type bullet notes as the meeting progresses…\n• " : "No rough notes recorded."}
                    style={{
                      width: '100%', minHeight: '360px', padding: '14px', borderRadius: '10px',
                      border: '1px solid var(--border-color)', background: isRecording ? 'var(--bg-secondary)' : 'transparent',
                      color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
                      lineHeight: '1.7', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  {isRecording && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      {['• Action:', '• Decided:', '• Q:', '• Follow-up:'].map(s => (
                        <button key={s} onClick={() => setRoughNotesDraft(d => d + '\n' + s + ' ')}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '75%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-secondary)',
                          color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                          fontSize: '13px', lineHeight: '1.6',
                          border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div style={{ display: 'flex', gap: '5px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '14px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
                        {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Ask about this meeting…"
                      style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                    <button onClick={sendChat} disabled={!chatInput.trim() || isGenerating}
                      style={{ padding: '9px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, opacity: (!chatInput.trim() || isGenerating) ? 0.5 : 1 }}>
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* New Meeting modal */}
      {showNewMeeting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: '14px', padding: '24px', width: '380px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>New Meeting Recording</h3>
              <button onClick={() => setShowNewMeeting(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>MEETING TITLE</label>
              <input value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)}
                placeholder="e.g. Weekly Standup"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && startRecording()}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                🎙️ MeetingMind captures system audio silently — no bot joins your call. Works with Zoom, Meet, Teams, and any audio.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowNewMeeting(false)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
              <button onClick={startRecording} style={{ flex: 2, padding: '9px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Mic size={14} />Start Recording
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingMind;

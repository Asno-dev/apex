import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp, generateId } from '../AppContext';
import {
  Shield, ShieldOff, Timer, Clock, Target, Zap, BarChart3,
  Calendar, CheckCircle, XCircle, Plus, X, Settings, Play, Pause,
  StopCircle, Trophy, Flame, BrainCircuit, Smartphone, Monitor,
  Globe, Lock, Unlock, TrendingUp, Sun, Moon, Bell, BellOff,
  Users, Sliders, List, Grid, Download, Trash2, Edit3, RefreshCw,
  Star, AlertTriangle, Check, Menu, ChevronRight, ChevronLeft,
  Sparkles, Share2, BookOpen, Coffee, Home
} from 'lucide-react';

type SessionType = 'deep-work' | 'light-focus' | 'reading-mode' | 'break';
type BlockCategory = 'social' | 'news' | 'streaming' | 'shopping' | 'gaming' | 'adult' | 'custom';

interface BlockItem {
  id: string;
  name: string;
  type: 'app' | 'website';
  category: BlockCategory;
  selected: boolean;
}

interface BlockList {
  id: string;
  name: string;
  icon: string;
  items: BlockItem[];
}

interface FocusSession {
  id: string;
  type: SessionType;
  startTime: string;
  endTime: string | null;
  duration: number;
  completed: boolean;
  abandoned: boolean;
  distractionAttempts: number;
}

interface FocusGoal {
  id: string;
  target: number;
  period: 'daily' | 'weekly';
  current: number;
}

interface Schedule {
  id: string;
  label: string;
  days: number[];
  startHour: number;
  startMinute: number;
  duration: number;
  type: SessionType;
  enabled: boolean;
}

interface DayScore {
  date: string;
  score: number;
  sessionsCompleted: number;
  sessionsPlanned: number;
  distractionAttempts: number;
  totalFocusMinutes: number;
}

const SESSION_DURATIONS = [15, 25, 30, 45, 60, 90, 120];
const SESSION_TYPES: { id: SessionType; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'deep-work', label: 'Deep Work', icon: '🧠', desc: 'Strict block — all distractions blocked', color: '#6366f1' },
  { id: 'light-focus', label: 'Light Focus', icon: '💡', desc: 'Partial block — social & entertainment blocked', color: '#10b981' },
  { id: 'reading-mode', label: 'Reading Mode', icon: '📖', desc: 'Only social & video blocked', color: '#f59e0b' },
  { id: 'break', label: 'Break', icon: '☕', desc: 'Unblock everything — recharge time', color: '#ec4899' },
];

const QUICK_BLOCKS: { id: BlockCategory; label: string; icon: string }[] = [
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'streaming', label: 'Streaming', icon: '🎬' },
  { id: 'shopping', label: 'Shopping', icon: '🛒' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
];

const DEFAULT_BLOCK_ITEMS: Record<BlockCategory, string[]> = {
  social: ['Twitter/X', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Reddit', 'Snapchat', 'WhatsApp', 'Discord'],
  news: ['CNN', 'BBC News', 'NYTimes', 'Fox News', 'Google News', 'Apple News', 'Reuters'],
  streaming: ['YouTube', 'Netflix', 'Hulu', 'Disney+', 'Twitch', 'Spotify', 'Apple Music', 'HBO Max'],
  shopping: ['Amazon', 'eBay', 'Walmart', 'Target', 'Etsy', 'Shopify', 'Alibaba'],
  gaming: ['Steam', 'Epic Games', 'Roblox', 'Minecraft', 'Fortnite', 'League of Legends', 'Xbox', 'PlayStation'],
  adult: ['Adult Websites'],
  custom: [],
};

const DISTRACTION_APPS = ['Twitter/X', 'Instagram', 'TikTok', 'YouTube', 'Reddit', 'Facebook', 'Netflix'];

const FocusShield: React.FC = () => {
  const { customAlert } = useApp();

  // Session state
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>('deep-work');
  const [sessionDuration, setSessionDuration] = useState(25);
  const [elapsed, setElapsed] = useState(0);
  const [sessionRunning, setSessionRunning] = useState(false);
  const [hardlock, setHardlock] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [cooldownDuration, setCooldownDuration] = useState(60);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [breakReminderInterval, setBreakReminderInterval] = useState(90);

  // Tab
  const [activeTab, setActiveTab] = useState<'session' | 'block-lists' | 'analytics' | 'goals' | 'schedules' | 'settings'>('session');

  // Block lists
  const [blockLists, setBlockLists] = useState<BlockList[]>(
    QUICK_BLOCKS.map(qb => ({
      id: qb.id,
      name: qb.label,
      icon: qb.icon,
      items: DEFAULT_BLOCK_ITEMS[qb.id].map(name => ({
        id: generateId(), name, type: 'app' as const, category: qb.id, selected: true
      })).concat(qb.id === 'social' ? [
        { id: generateId(), name: 'twitter.com', type: 'website' as const, category: qb.id, selected: true },
        { id: generateId(), name: 'instagram.com', type: 'website' as const, category: qb.id, selected: true },
        { id: generateId(), name: 'facebook.com', type: 'website' as const, category: qb.id, selected: true },
      ] : qb.id === 'streaming' ? [
        { id: generateId(), name: 'youtube.com', type: 'website' as const, category: qb.id, selected: true },
        { id: generateId(), name: 'netflix.com', type: 'website' as const, category: qb.id, selected: true },
      ] : qb.id === 'gaming' ? [
        { id: generateId(), name: 'twitch.tv', type: 'website' as const, category: qb.id, selected: true },
      ] : [])
    }))
  );
  const [customBlockList, setCustomBlockList] = useState<BlockItem[]>([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemType, setCustomItemType] = useState<'app' | 'website'>('website');
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [allowlistInput, setAllowlistInput] = useState('');

  // Analytics
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [dayScores, setDayScores] = useState<DayScore[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [focusScore, setFocusScore] = useState(0);

  // Goals
  const [goals, setGoals] = useState<FocusGoal[]>([
    { id: 'goal-1', target: 120, period: 'daily', current: 0 },
    { id: 'goal-2', target: 600, period: 'weekly', current: 0 },
  ]);

  // Schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({ label: '', days: [1, 2, 3, 4, 5], startHour: 9, startMinute: 0, duration: 120, type: 'deep-work', enabled: true });

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Smart suggestions
  const [smartSuggestions] = useState<string[]>([
    'Twitter/X — You opened this 14 times during work hours',
    'Instagram — Average 23 min/session in focus time',
    'YouTube — Most distracted time: 2-4 PM',
  ]);

  const timerRef = useRef<number | null>(null);
  const breakTimerRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);

  const getBlockedCategories = useCallback((type: SessionType): BlockCategory[] => {
    switch (type) {
      case 'deep-work': return ['social', 'news', 'streaming', 'shopping', 'gaming', 'adult'];
      case 'light-focus': return ['social', 'streaming', 'gaming'];
      case 'reading-mode': return ['social', 'streaming'];
      case 'break': return [];
    }
  }, []);

  const isBlocked = useCallback((name: string): boolean => {
    if (!sessionRunning || !activeSession) return false;
    const blockedCats = getBlockedCategories(activeSession.type);
    const inBlockedList = blockLists.filter(bl => blockedCats.includes(bl.id as BlockCategory))
      .some(bl => bl.items.some(item => item.selected && item.name.toLowerCase() === name.toLowerCase()));
    const inCustom = customBlockList.some(item => item.selected && item.name.toLowerCase() === name.toLowerCase());
    const inAllowlist = allowlist.some(a => name.toLowerCase().includes(a.toLowerCase()));
    return (inBlockedList || inCustom) && !inAllowlist;
  }, [sessionRunning, activeSession, blockLists, customBlockList, allowlist, getBlockedCategories]);

  const simulateDistraction = useCallback((name: string) => {
    if (!sessionRunning || !activeSession || hardlock) return;
    if (isBlocked(name)) {
      setActiveSession(prev => prev ? { ...prev, distractionAttempts: prev.distractionAttempts + 1 } : null);
      customAlert(`🔒 FocusShield blocked "${name}" — Stay focused!`);
    }
  }, [sessionRunning, activeSession, hardlock, isBlocked, customAlert]);

  const startSession = () => {
    const now = new Date();
    const session: FocusSession = {
      id: generateId(),
      type: sessionType,
      startTime: now.toISOString(),
      endTime: null,
      duration: sessionDuration,
      completed: false,
      abandoned: false,
      distractionAttempts: 0,
    };
    setActiveSession(session);
    setElapsed(0);
    setSessionRunning(true);
    setHardlock(false);
    setCooldownActive(false);
    setShowBreakReminder(false);

    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    breakTimerRef.current = window.setInterval(() => {
      setShowBreakReminder(true);
    }, breakReminderInterval * 60 * 1000);

    customAlert(`🧠 Focus session started! ${SESSION_TYPES.find(s => s.id === sessionType)?.label} — ${sessionDuration}min`);
  };

  const pauseSession = () => {
    if (hardlock) {
      customAlert('🔒 Hardlock mode is active — you cannot pause this session.');
      return;
    }
    if (cooldownActive) {
      customAlert(`⏳ Cooldown active. Please wait ${cooldownRemaining}s before pausing.`);
      return;
    }
    if (cooldownDuration > 0) {
      setCooldownActive(true);
      setCooldownRemaining(cooldownDuration);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = window.setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      customAlert(`⏳ Cooldown: wait ${cooldownDuration}s before you can pause.`);
      return;
    }
    doPause();
  };

  const doPause = () => {
    setSessionRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    customAlert('⏸️ Session paused. Take a breather.');
  };

  const resumeSession = () => {
    setSessionRunning(true);
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    breakTimerRef.current = window.setInterval(() => {
      setShowBreakReminder(true);
    }, breakReminderInterval * 60 * 1000);
    customAlert('▶️ Session resumed. Stay focused!');
  };

  const endSession = (completed: boolean) => {
    if (hardlock && !completed) {
      customAlert('🔒 Hardlock mode is active — you cannot stop this session early.');
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    const now = new Date();
    const endedSession: FocusSession = {
      ...activeSession!,
      endTime: now.toISOString(),
      completed,
      abandoned: !completed,
    };
    setSessionHistory(prev => [endedSession, ...prev]);

    // Update goals
    setGoals(prev => prev.map(g => ({
      ...g,
      current: g.current + (completed ? endedSession.duration : 0),
    })));

    // Update day scores
    const today = now.toISOString().split('T')[0];
    setDayScores(prev => {
      const existing = prev.find(d => d.date === today);
      if (existing) {
        return prev.map(d => d.date === today ? {
          ...d,
          sessionsCompleted: d.sessionsCompleted + (completed ? 1 : 0),
          sessionsPlanned: d.sessionsPlanned + 1,
          distractionAttempts: d.distractionAttempts + endedSession.distractionAttempts,
          totalFocusMinutes: d.totalFocusMinutes + (completed ? endedSession.duration : 0),
          score: Math.min(100, Math.round(((d.sessionsCompleted + (completed ? 1 : 0)) / (d.sessionsPlanned + 1)) * 50 + Math.max(0, 50 - (d.distractionAttempts + endedSession.distractionAttempts) * 5))),
        } : d);
      }
      return [...prev, {
        date: today,
        score: completed ? 80 : 20,
        sessionsCompleted: completed ? 1 : 0,
        sessionsPlanned: 1,
        distractionAttempts: endedSession.distractionAttempts,
        totalFocusMinutes: completed ? endedSession.duration : 0,
      }];
    });

    // Compute streak
    computeStreak();

    setActiveSession(null);
    setSessionRunning(false);
    setHardlock(false);
    setCooldownActive(false);

    if (completed) {
      customAlert(`✅ Session complete! ${endedSession.duration}min of focused work.`);
    } else {
      customAlert('⛔ Session ended early.');
    }
  };

  const computeStreak = () => {
    const sorted = [...dayScores].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const day of sorted) {
      if (day.score >= 50) count++;
      else break;
    }
    setStreak(count);
    if (count > longestStreak) setLongestStreak(count);
  };

  const computeFocusScore = useCallback(() => {
    const today = dayScores.find(d => d.date === new Date().toISOString().split('T')[0]);
    if (!today) return 0;
    const completionRate = today.sessionsPlanned > 0 ? today.sessionsCompleted / today.sessionsPlanned : 0;
    const distractionPenalty = Math.min(1, today.distractionAttempts * 0.1);
    return Math.round(Math.min(100, (completionRate * 60 + (1 - distractionPenalty) * 40) * 100) / 100);
  }, [dayScores]);

  useEffect(() => {
    setFocusScore(computeFocusScore());
  }, [dayScores, computeFocusScore]);

  useEffect(() => {
    if (sessionRunning && activeSession && !activeSession.completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next >= activeSession.duration * 60) {
            endSession(true);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionRunning, activeSession?.id]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addCustomBlockItem = () => {
    if (!customItemName.trim()) return;
    setCustomBlockList(prev => [...prev, {
      id: generateId(), name: customItemName.trim(),
      type: customItemType, category: 'custom', selected: true
    }]);
    setCustomItemName('');
  };

  const removeCustomBlockItem = (id: string) => {
    setCustomBlockList(prev => prev.filter(i => i.id !== id));
  };

  const addAllowlist = () => {
    if (!allowlistInput.trim()) return;
    setAllowlist(prev => [...prev, allowlistInput.trim()]);
    setAllowlistInput('');
  };

  const removeAllowlist = (item: string) => {
    setAllowlist(prev => prev.filter(a => a !== item));
  };

  const addSchedule = () => {
    if (!newSchedule.label) return;
    const sched: Schedule = {
      id: generateId(),
      label: newSchedule.label || 'Focus Block',
      days: newSchedule.days || [1, 2, 3, 4, 5],
      startHour: newSchedule.startHour || 9,
      startMinute: newSchedule.startMinute || 0,
      duration: newSchedule.duration || 120,
      type: newSchedule.type || 'deep-work',
      enabled: true,
    };
    setSchedules(prev => [...prev, sched]);
    setShowAddSchedule(false);
    setNewSchedule({ label: '', days: [1, 2, 3, 4, 5], startHour: 9, startMinute: 0, duration: 120, type: 'deep-work', enabled: true });
  };

  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const todayMinutes = dayScores.find(d => d.date === new Date().toISOString().split('T')[0])?.totalFocusMinutes || 0;
  const weekMinutes = dayScores.slice(0, 7).reduce((sum, d) => sum + d.totalFocusMinutes, 0);

  const renderTimer = () => {
    const remaining = activeSession ? activeSession.duration * 60 - elapsed : 0;
    const progress = activeSession ? (elapsed / (activeSession.duration * 60)) * 100 : 0;
    const sessionInfo = SESSION_TYPES.find(s => s.id === (activeSession?.type || sessionType));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border-color)" strokeWidth="8" />
            <circle cx="100" cy="100" r="88" fill="none" stroke={sessionInfo?.color || '#6366f1'} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 88}`} strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round" transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {activeSession ? formatTime(remaining) : formatTime(sessionDuration * 60)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginTop: '2px' }}>
              {activeSession ? 'remaining' : 'duration'}
            </div>
          </div>
        </div>

        {!activeSession ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {SESSION_TYPES.map(st => (
                <button key={st.id} onClick={() => setSessionType(st.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: `2px solid ${sessionType === st.id ? st.color : 'var(--border-color)'}`,
                    background: sessionType === st.id ? `${st.color}20` : 'var(--bg-primary)',
                    color: sessionType === st.id ? st.color : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s'
                  }}>
                  <span>{st.icon}</span> {st.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-placeholder)', textAlign: 'center' }}>
              {SESSION_TYPES.find(s => s.id === sessionType)?.desc}
            </div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {SESSION_DURATIONS.map(d => (
                <button key={d} onClick={() => setSessionDuration(d)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', border: `1px solid ${sessionDuration === d ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    background: sessionDuration === d ? 'var(--accent-light)' : 'var(--bg-primary)',
                    color: sessionDuration === d ? 'var(--accent-color)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '11px', fontWeight: 600
                  }}>
                  {d}min
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={hardlock} onChange={e => setHardlock(e.target.checked)} style={{ accentColor: '#ef4444' }} />
                <Lock size={10} /> Hardlock
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={cooldownDuration > 0} onChange={e => setCooldownDuration(e.target.checked ? 60 : 0)} style={{ accentColor: '#f59e0b' }} />
                <Timer size={10} /> Cooldown
              </label>
            </div>
            <button onClick={startSession}
              style={{
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)', transition: 'all 0.15s'
              }}>
              <Play size={18} /> Start Focus Session
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>{sessionInfo?.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: sessionInfo?.color }}>{sessionInfo?.label}</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-placeholder)', background: 'var(--bg-secondary)', padding: '2px 10px', borderRadius: '10px' }}>
              Distraction attempts: {activeSession.distractionAttempts}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {sessionRunning ? (
                <>
                  <button onClick={pauseSession} disabled={hardlock} className="cover-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    <Pause size={14} /> Pause
                  </button>
                  <button onClick={() => endSession(false)} disabled={hardlock} className="cover-btn" style={{ padding: '8px 16px', fontSize: '12px', color: hardlock ? 'var(--text-placeholder)' : '#ef4444' }}>
                    <StopCircle size={14} /> End
                  </button>
                </>
              ) : (
                <button onClick={resumeSession} className="cover-btn" style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--accent-color)', color: 'white', border: 'none' }}>
                  <Play size={14} /> Resume
                </button>
              )}
            </div>
            {hardlock && (
              <div style={{ fontSize: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={10} /> Hardlock active — cannot pause or stop
              </div>
            )}
            {cooldownActive && (
              <div style={{ fontSize: '10px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Timer size={10} /> Cooldown: {cooldownRemaining}s
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOnboarding = () => {
    const steps = [
      {
        title: 'Welcome to FocusShield',
        icon: '🛡️',
        content: 'Your personal digital wellbeing guardian. Block distractions, protect deep work, and build focus streaks.',
      },
      {
        title: 'What\'s your biggest distraction?',
        icon: '📱',
        content: 'Select your top distraction sources:',
        choices: QUICK_BLOCKS.map(qb => qb.label),
      },
      {
        title: 'How many hours do you want to focus daily?',
        icon: '🎯',
        content: 'Set a daily focus target to track your progress.',
        slider: { min: 1, max: 8, value: 4 },
      },
      {
        title: 'When do you work best?',
        icon: '⏰',
        content: 'We\'ll create a schedule based on your peak focus hours.',
        choices: ['Early morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-9 PM)', 'Night owl (9 PM+)'],
      },
    ];
    const step = steps[onboardingStep];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>{step.icon}</div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{step.title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '24px', lineHeight: 1.6 }}>{step.content}</div>
        {step.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '320px' }}>
            {step.choices.map((choice, i) => (
              <button key={i} onClick={() => setOnboardingStep(onboardingStep + 1)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, textAlign: 'left' }}
                className="hover-bg">
                {choice}
              </button>
            ))}
          </div>
        )}
        {step.slider && (
          <div style={{ width: '100%', maxWidth: '320px' }}>
            <input type="range" min={step.slider.min} max={step.slider.max} value={step.slider.value} readOnly
              style={{ width: '100%', accentColor: '#6366f1' }} />
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700 }}>{step.slider.value} hours/day</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', marginTop: '32px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === onboardingStep ? '#6366f1' : 'var(--border-color)', transition: 'all 0.2s' }} />
          ))}
        </div>
        <button onClick={() => { if (onboardingStep < steps.length - 1) setOnboardingStep(onboardingStep + 1); else setShowOnboarding(false); }}
          style={{ marginTop: '16px', padding: '10px 32px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
          {onboardingStep < steps.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    );
  };

  if (showOnboarding) return renderOnboarding();

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '52px', background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: '2px', flexShrink: 0 }}>
        <div style={{ padding: '6px 0', marginBottom: '6px' }}>
          <Shield size={20} style={{ color: '#6366f1' }} />
        </div>
        {[
          { id: 'session' as const, icon: <Timer size={18} />, label: 'Session' },
          { id: 'block-lists' as const, icon: <List size={18} />, label: 'Blocks' },
          { id: 'analytics' as const, icon: <BarChart3 size={18} />, label: 'Analytics' },
          { id: 'goals' as const, icon: <Target size={18} />, label: 'Goals' },
          { id: 'schedules' as const, icon: <Calendar size={18} />, label: 'Schedules' },
          { id: 'settings' as const, icon: <Settings size={18} />, label: 'Settings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            style={{
              width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', cursor: 'pointer', border: 'none',
              background: activeTab === tab.id ? 'var(--accent-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-muted)',
              transition: 'all 0.15s'
            }} className={activeTab !== tab.id ? 'hover-bg' : ''}>
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>FocusShield</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '6px', padding: '3px 10px', fontSize: '10px' }}>
              <Flame size={12} style={{ color: '#f59e0b' }} /> Streak: {streak}d
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: focusScore >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', borderRadius: '6px', padding: '3px 10px', fontSize: '10px', color: focusScore >= 70 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
              Score: {focusScore}
            </div>
            {sessionRunning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99,102,241,0.1)', borderRadius: '6px', padding: '3px 10px', fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Focusing
              </div>
            )}
          </div>
        </div>

        {/* Break reminder modal */}
        {showBreakReminder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', maxWidth: '360px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <Coffee size={40} style={{ color: '#f59e0b', marginBottom: '12px' }} />
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Time for a Break!</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                You've been focused for {breakReminderInterval} minutes. Take 15 minutes to recharge — your brain will thank you.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => setShowBreakReminder(false)} className="cover-btn" style={{ padding: '8px 20px' }}>
                  Dismiss
                </button>
                <button onClick={() => { endSession(true); setShowBreakReminder(false); }} className="cover-btn" style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 20px' }}>
                  Take Break
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
          {/* SESSION TAB */}
          {activeTab === 'session' && (
            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
              {renderTimer()}

              {/* Quick blocks */}
              {!activeSession && (
                <div style={{ marginTop: '16px', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-placeholder)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Block</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {QUICK_BLOCKS.map(qb => (
                      <button key={qb.id} onClick={() => { setSessionType('deep-work'); simulateDistraction(DISTRACTION_APPS[0]); }}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover-bg">
                        <span>{qb.icon}</span> {qb.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocked items preview during session */}
              {activeSession && (
                <div style={{ marginTop: '16px', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-placeholder)', marginBottom: '8px' }}>🔒 Currently Blocked</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {getBlockedCategories(activeSession.type).flatMap(cat =>
                      blockLists.filter(bl => bl.id === cat).flatMap(bl =>
                        bl.items.filter(i => i.selected).slice(0, 5).map(item => (
                          <span key={item.id} style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {item.name}
                          </span>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BLOCK LISTS TAB */}
          {activeTab === 'block-lists' && (
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Block Lists</div>
              </div>

              {/* Pre-built lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {blockLists.map(list => (
                  <div key={list.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} className="hover-bg">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{list.icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{list.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{list.items.filter(i => i.selected).length} items</span>
                      </div>
                    </div>
                    <div style={{ padding: '6px 12px 10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {list.items.map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: item.selected ? 'rgba(239,68,68,0.08)' : 'var(--bg-secondary)', border: `1px solid ${item.selected ? 'rgba(239,68,68,0.2)' : 'var(--border-color)'}`, cursor: 'pointer', color: item.selected ? '#ef4444' : 'var(--text-placeholder)' }}>
                        <input type="checkbox" checked={item.selected} onChange={() => setBlockLists(prev => prev.map(bl => bl.id === list.id ? { ...bl, items: bl.items.map(i => i.id === item.id ? { ...i, selected: !i.selected } : i) } : bl))} style={{ accentColor: '#ef4444' }} />
                        {item.type === 'website' ? '🌐' : '📱'} {item.name}
                      </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom block list */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Custom Blocks</div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  <input value={customItemName} onChange={e => setCustomItemName(e.target.value)}
                    placeholder="App or website name..."
                    onKeyDown={e => { if (e.key === 'Enter') addCustomBlockItem(); }}
                    style={{ flexGrow: 1, padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
                  <select value={customItemType} onChange={e => setCustomItemType(e.target.value as 'app' | 'website')}
                    style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px', outline: 'none' }}>
                    <option value="website">🌐 Website</option>
                    <option value="app">📱 App</option>
                  </select>
                  <button onClick={addCustomBlockItem} disabled={!customItemName.trim()}
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600, opacity: customItemName.trim() ? 1 : 0.5 }}>
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {customBlockList.map(item => (
                    <span key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                      {item.type === 'website' ? '🌐' : '📱'} {item.name}
                      <button onClick={() => removeCustomBlockItem(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: '0', fontSize: '10px' }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allowlist */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Allowlist (exceptions)</div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  <input value={allowlistInput} onChange={e => setAllowlistInput(e.target.value)}
                    placeholder="App or site to allow..."
                    onKeyDown={e => { if (e.key === 'Enter') addAllowlist(); }}
                    style={{ flexGrow: 1, padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
                  <button onClick={addAllowlist} disabled={!allowlistInput.trim()}
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600, opacity: allowlistInput.trim() ? 1 : 0.5 }}>
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {allowlist.map(item => (
                    <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                      <Unlock size={10} /> {item}
                      <button onClick={() => removeAllowlist(item)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#10b981', padding: '0', fontSize: '10px' }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Analytics Dashboard</div>

              {/* Top stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'Focus Score', value: focusScore, icon: <Target size={16} />, color: focusScore >= 70 ? '#10b981' : focusScore >= 40 ? '#f59e0b' : '#ef4444' },
                  { label: 'Streak', value: `${streak}d`, icon: <Flame size={16} />, color: '#f59e0b' },
                  { label: 'Best Streak', value: `${longestStreak}d`, icon: <Trophy size={16} />, color: '#8b5cf6' },
                  { label: 'Today', value: `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`, icon: <Clock size={16} />, color: '#6366f1' },
                  { label: 'This Week', value: `${Math.floor(weekMinutes / 60)}h`, icon: <BarChart3 size={16} />, color: '#06b6d4' },
                  { label: 'Sessions', value: sessionHistory.length.toString(), icon: <CheckCircle size={16} />, color: '#10b981' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-placeholder)', fontWeight: 600 }}>{stat.label}</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Daily scores heatmap */}
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Daily Focus Heatmap</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {Array.from({ length: 28 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - 27 + i);
                    const dateStr = d.toISOString().split('T')[0];
                    const dayData = dayScores.find(s => s.date === dateStr);
                    const score = dayData?.score || 0;
                    const intensity = score > 80 ? '#6366f1' : score > 60 ? '#818cf8' : score > 40 ? '#a5b4fc' : score > 0 ? '#c7d2fe' : 'var(--bg-secondary)';
                    return (
                      <div key={i} title={`${dateStr}: ${score}`}
                        style={{ width: '100%', aspectRatio: '1', borderRadius: '3px', background: intensity, border: '1px solid var(--border-color)', minWidth: '8px' }} />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text-placeholder)', marginTop: '4px' }}>
                  <span>28 days ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Session history */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Session History ({sessionHistory.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sessionHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-placeholder)', fontSize: '12px' }}>No sessions yet. Start your first focus session!</div>
                  ) : sessionHistory.slice(0, 20).map(s => {
                    const st = SESSION_TYPES.find(t => t.id === s.type);
                    const startDate = new Date(s.startTime);
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '11px' }}>
                        <span>{st?.icon || '🧠'}</span>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st?.label || 'Session'} · {s.duration}min</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-placeholder)' }}>{startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: s.completed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.completed ? '#10b981' : '#ef4444' }}>
                          {s.completed ? '✓ Done' : '✗ Abandoned'}
                        </span>
                        <span style={{ fontSize: '9px', color: 'var(--text-placeholder)' }}>{s.distractionAttempts} distractions</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Focus Goals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.map(goal => {
                  const progress = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
                  const targetLabel = goal.period === 'daily' ? 'today' : 'this week';
                  return (
                    <div key={goal.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{goal.period === 'daily' ? 'Daily' : 'Weekly'} Focus Target</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{goal.current}min of {goal.target}min {targetLabel}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: progress >= 100 ? '#10b981' : '#6366f1' }}>{Math.round(progress)}%</div>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: progress >= 100 ? '#10b981' : '#6366f1', borderRadius: '3px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smart suggestions */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} style={{ color: '#f59e0b' }} /> Smart Suggestions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {smartSuggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }}>
                      <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <span style={{ flexGrow: 1 }}>{s}</span>
                      <button onClick={() => { simulateDistraction(s.split(' —')[0]); }}
                        style={{ padding: '3px 10px', border: 'none', borderRadius: '4px', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '9px', fontWeight: 600, flexShrink: 0 }}>
                        + Block
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULES TAB */}
          {activeTab === 'schedules' && (
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Focus Schedules</div>
                <button onClick={() => setShowAddSchedule(!showAddSchedule)} className="cover-btn" style={{ padding: '5px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={12} /> Add Schedule
                </button>
              </div>

              {showAddSchedule && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input value={newSchedule.label} onChange={e => setNewSchedule(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Schedule label..." style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                      <button key={i} onClick={() => setNewSchedule(prev => ({ ...prev, days: prev.days?.includes(i) ? prev.days.filter(d => d !== i) : [...(prev.days || []), i] }))}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${newSchedule.days?.includes(i) ? '#6366f1' : 'var(--border-color)'}`, background: newSchedule.days?.includes(i) ? 'var(--accent-light)' : 'transparent', color: newSchedule.days?.includes(i) ? '#6366f1' : 'var(--text-muted)', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}>
                        {day}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Start:</span>
                    <input type="number" min={0} max={23} value={newSchedule.startHour} onChange={e => setNewSchedule(prev => ({ ...prev, startHour: parseInt(e.target.value) || 9 }))} style={{ width: '50px', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px', textAlign: 'center' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>:</span>
                    <input type="number" min={0} max={59} value={newSchedule.startMinute} onChange={e => setNewSchedule(prev => ({ ...prev, startMinute: parseInt(e.target.value) || 0 }))} style={{ width: '50px', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px', textAlign: 'center' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Duration:</span>
                    <select value={newSchedule.duration} onChange={e => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) }))} style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}>
                      {SESSION_DURATIONS.map(d => <option key={d} value={d}>{d}min</option>)}
                    </select>
                    <select value={newSchedule.type} onChange={e => setNewSchedule(prev => ({ ...prev, type: e.target.value as SessionType }))} style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}>
                      {SESSION_TYPES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </select>
                  </div>
                  <button onClick={addSchedule} disabled={!newSchedule.label}
                    style={{ alignSelf: 'flex-end', padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 600, opacity: newSchedule.label ? 1 : 0.5 }}>
                    Add Schedule
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {schedules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-placeholder)', fontSize: '12px' }}>
                    No schedules yet. Create recurring focus blocks for your peak hours.
                  </div>
                ) : schedules.map(s => {
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const st = SESSION_TYPES.find(t => t.id === s.type);
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: s.enabled ? 1 : 0.5 }}>
                      <span>{st?.icon || '🧠'}</span>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>
                          {s.days.map(d => days[d]).join(', ')} · {`${s.startHour.toString().padStart(2, '0')}:${s.startMinute.toString().padStart(2, '0')}`} · {s.duration}min · {st?.label}
                        </div>
                      </div>
                      <button onClick={() => toggleSchedule(s.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: s.enabled ? '#10b981' : 'var(--text-muted)', padding: '4px' }}>
                        {s.enabled ? <Check size={14} /> : <X size={14} />}
                      </button>
                      <button onClick={() => deleteSchedule(s.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Break Reminder</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Remind me every
                    <select value={breakReminderInterval} onChange={e => setBreakReminderInterval(parseInt(e.target.value))} style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}>
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                      <option value={120}>120 min</option>
                    </select>
                  </label>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Cooldown Duration</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Wait
                    <select value={cooldownDuration} onChange={e => setCooldownDuration(parseInt(e.target.value))} style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}>
                      <option value={0}>No cooldown</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                      <option value={1800}>30 minutes</option>
                    </select>
                    before pausing
                  </label>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Integrations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#6366f1' }} />
                      <Sliders size={12} /> Auto-set Slack status to "🧠 Focusing"
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#6366f1' }} />
                      <Users size={12} /> Auto-set Teams status to "Focusing"
                    </label>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Data</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setSessionHistory([]); setDayScores([]); setStreak(0); setGoals(prev => prev.map(g => ({ ...g, current: 0 }))); customAlert('Focus data cleared.'); }}
                      className="cover-btn" style={{ fontSize: '10px', color: '#ef4444' }}>
                      <Trash2 size={12} /> Clear All Data
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>About FocusShield</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    FocusShield protects your deep work by blocking distracting apps and websites.
                    Built with 🧠 for digital wellbeing. v1.0
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cover-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 11px; font-weight: 500; transition: all 0.15s ease; line-height: 1; }
        .cover-btn:hover { background: var(--bg-tertiary); }
        .hover-bg:hover { background: var(--bg-tertiary) !important; }
        * { scrollbar-width: thin; }
      `}</style>
    </div>
  );
};

export default FocusShield;

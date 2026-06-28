import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = 'single' | 'local' | 'chaos';
export type Difficulty = 'easy' | 'medium' | 'impossible' | 'chaos';
export type GameTheme = 'cyberpunk' | 'retro' | 'classic' | 'royal';
export type BoardSize = 3 | 5;

export interface Move {
  index: number;
  player: 'X' | 'O';
  timestamp: number;
}

export interface Match {
  id: string;
  date: string;
  mode: GameMode;
  difficulty?: Difficulty;
  boardSize: BoardSize;
  winner: 'X' | 'O' | 'draw';
  moves: Move[];
  duration: number; // in seconds
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  condition: string;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  maxStreak: number;
  xp: number;
  gamesPlayed: number;
}

interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  theme: GameTheme;
  boardSize: BoardSize;
}

interface GameState {
  history: Match[];
  stats: GameStats;
  achievements: Achievement[];
  settings: GameSettings;
  addMatch: (match: Match) => void;
  updateStats: (winner: 'X' | 'O' | 'draw', mode: GameMode, difficulty?: Difficulty) => void;
  unlockAchievement: (id: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetAllData: () => void;
}

const initialAchievements: Achievement[] = [
  { id: 'first_win', title: 'First Victory', description: 'Win your first game', icon: '🏆', unlockedAt: null, condition: 'Win any match' },
  { id: 'ai_slayer', title: 'AI Slayer', description: 'Defeat the Impossible AI', icon: '🤖', unlockedAt: null, condition: 'Win against Impossible AI' },
  { id: 'streak_3', title: 'On Fire', description: 'Reach a win streak of 3 games', icon: '🔥', unlockedAt: null, condition: '3 Win Streak' },
  { id: 'streak_5', title: 'Unstoppable', description: 'Reach a win streak of 5 games', icon: '⚡', unlockedAt: null, condition: '5 Win Streak' },
  { id: 'grid_master', title: 'Grid Master', description: 'Win a match on the 5x5 board', icon: '📐', unlockedAt: null, condition: 'Win on 5x5 board' },
  { id: 'chaos_survivor', title: 'Chaos Survivor', description: 'Win a match in Chaos Mode', icon: '🌀', unlockedAt: null, condition: 'Win in Chaos Mode' },
  { id: 'xp_1000', title: 'Grandmaster', description: 'Reach 1,000 XP points', icon: '👑', unlockedAt: null, condition: 'Reach 1,000 XP' },
];

const defaultStats: GameStats = {
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  maxStreak: 0,
  xp: 0,
  gamesPlayed: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      history: [],
      stats: defaultStats,
      achievements: initialAchievements,
      settings: {
        soundEnabled: true,
        soundVolume: 0.5,
        theme: 'cyberpunk',
        boardSize: 3,
      },

      addMatch: (match) => {
        set((state) => {
          const newHistory = [match, ...state.history];
          return { history: newHistory };
        });

        // Check achievements after adding a match
        get().updateStats(match.winner, match.mode, match.difficulty);
      },

      updateStats: (winner, mode, difficulty) => {
        set((state) => {
          const isWin = winner === 'X'; // Player is always X
          const isLoss = winner === 'O';
          const isDraw = winner === 'draw';

          let xpGained = 0;
          if (isWin) {
            xpGained = mode === 'chaos' ? 150 : difficulty === 'impossible' ? 200 : difficulty === 'medium' ? 100 : 50;
          } else if (isDraw) {
            xpGained = 20;
          }

          const newWins = state.stats.wins + (isWin ? 1 : 0);
          const newLosses = state.stats.losses + (isLoss ? 1 : 0);
          const newDraws = state.stats.draws + (isDraw ? 1 : 0);
          const newStreak = isWin ? state.stats.streak + 1 : isLoss ? 0 : state.stats.streak;
          const newMaxStreak = Math.max(state.stats.maxStreak, newStreak);
          const newXP = state.stats.xp + xpGained;
          const newGamesPlayed = state.stats.gamesPlayed + 1;

          const updatedStats = {
            wins: newWins,
            losses: newLosses,
            draws: newDraws,
            streak: newStreak,
            maxStreak: newMaxStreak,
            xp: newXP,
            gamesPlayed: newGamesPlayed,
          };

          // Check achievements dynamically
          const updatedAchievements = state.achievements.map((ach) => {
            if (ach.unlockedAt) return ach;

            let shouldUnlock = false;
            if (ach.id === 'first_win' && isWin) shouldUnlock = true;
            if (ach.id === 'ai_slayer' && isWin && difficulty === 'impossible') shouldUnlock = true;
            if (ach.id === 'streak_3' && newStreak >= 3) shouldUnlock = true;
            if (ach.id === 'streak_5' && newStreak >= 5) shouldUnlock = true;
            if (ach.id === 'grid_master' && isWin && state.settings.boardSize === 5) shouldUnlock = true;
            if (ach.id === 'chaos_survivor' && isWin && mode === 'chaos') shouldUnlock = true;
            if (ach.id === 'xp_1000' && newXP >= 1000) shouldUnlock = true;

            if (shouldUnlock) {
              return { ...ach, unlockedAt: new Date().toISOString() };
            }
            return ach;
          });

          return {
            stats: updatedStats,
            achievements: updatedAchievements,
          };
        });
      },

      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map((ach) =>
            ach.id === id && !ach.unlockedAt
              ? { ...ach, unlockedAt: new Date().toISOString() }
              : ach
          ),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetAllData: () => {
        set({
          history: [],
          stats: defaultStats,
          achievements: initialAchievements.map(a => ({ ...a, unlockedAt: null })),
          settings: {
            soundEnabled: true,
            soundVolume: 0.5,
            theme: 'cyberpunk',
            boardSize: 3,
          },
        });
      },
    }),
    {
      name: 'tic_tac_toe_arcade_store',
    }
  )
);

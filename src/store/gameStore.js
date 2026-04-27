import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_LEVEL = 8;

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Navigation
      mode: 'home',
      setMode: (mode) => set({ mode }),

      // Wallet / Economy
      pesos: 50,
      addPesos: (amount) => set((s) => ({ pesos: s.pesos + amount })),
      spendPesos: (amount) => set((s) => ({ pesos: Math.max(0, s.pesos - amount) })),

      // Progression
      currentLevel: 1,
      levelScores: {},
      unlocked: [1, 2, 3],
      completeLevel: (level, score) => set((s) => {
        const prev = s.levelScores[level] || 0;
        const newScores = { ...s.levelScores, [level]: Math.max(prev, score) };
        const nextLevel = level + 1;
        const newUnlocked = (nextLevel <= MAX_LEVEL && !s.unlocked.includes(nextLevel))
          ? [...s.unlocked, nextLevel]
          : s.unlocked;
        const newCurrentLevel = level >= s.currentLevel && nextLevel <= MAX_LEVEL
          ? nextLevel
          : s.currentLevel;
        return { levelScores: newScores, unlocked: newUnlocked, currentLevel: newCurrentLevel };
      }),

      // Streak
      streak: 0,
      addStreak: () => set((s) => ({ streak: s.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),

      // Deck selection
      activeDeck: 'classic',
      setActiveDeck: (deck) => set({ activeDeck: deck }),

      // Custom photo deck
      photoAssignments: {},
      setPhotoAssignments: (assignments) => set({ photoAssignments: assignments }),

      // Selected level for play
      selectedLevel: 1,
      setSelectedLevel: (level) => set({ selectedLevel: level }),
    }),
    { name: 'loteria-remix-storage' }
  )
);

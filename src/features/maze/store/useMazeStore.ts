import { create } from "zustand";

interface MazeState {
  mazeSize: [number, number];
  tempSize: number;
  timeLeft: number;
  score: number;
  highscore: number;
  isVictory: boolean;
  isGameOver: boolean;
  mazeSeed: number;
  resetKey: number;

  setTempSize: (size: number) => void;
  regenerateMaze: () => void;
  resetMaze: () => void;
  playAgain: () => void;
  decrementTime: () => void;
  addScore: (points: number) => void;
  setVictory: (status: boolean) => void;
}

export const useMazeStore = create<MazeState>()((set, get) => ({
  mazeSize: [15, 15],
  tempSize: 15,
  timeLeft: 60,
  score: 0,
  highscore: Number(localStorage.getItem("highscore") ?? 0),
  isVictory: false,
  isGameOver: false,
  mazeSeed: 1,
  resetKey: 0,

  setTempSize: (size: number) => set({ tempSize: Math.min(50, Math.max(2, size)) }),

  regenerateMaze: () => {
    const size = get().tempSize;
    set({
      mazeSize: [size, size],
      timeLeft: 60,
      isVictory: false,
      isGameOver: false,
      mazeSeed: Date.now() + Math.random(),
      resetKey: 0
    });
  },

  resetMaze: () => {
    set((state: MazeState) => ({
      timeLeft: 60,
      isVictory: false,
      isGameOver: false,
      resetKey: state.resetKey + 1
    }));
  },

  playAgain: () => {
    const size = get().tempSize;
    set({
      mazeSize: [size, size],
      timeLeft: 60,
      score: 0,
      isVictory: false,
      isGameOver: false,
      mazeSeed: Date.now() + Math.random(),
      resetKey: 0
    });
  },

  decrementTime: () => {
    const current = get().timeLeft;
    if (current <= 1) {
      const finalScore = get().score;
      const currentHigh = get().highscore;
      if (finalScore > currentHigh) {
        localStorage.setItem("highscore", String(finalScore));
        set({ timeLeft: 0, isGameOver: true, highscore: finalScore });
      } else {
        set({ timeLeft: 0, isGameOver: true });
      }
    } else {
      set({ timeLeft: current - 1 });
    }
  },

  addScore: (points: number) => {
    const nextScore = get().score + points;
    const currentHigh = get().highscore;
    if (nextScore > currentHigh) {
      localStorage.setItem("highscore", String(nextScore));
      set({ score: nextScore, highscore: nextScore });
    } else {
      set({ score: nextScore });
    }
  },

  setVictory: (status: boolean) => set({ isVictory: status })
}));
import { create } from "zustand";
import { MAZE_CONFIG } from "../constants/config";

interface MazeState {
  mazeSize: [number, number];
  tempSize: number;
  timeLeft: number;
  score: number;
  highscore: number;
  isVictory: boolean;
  isGameOver: boolean;
  hasStarted: boolean;
  moveCount: number;
  lastEarned: number;
  mazeSeed: number;
  resetKey: number;

  setTempSize: (size: number) => void;
  startGame: () => void;
  incrementMoveCount: () => void;
  regenerateMaze: () => void;
  resetMaze: () => void;
  playAgain: () => void;
  decrementTime: () => void;
  setVictory: () => void;
}

export const useMazeStore = create<MazeState>()((set, get) => ({
  mazeSize: [MAZE_CONFIG.DEFAULT_SIZE, MAZE_CONFIG.DEFAULT_SIZE],
  tempSize: MAZE_CONFIG.DEFAULT_SIZE,
  timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
  score: 0,
  highscore: Number(localStorage.getItem("highscore") ?? 0),
  isVictory: false,
  isGameOver: false,
  hasStarted: false,
  moveCount: 0,
  lastEarned: 0,
  mazeSeed: 1,
  resetKey: 0,

  setTempSize: (size: number) =>
    set({
      tempSize: Math.min(MAZE_CONFIG.MAX_SIZE, Math.max(MAZE_CONFIG.MIN_SIZE, size)),
    }),

  startGame: () => set({ hasStarted: true }),

  incrementMoveCount: () =>
    set((state: MazeState) => ({ moveCount: state.moveCount + 1 })),

  regenerateMaze: () => {
    const size = get().tempSize;
    set({
      mazeSize: [size, size],
      timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
      isVictory: false,
      isGameOver: false,
      hasStarted: false,
      moveCount: 0,
      lastEarned: 0,
      mazeSeed: Date.now() + Math.random(),
      resetKey: 0,
    });
  },

  resetMaze: () => {
    set((state: MazeState) => ({
      timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
      isVictory: false,
      isGameOver: false,
      hasStarted: false,
      moveCount: 0,
      lastEarned: 0,
      resetKey: state.resetKey + 1,
    }));
  },

  playAgain: () => {
    const size = get().tempSize;
    set({
      mazeSize: [size, size],
      timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
      score: 0,
      isVictory: false,
      isGameOver: false,
      hasStarted: false,
      moveCount: 0,
      lastEarned: 0,
      mazeSeed: Date.now() + Math.random(),
      resetKey: 0,
    });
  },

  decrementTime: () => {
    const current = get().timeLeft;
    if (current <= 1) {
      const finalScore = get().score;
      const currentHigh = get().highscore;
      if (finalScore > currentHigh) {
        localStorage.setItem("highscore", String(finalScore));
        set({
          timeLeft: 0,
          isGameOver: true,
          hasStarted: false,
          highscore: finalScore,
        });
      } else {
        set({ timeLeft: 0, isGameOver: true, hasStarted: false });
      }
    } else {
      set({ timeLeft: current - 1 });
    }
  },

  setVictory: () => {
    const state = get();
    const basePoints = state.mazeSize[0] * MAZE_CONFIG.SCORE_BASE_MULTIPLIER;
    const timeBonus = Math.floor(
      (state.timeLeft / MAZE_CONFIG.INITIAL_TIME_SECONDS) * basePoints
    );
    const points = basePoints + timeBonus;
    const nextScore = state.score + points;
    const currentHigh = state.highscore;

    if (nextScore > currentHigh) {
      localStorage.setItem("highscore", String(nextScore));
      set({
        score: nextScore,
        highscore: nextScore,
        isVictory: true,
        hasStarted: false,
        lastEarned: points,
      });
    } else {
      set({
        score: nextScore,
        isVictory: true,
        hasStarted: false,
        lastEarned: points,
      });
    }
  },
}));
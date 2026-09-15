import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
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
  isSolving: boolean;
  moveCount: number;
  lastEarned: number;
  mazeSeed: number;
  resetKey: number;
  playerTrail: [number, number][];
  solutionPath: [number, number][];
  revealedSolutionCount: number;

  setTempSize: (size: number) => void;
  startGame: () => void;
  recordPlayerMove: (col: number, row: number) => void;
  regenerateMaze: () => void;
  resetMaze: () => void;
  nextLevel: () => void;
  playAgain: () => void;
  decrementTime: () => void;
  setVictory: () => void;
  setSolutionPath: (path: [number, number][]) => void;
  incrementRevealedSolution: () => void;
  setIsSolving: (status: boolean) => void;
}

export const useMazeStore = create<MazeState>()(
  subscribeWithSelector((set, get) => ({
    mazeSize: [MAZE_CONFIG.DEFAULT_SIZE, MAZE_CONFIG.DEFAULT_SIZE],
    tempSize: MAZE_CONFIG.DEFAULT_SIZE,
    timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
    score: 0,
    highscore: Number(localStorage.getItem("highscore") ?? 0),
    isVictory: false,
    isGameOver: false,
    hasStarted: false,
    isSolving: false,
    moveCount: 0,
    lastEarned: 0,
    mazeSeed: 1,
    resetKey: 0,
    playerTrail: [[0, 0]],
    solutionPath: [],
    revealedSolutionCount: 0,

    setTempSize: (size: number) =>
      set({
        tempSize: Math.min(MAZE_CONFIG.MAX_SIZE, Math.max(MAZE_CONFIG.MIN_SIZE, size)),
      }),

    startGame: () => {
      set({
        hasStarted: true,
        timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
        isVictory: false,
        isGameOver: false,
        isSolving: false,
        solutionPath: [],
        revealedSolutionCount: 0,
        playerTrail: [[0, 0]],
        moveCount: 0,
      });
    },

    recordPlayerMove: (col: number, row: number) => {
      set((state: MazeState) => {
        const trail = [...state.playerTrail];
        const existingIdx = trail.findIndex(([c, r]) => c === col && r === row);

        if (existingIdx !== -1) {
          return {
            playerTrail: trail.slice(0, existingIdx + 1),
            moveCount: state.moveCount + 1,
          };
        }

        trail.push([col, row]);
        return {
          playerTrail: trail,
          moveCount: state.moveCount + 1,
        };
      });
    },

    regenerateMaze: () => {
      const size = get().tempSize;
      set({
        mazeSize: [size, size],
        timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
        isVictory: false,
        isGameOver: false,
        hasStarted: false,
        isSolving: false,
        moveCount: 0,
        lastEarned: 0,
        playerTrail: [[0, 0]],
        solutionPath: [],
        revealedSolutionCount: 0,
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
        isSolving: false,
        moveCount: 0,
        lastEarned: 0,
        playerTrail: [[0, 0]],
        solutionPath: [],
        revealedSolutionCount: 0,
        resetKey: state.resetKey + 1,
      }));
    },

    nextLevel: () => {
      const currentSize = get().mazeSize[0];
      const nextSize = Math.min(MAZE_CONFIG.MAX_SIZE, currentSize + 1);
      set({
        mazeSize: [nextSize, nextSize],
        tempSize: nextSize,
        timeLeft: MAZE_CONFIG.INITIAL_TIME_SECONDS,
        isVictory: false,
        isGameOver: false,
        hasStarted: true,
        isSolving: false,
        moveCount: 0,
        lastEarned: 0,
        playerTrail: [[0, 0]],
        solutionPath: [],
        revealedSolutionCount: 0,
        mazeSeed: Date.now() + Math.random(),
        resetKey: 0,
      });
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
        isSolving: false,
        moveCount: 0,
        lastEarned: 0,
        playerTrail: [[0, 0]],
        solutionPath: [],
        revealedSolutionCount: 0,
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

    setSolutionPath: (path: [number, number][]) =>
      set({ solutionPath: path, revealedSolutionCount: 0 }),

    incrementRevealedSolution: () =>
      set((state: MazeState) => ({
        revealedSolutionCount: state.revealedSolutionCount + 1,
      })),

    setIsSolving: (status: boolean) => set({ isSolving: status }),
  }))
);
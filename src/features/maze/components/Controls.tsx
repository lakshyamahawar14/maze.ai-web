import { useEffect, useCallback, ChangeEvent } from "react";
import { RefreshCw, RotateCcw, Play, Lightbulb } from "lucide-react";
import { useMazeStore } from "../store/useMazeStore";
import { MAZE_CONFIG } from "../constants/config";
import { findAStarPath } from "../algorithms/astar";
import { soundManager } from "../utils/sound";
import logo from "../../../assets/logo.ico";

function Controls() {
  const mazeSize = useMazeStore((state) => state.mazeSize);
  const tempSize = useMazeStore((state) => state.tempSize);
  const timeLeft = useMazeStore((state) => state.timeLeft);
  const score = useMazeStore((state) => state.score);
  const highscore = useMazeStore((state) => state.highscore);
  const isVictory = useMazeStore((state) => state.isVictory);
  const isGameOver = useMazeStore((state) => state.isGameOver);
  const hasStarted = useMazeStore((state) => state.hasStarted);
  const isSolving = useMazeStore((state) => state.isSolving);
  const solutionPath = useMazeStore((state) => state.solutionPath);
  const revealedSolutionCount = useMazeStore((state) => state.revealedSolutionCount);
  const levelMatrix = useMazeStore((state) => state.levelMatrix);

  const setTempSize = useMazeStore((state) => state.setTempSize);
  const startGame = useMazeStore((state) => state.startGame);
  const regenerateMaze = useMazeStore((state) => state.regenerateMaze);
  const resetMaze = useMazeStore((state) => state.resetMaze);
  const decrementTime = useMazeStore((state) => state.decrementTime);
  const setSolutionPath = useMazeStore((state) => state.setSolutionPath);
  const incrementRevealedSolution = useMazeStore((state) => state.incrementRevealedSolution);
  const setIsSolving = useMazeStore((state) => state.setIsSolving);

  useEffect(() => {
    if (!hasStarted || isVictory || isGameOver || isSolving) return;
    const interval = setInterval(() => {
      decrementTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isVictory, isGameOver, isSolving, decrementTime]);

  useEffect(() => {
    if (!isSolving || solutionPath.length === 0) return;

    if (revealedSolutionCount >= solutionPath.length) {
      setIsSolving(false);
      return;
    }

    const timer = setTimeout(() => {
      incrementRevealedSolution();
      soundManager.playMoveSound();
    }, 40);

    return () => clearTimeout(timer);
  }, [isSolving, solutionPath, revealedSolutionCount, incrementRevealedSolution, setIsSolving]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      if (value === "") {
        setTempSize(MAZE_CONFIG.MIN_SIZE);
        return;
      }
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        setTempSize(parsed);
      }
    },
    [setTempSize]
  );

  const handleSliderChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setTempSize(Number(e.target.value));
    },
    [setTempSize]
  );

  const handleSolve = useCallback(() => {
    if (hasStarted || isVictory || isGameOver || isSolving) return;
    const path = findAStarPath(levelMatrix, 0, 0, mazeSize[0] - 1, mazeSize[1] - 1);
    if (path.length > 0) {
      setSolutionPath(path);
      setIsSolving(true);
    }
  }, [hasStarted, isVictory, isGameOver, isSolving, levelMatrix, mazeSize, setSolutionPath, setIsSolving]);

  const isLocked = isVictory || isGameOver || isSolving;
  const canReset = hasStarted && !isLocked;
  const canSolve = !hasStarted && !isLocked;

  const timerColorClass =
    timeLeft <= MAZE_CONFIG.WARNING_TIME_THRESHOLD
      ? "text-rose-500 border-rose-500 bg-rose-950/20"
      : "text-emerald-400 border-emerald-500/40 bg-[var(--color-surface)]";

  return (
    <div className="w-full shrink-0 p-[8px] lg:p-[16px] flex flex-col items-center justify-center gap-3 z-10 lg:w-80 lg:h-full lg:border-l lg:border-[var(--color-border)] lg:justify-start lg:gap-6 lg:overflow-y-auto">
      <header className="w-full flex items-center justify-center py-2 shrink-0">
        <div className="flex items-center gap-1">
          <img
            src={logo}
            alt="Maze.AI Logo"
            className="w-8 h-8 object-contain"
            width={32}
            height={32}
          />
          <h1 className="text-title font-bold tracking-wider">
            Maze<span className="text-[var(--color-accent)]">.AI</span>
          </h1>
        </div>
      </header>

      <div className="flex flex-col items-center w-full gap-3">
        <div className="flex items-center justify-between w-full max-w-xs gap-3">
          <label htmlFor="mazeSize" className="text-body font-medium text-[var(--color-content)]">
            Maze Size
          </label>
          <input
            type="number"
            min={MAZE_CONFIG.MIN_SIZE}
            max={MAZE_CONFIG.MAX_SIZE}
            disabled={isLocked || hasStarted}
            className="w-16 px-2 py-0.5 outline-none bg-[var(--color-surface)] border-b-2 border-[var(--color-accent)] text-center text-body font-game font-bold text-[var(--color-content)] disabled:opacity-50 disabled:cursor-not-allowed"
            id="mazeSize"
            name="mazeSize"
            value={tempSize}
            onChange={handleInputChange}
          />
        </div>

        <div className="w-full max-w-xs flex items-center gap-2">
          <input
            type="range"
            min={MAZE_CONFIG.MIN_SIZE}
            max={MAZE_CONFIG.MAX_SIZE}
            disabled={isLocked || hasStarted}
            value={tempSize}
            onChange={handleSliderChange}
            className="w-full accent-[var(--color-accent)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <button
            type="button"
            disabled={hasStarted || isLocked}
            className="w-full cursor-pointer bg-[var(--color-btn-play)] text-black text-body font-bold px-4 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={startGame}
          >
            <Play className="w-4 h-4 fill-current" />
            {hasStarted ? "Playing..." : "Play"}
          </button>

          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              disabled={isLocked}
              className="flex-1 cursor-pointer bg-[var(--color-btn-new)] text-black text-body font-bold px-3 py-1.5 rounded flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={regenerateMaze}
            >
              <RefreshCw className="w-4 h-4" />
              New
            </button>

            {canReset && (
              <button
                type="button"
                className="flex-1 cursor-pointer bg-[var(--color-btn-reset)] text-black text-body font-bold px-3 py-1.5 rounded flex items-center justify-center gap-1.5"
                onClick={resetMaze}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}

            {canSolve && (
              <button
                type="button"
                className="flex-1 cursor-pointer bg-[var(--color-btn-solution)] text-black text-body font-bold px-3 py-1.5 rounded flex items-center justify-center gap-1.5"
                onClick={handleSolve}
              >
                <Lightbulb className="w-4 h-4" />
                Solution
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:flex-col lg:w-full lg:max-w-xs lg:gap-3">
        <div
          id="time"
          className={`px-3 py-2 text-center rounded border lg:w-full flex items-center justify-between ${timerColorClass}`}
        >
          <span className="text-caption font-medium tracking-wide">Time</span>
          <span className="font-game font-bold text-stat">{timeLeft}s</span>
        </div>
        <div
          id="score"
          className="px-3 py-2 text-center rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-content)] lg:w-full flex items-center justify-between"
        >
          <span className="text-caption font-medium tracking-wide text-[var(--color-content-muted)]">Score</span>
          <span className="font-game font-bold text-stat">{score}</span>
        </div>
        <div
          id="highscore"
          className="px-3 py-2 text-center rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-content)] lg:w-full flex items-center justify-between"
        >
          <span className="text-caption font-medium tracking-wide text-[var(--color-content-muted)]">Highscore</span>
          <span className="font-game font-bold text-stat">{highscore}</span>
        </div>
      </div>
    </div>
  );
}

export default Controls;
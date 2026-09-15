import { useEffect, useCallback, ChangeEvent } from "react";
import { RefreshCw, RotateCcw, Play } from "lucide-react";
import { useMazeStore } from "../store/useMazeStore";
import { MAZE_CONFIG } from "../constants/config";

function Controls() {
  const tempSize = useMazeStore((state) => state.tempSize);
  const timeLeft = useMazeStore((state) => state.timeLeft);
  const score = useMazeStore((state) => state.score);
  const highscore = useMazeStore((state) => state.highscore);
  const isVictory = useMazeStore((state) => state.isVictory);
  const isGameOver = useMazeStore((state) => state.isGameOver);
  const hasStarted = useMazeStore((state) => state.hasStarted);
  const moveCount = useMazeStore((state) => state.moveCount);

  const setTempSize = useMazeStore((state) => state.setTempSize);
  const startGame = useMazeStore((state) => state.startGame);
  const regenerateMaze = useMazeStore((state) => state.regenerateMaze);
  const resetMaze = useMazeStore((state) => state.resetMaze);
  const decrementTime = useMazeStore((state) => state.decrementTime);

  useEffect(() => {
    if (!hasStarted || isVictory || isGameOver) return;
    const interval = setInterval(() => {
      decrementTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isVictory, isGameOver, decrementTime]);

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

  const isLocked = isVictory || isGameOver;
  const canReset = hasStarted && moveCount > 0 && !isLocked;

  const timerColorClass =
    timeLeft <= MAZE_CONFIG.WARNING_TIME_THRESHOLD
      ? "text-rose-500 border-rose-500 animate-pulse bg-rose-950/20"
      : "text-emerald-400 border-emerald-500/40 bg-[var(--color-surface)]";

  return (
    <div className="w-full shrink-0 p-[8px] lg:p-[16px] flex flex-col items-center justify-center gap-3 z-10 lg:w-80 lg:h-full lg:border-l lg:border-[var(--color-border)] lg:justify-start lg:gap-6 lg:overflow-y-auto">
      <div className="flex flex-col items-center w-full gap-3">
        <div className="flex items-center justify-between w-full max-w-xs gap-3">
          <label htmlFor="mazeSize" className="text-body font-medium text-[var(--color-content)]">
            Size ({MAZE_CONFIG.MIN_SIZE}-{MAZE_CONFIG.MAX_SIZE}):
          </label>
          <input
            type="number"
            min={MAZE_CONFIG.MIN_SIZE}
            max={MAZE_CONFIG.MAX_SIZE}
            disabled={isLocked || hasStarted}
            className="w-16 px-2 py-0.5 outline-none bg-[var(--color-surface)] border-b-2 border-[var(--color-accent)] text-center text-body text-[var(--color-content)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full cursor-pointer bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-body font-semibold px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={startGame}
          >
            <Play className="w-4 h-4 fill-current" />
            {hasStarted ? "Playing..." : "Start Game"}
          </button>

          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              disabled={isLocked}
              className="flex-1 cursor-pointer bg-[var(--color-surface)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-content)] text-body font-semibold px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={regenerateMaze}
            >
              <RefreshCw className="w-4 h-4" />
              New
            </button>
            {canReset && (
              <button
                type="button"
                className="flex-1 cursor-pointer bg-[var(--color-surface)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-content)] text-body font-semibold px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1.5"
                onClick={resetMaze}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:flex-col lg:w-full lg:max-w-xs lg:gap-3">
        <div
          id="time"
          className={`px-3 py-1.5 text-center rounded text-caption font-semibold border transition-colors lg:w-full ${timerColorClass}`}
        >
          Time: {timeLeft}s
        </div>
        <div
          id="score"
          className="px-3 py-1.5 text-center rounded text-caption font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-content)] lg:w-full"
        >
          Score: {score}
        </div>
        <div
          id="highscore"
          className="px-3 py-1.5 text-center rounded text-caption font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-content)] lg:w-full"
        >
          Highscore: {highscore}
        </div>
      </div>
    </div>
  );
}

export default Controls;
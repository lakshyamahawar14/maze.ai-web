import { ArrowRight, Trophy, AlertTriangle, RotateCcw } from "lucide-react";
import { usePlayground } from "../hooks/usePlayground";
import { MAZE_CONFIG } from "../constants/config";

function Playground() {
  const {
    containerRef,
    isVictory,
    isGameOver,
    timeLeft,
    score,
    lastEarned,
    regenerateMaze,
    playAgain,
  } = usePlayground();

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full flex items-center justify-center p-[8px] lg:p-[16px] relative overflow-hidden min-h-0 bg-[var(--color-canvas)]"
    >
      {isVictory && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-canvas)]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 rounded border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-w-xs w-full mx-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-title font-bold text-[var(--color-content)] tracking-wider">
                MAZE SOLVED!
              </h2>
              <p className="text-caption text-[var(--color-content-muted)]">
                Time taken:{" "}
                <span className="text-[var(--color-content)] font-semibold">
                  {MAZE_CONFIG.INITIAL_TIME_SECONDS - timeLeft}s
                </span>{" "}
                (+{lastEarned} pts)
              </p>
            </div>
            <button
              type="button"
              className="w-full cursor-pointer bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-body font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              onClick={regenerateMaze}
            >
              Next Maze
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-canvas)]/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 rounded border border-rose-900/60 bg-[var(--color-surface)] shadow-2xl max-w-xs w-full mx-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-title font-bold text-rose-500 tracking-wider">
                GAME OVER!
              </h2>
              <p className="text-caption text-[var(--color-content-muted)]">
                Time ran out. Final Score:{" "}
                <span className="text-[var(--color-content)] font-semibold">{score}</span>
              </p>
            </div>
            <button
              type="button"
              className="w-full cursor-pointer bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-body font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              onClick={playAgain}
            >
              Play Again
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playground;
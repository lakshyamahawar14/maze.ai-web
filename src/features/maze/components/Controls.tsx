import { useState, useEffect, useCallback, ChangeEvent } from "react";
import type { ControlsProps } from "../types";

function Controls({ onInputChange, isVictory }: ControlsProps) {
  const [mazeSize, setMazeSize] = useState<[number, number]>([15, 15]);
  const [tempMazeSize, setTempMazeSize] = useState<number>(15);
  const [time, setTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highscore, setHighscore] = useState<number>(() => {
    const stored = localStorage.getItem("highscore");
    return stored !== null ? Number(stored) : 0;
  });

  useEffect(() => {
    if (score > highscore) {
      localStorage.setItem("highscore", String(score));
      setHighscore(score);
    }
  }, [score, highscore]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isVictory) {
      setScore((prevScore) => prevScore + mazeSize[0]);
    }
  }, [isVictory, mazeSize]);

  const handleClick = useCallback(() => {
    const size = Math.min(50, Math.max(2, tempMazeSize));
    setMazeSize([size, size]);
    setTime(0);
    const requestId = Math.floor(Math.random() * 10000) + 1;
    onInputChange([[size, size], requestId]);
  }, [tempMazeSize, onInputChange]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === "") {
      setTempMazeSize(2);
      return;
    }
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      if (parsed > 50) {
        setTempMazeSize(50);
      } else {
        setTempMazeSize(parsed);
      }
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    if (tempMazeSize < 2) {
      setTempMazeSize(2);
    } else if (tempMazeSize > 50) {
      setTempMazeSize(50);
    }
  }, [tempMazeSize]);

  const handleSliderChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTempMazeSize(Number(e.target.value));
  }, []);

  return (
    <div className="w-full shrink-0 p-[8px] lg:p-[16px] flex flex-col items-center justify-center gap-3 z-10 lg:w-80 lg:h-full lg:border-l lg:border-[var(--color-border)] lg:justify-start lg:gap-6 lg:overflow-y-auto">
      <div className="flex flex-col items-center w-full gap-3">
        <div className="flex items-center justify-between w-full max-w-xs gap-3">
          <label htmlFor="mazeSize" className="text-body font-medium text-[var(--color-content)]">
            Size (2-50):
          </label>
          <input
            type="number"
            min={2}
            max={50}
            className="w-16 px-2 py-0.5 outline-none bg-[var(--color-surface)] border-b-2 border-[var(--color-accent)] text-center text-body text-[var(--color-content)]"
            id="mazeSize"
            name="mazeSize"
            value={tempMazeSize}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
        </div>

        <div className="w-full max-w-xs flex items-center gap-2">
          <input
            type="range"
            min={2}
            max={50}
            value={tempMazeSize}
            onChange={handleSliderChange}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />
        </div>

        <button
          type="button"
          className="cursor-pointer bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-body font-semibold px-5 py-1.5 rounded transition-colors w-full max-w-xs"
          onClick={handleClick}
        >
          Generate
        </button>
      </div>

      <div className="flex items-center gap-2 lg:flex-col lg:w-full lg:max-w-xs lg:gap-3">
        <div
          id="time"
          className="px-3 py-1.5 text-center rounded text-caption font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-content)] lg:w-full"
        >
          Time: {time}s
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
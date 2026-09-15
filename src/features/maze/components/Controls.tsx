import { useState, useEffect, useCallback, ChangeEvent } from "react";
import type { ControlsProps } from "../types";

function Controls({ onInputChange, isVictory }: ControlsProps) {
  const [mazeSize, setMazeSize] = useState<[number, number]>([15, 15]);
  const [tempMazeSize, setTempMazeSize] = useState<[number, number]>([15, 15]);
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
    if (tempMazeSize[0] === 0) {
      alert("Please Give Valid Maze Size!");
      return;
    }
    setMazeSize(tempMazeSize);
    setTime(0);
    const requestId = Math.floor(Math.random() * 10000) + 1;
    onInputChange([tempMazeSize, requestId]);
  }, [tempMazeSize, onInputChange]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    const parsed = Number(value);

    if (value === "" || Number.isNaN(parsed)) {
      setTempMazeSize([0, 0]);
    } else {
      setTempMazeSize([parsed, parsed]);
    }
  }, []);

  return (
    <div className="w-full shrink-0 p-2 flex flex-col items-center justify-center gap-2 z-10">
      <div className="flex items-center gap-3">
        <label htmlFor="mazeSize" className="text-body font-medium flex items-center gap-2">
          Maze Size:
          <input
            type="text"
            className="w-16 px-2 py-0.5 outline-none bg-[var(--color-surface)] border-b-2 border-[var(--color-accent)] text-center text-body text-[var(--color-content)]"
            id="mazeSize"
            name="mazeSize"
            value={tempMazeSize[0] === 0 ? "" : tempMazeSize[0]}
            onChange={handleChange}
            maxLength={2}
            placeholder="25"
          />
        </label>
        <button
          type="button"
          className="cursor-pointer bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black text-body font-semibold px-4 py-1 rounded transition-colors"
          onClick={handleClick}
        >
          Generate
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div
          id="time"
          className="px-3 py-1 text-center rounded text-caption font-semibold bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          {time}s
        </div>
        <div
          id="score"
          className="px-3 py-1 text-center rounded text-caption font-semibold bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          Score: {score}
        </div>
        <div
          id="highscore"
          className="px-3 py-1 text-center rounded text-caption font-semibold bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          Highscore: {highscore}
        </div>
      </div>
    </div>
  );
}

export default Controls;
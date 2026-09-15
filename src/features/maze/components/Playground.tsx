import p5 from "p5";
import { useEffect, useRef, useCallback } from "react";
import { ArrowRight, Trophy, AlertTriangle, RotateCcw } from "lucide-react";
import { KruskalMaze } from "../algorithms/kruskal";
import { useMazeStore } from "../store/useMazeStore";
import type { LineCoord } from "../types";

function Playground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const mazeSize = useMazeStore((state) => state.mazeSize);
  const mazeSeed = useMazeStore((state) => state.mazeSeed);
  const resetKey = useMazeStore((state) => state.resetKey);
  const isVictory = useMazeStore((state) => state.isVictory);
  const isGameOver = useMazeStore((state) => state.isGameOver);
  const timeLeft = useMazeStore((state) => state.timeLeft);
  const score = useMazeStore((state) => state.score);
  const setVictory = useMazeStore((state) => state.setVictory);
  const regenerateMaze = useMazeStore((state) => state.regenerateMaze);
  const playAgain = useMazeStore((state) => state.playAgain);

  const playerPosRef = useRef<[number, number]>([0, 0]);
  const mazeSizeRef = useRef<[number, number]>([15, 15]);
  const levelMatrixRef = useRef<number[][]>([]);
  const linesRef = useRef<LineCoord[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const layoutMetricsRef = useRef<{ startX: number; startY: number; offset: number }>({
    startX: 0,
    startY: 0,
    offset: 0,
  });

  useEffect(() => {
    mazeSizeRef.current = mazeSize;
  }, [mazeSize]);

  useEffect(() => {
    const kruskal = new KruskalMaze(mazeSize[0], mazeSize[1]);
    const matrix = kruskal.transformMazeData([mazeSize[0], mazeSize[1]], kruskal.maze_data);
    levelMatrixRef.current = matrix;
    setVictory(false);
  }, [mazeSize, mazeSeed, setVictory]);

  const rebuildMazeGeometry = useCallback((width: number, height: number) => {
    const matrix = levelMatrixRef.current;
    if (matrix.length === 0 || width <= 0 || height <= 0) return;

    const rowSize = mazeSizeRef.current[0];
    const colSize = mazeSizeRef.current[1];

    const weight = rowSize > 35 ? 1 : 2;
    const boundaryBuffer = weight * 2;

    const availableWidth = Math.max(10, width - boundaryBuffer);
    const availableHeight = Math.max(10, height - boundaryBuffer);

    const offset = Math.max(
      2,
      Math.floor(Math.min(availableWidth / colSize, availableHeight / rowSize))
    );

    const totalWidth = colSize * offset;
    const totalHeight = rowSize * offset;

    const startX = Math.round((width - totalWidth) / 2);
    const startY = Math.round((height - totalHeight) / 2);

    layoutMetricsRef.current = { startX, startY, offset };

    const initialLines: LineCoord[] = [];

    initialLines.push({
      x1: startX,
      y1: startY,
      x2: startX + totalWidth,
      y2: startY,
    });
    initialLines.push({
      x1: startX + totalWidth,
      y1: startY,
      x2: startX + totalWidth,
      y2: startY + totalHeight,
    });
    initialLines.push({
      x1: startX,
      y1: startY + totalHeight,
      x2: startX + totalWidth,
      y2: startY + totalHeight,
    });
    initialLines.push({
      x1: startX,
      y1: startY,
      x2: startX,
      y2: startY + totalHeight,
    });

    const rows = 2 * rowSize - 1;
    const cols = 2 * colSize - 1;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i % 2 === 0 && j % 2 === 1 && matrix[i][j] === 1) {
          const cellX = startX + Math.floor((j + 1) / 2) * offset;
          const cellY = startY + Math.floor(i / 2) * offset;
          initialLines.push({
            x1: cellX,
            y1: cellY,
            x2: cellX,
            y2: cellY + offset,
          });
        } else if (i % 2 === 1 && j % 2 === 0 && matrix[i][j] === 1) {
          const cellX = startX + Math.floor(j / 2) * offset;
          const cellY = startY + Math.floor((i + 1) / 2) * offset;
          initialLines.push({
            x1: cellX,
            y1: cellY,
            x2: cellX + offset,
            y2: cellY,
          });
        }
      }
    }

    linesRef.current = initialLines;

    const playerStartX = startX + Math.floor(offset / 2);
    const playerStartY = startY + Math.floor(offset / 2);
    playerPosRef.current = [playerStartX, playerStartY];
  }, []);

  useEffect(() => {
    const { startX, startY, offset } = layoutMetricsRef.current;
    if (offset > 0) {
      playerPosRef.current = [
        startX + Math.floor(offset / 2),
        startY + Math.floor(offset / 2),
      ];
    }
  }, [resetKey]);

  const getContentDimensions = useCallback((el: HTMLElement) => {
    const style = window.getComputedStyle(el);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    const w = Math.max(10, Math.floor(el.clientWidth - paddingX));
    const h = Math.max(10, Math.floor(el.clientHeight - paddingY));

    return { w, h };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || levelMatrixRef.current.length === 0) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }

    const sketch = (p: p5) => {
      let mazeBuffer: p5.Graphics;

      const refreshBuffer = () => {
        const w = p.width;
        const h = p.height;
        rebuildMazeGeometry(w, h);

        if (mazeBuffer) {
          mazeBuffer.remove();
        }

        mazeBuffer = p.createGraphics(w, h);
        mazeBuffer.clear();
        mazeBuffer.stroke(0, 229, 255);

        const currentMazeSize = mazeSizeRef.current;
        const weight = currentMazeSize[0] > 35 ? 1 : 2;
        mazeBuffer.strokeWeight(weight);

        const lines = linesRef.current;
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          mazeBuffer.line(l.x1, l.y1, l.x2, l.y2);
        }
      };

      p.setup = () => {
        const { w, h } = getContentDimensions(el);
        const canvas = p.createCanvas(w, h);
        canvas.parent(el);
        canvas.style("display", "block");
        refreshBuffer();
      };

      p.draw = () => {
        p.clear();
        if (mazeBuffer) {
          p.image(mazeBuffer, 0, 0);
        }

        const pos = playerPosRef.current;
        const { offset } = layoutMetricsRef.current;
        if (offset > 0) {
          const playerSize = Math.max(3, Math.floor(offset / 3.5));
          p.noStroke();
          p.fill(255);
          p.ellipse(pos[0], pos[1], playerSize, playerSize);
        }
      };

      p.windowResized = () => {
        const { w, h } = getContentDimensions(el);
        p.resizeCanvas(w, h);
        refreshBuffer();
      };
    };

    const instance = new p5(sketch);
    p5InstanceRef.current = instance;

    const resizeObserver = new ResizeObserver(() => {
      if (!el) return;
      const { w, h } = getContentDimensions(el);
      if (w > 0 && h > 0 && instance.width && (instance.width !== w || instance.height !== h)) {
        instance.resizeCanvas(w, h);
        instance.windowResized();
      }
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      instance.remove();
      p5InstanceRef.current = null;
    };
  }, [mazeSeed, mazeSize, rebuildMazeGeometry, getContentDimensions]);

  const movePlayer = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (isVictory || isGameOver) return;

      const currentMazeSize = mazeSizeRef.current;
      const currentMatrix = levelMatrixRef.current;
      const { startX, startY, offset } = layoutMetricsRef.current;

      if (offset <= 0 || currentMatrix.length === 0) return;

      let [px, py] = playerPosRef.current;
      let j = Math.floor((px - startX) / offset);
      let i = Math.floor((py - startY) / offset);

      if (direction === "up") {
        if (i - 1 < 0 || currentMatrix[2 * i - 1]?.[2 * j] === 1) return;
        py -= offset;
        i -= 1;
      } else if (direction === "down") {
        if (i + 1 >= currentMazeSize[0] || currentMatrix[2 * i + 1]?.[2 * j] === 1) return;
        py += offset;
        i += 1;
      } else if (direction === "left") {
        if (j - 1 < 0 || currentMatrix[2 * i]?.[2 * j - 1] === 1) return;
        px -= offset;
        j -= 1;
      } else if (direction === "right") {
        if (j + 1 >= currentMazeSize[1] || currentMatrix[2 * i]?.[2 * j + 1] === 1) return;
        px += offset;
        j += 1;
      }

      playerPosRef.current = [px, py];

      if (i === currentMazeSize[0] - 1 && j === currentMazeSize[1] - 1) {
        setVictory(true);
      }
    },
    [isVictory, isGameOver, setVictory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVictory || isGameOver) return;
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") movePlayer("up");
      else if (key === "s" || key === "arrowdown") movePlayer("down");
      else if (key === "a" || key === "arrowleft") movePlayer("left");
      else if (key === "d" || key === "arrowright") movePlayer("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVictory, isGameOver, movePlayer]);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (isVictory || isGameOver) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [isVictory, isGameOver]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (isVictory || isGameOver || !touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) movePlayer("right");
        else if (dx < -20) movePlayer("left");
      } else {
        if (dy > 20) movePlayer("down");
        else if (dy < -20) movePlayer("up");
      }
      touchStartRef.current = null;
    },
    [isVictory, isGameOver, movePlayer]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventScroll = (e: TouchEvent) => e.preventDefault();

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", preventScroll, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", preventScroll);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full p-[8px] lg:p-[16px] relative overflow-hidden min-h-0 bg-[var(--color-canvas)]"
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
                Time remaining: <span className="text-[var(--color-content)] font-semibold">{timeLeft}s</span> (+{mazeSize[0]} pts)
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
                Time ran out. Final Score: <span className="text-[var(--color-content)] font-semibold">{score}</span>
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
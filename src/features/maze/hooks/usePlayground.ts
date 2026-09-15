import p5 from "p5";
import { useEffect, useRef, useCallback } from "react";
import { KruskalMaze } from "../algorithms/kruskal";
import { useMazeStore } from "../store/useMazeStore";
import { MAZE_CONFIG } from "../constants/config";
import { soundManager } from "../utils/sound";
import { getHedgeSvgVariant } from "../utils/hedgeSvgGenerator";
import type { LineCoord } from "../types";

export function usePlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const mazeSize = useMazeStore((state) => state.mazeSize);
  const mazeSeed = useMazeStore((state) => state.mazeSeed);
  const resetKey = useMazeStore((state) => state.resetKey);
  const isVictory = useMazeStore((state) => state.isVictory);
  const isGameOver = useMazeStore((state) => state.isGameOver);
  const isSolving = useMazeStore((state) => state.isSolving);
  const timeLeft = useMazeStore((state) => state.timeLeft);
  const score = useMazeStore((state) => state.score);
  const lastEarned = useMazeStore((state) => state.lastEarned);

  const setVictory = useMazeStore((state) => state.setVictory);
  const nextLevel = useMazeStore((state) => state.nextLevel);
  const playAgain = useMazeStore((state) => state.playAgain);
  const recordPlayerMove = useMazeStore((state) => state.recordPlayerMove);

  const playerGridRef = useRef<[number, number]>([0, 0]);
  const mazeSizeRef = useRef<[number, number]>([MAZE_CONFIG.DEFAULT_SIZE, MAZE_CONFIG.DEFAULT_SIZE]);
  const levelMatrixRef = useRef<number[][]>([]);
  const linesRef = useRef<LineCoord[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const layoutMetricsRef = useRef<{ startX: number; startY: number; offset: number }>({
    startX: 0,
    startY: 0,
    offset: 0,
  });

  const hasStartedRef = useRef<boolean>(false);
  const playerTrailRef = useRef<[number, number][]>([[0, 0]]);
  const solutionPathRef = useRef<[number, number][]>([]);
  const revealedSolutionCountRef = useRef<number>(0);
  const bufferGenRef = useRef<number>(0);

  useEffect(() => {
    const unsubStarted = useMazeStore.subscribe(
      (state) => state.hasStarted,
      (val: boolean) => {
        hasStartedRef.current = val;
      },
      { fireImmediately: true }
    );
    const unsubTrail = useMazeStore.subscribe(
      (state) => state.playerTrail,
      (val: [number, number][]) => {
        playerTrailRef.current = Array.isArray(val) ? val : [[0, 0]];
      },
      { fireImmediately: true }
    );
    const unsubPath = useMazeStore.subscribe(
      (state) => state.solutionPath,
      (val: [number, number][]) => {
        solutionPathRef.current = Array.isArray(val) ? val : [];
      },
      { fireImmediately: true }
    );
    const unsubCount = useMazeStore.subscribe(
      (state) => state.revealedSolutionCount,
      (val: number) => {
        revealedSolutionCountRef.current = val;
      },
      { fireImmediately: true }
    );

    return () => {
      unsubStarted();
      unsubTrail();
      unsubPath();
      unsubCount();
    };
  }, []);

  useEffect(() => {
    mazeSizeRef.current = mazeSize;
  }, [mazeSize]);

  useEffect(() => {
    const kruskal = new KruskalMaze(mazeSize[0], mazeSize[1]);
    const matrix = kruskal.transformMazeData([mazeSize[0], mazeSize[1]], kruskal.maze_data);
    levelMatrixRef.current = matrix;
    playerGridRef.current = [0, 0];
  }, [mazeSize, mazeSeed]);

  useEffect(() => {
    playerGridRef.current = [0, 0];
  }, [resetKey]);

  const rebuildMazeGeometry = useCallback((width: number, height: number) => {
    const matrix = levelMatrixRef.current;
    if (!Array.isArray(matrix) || matrix.length === 0 || width <= 0 || height <= 0) return;

    const rowSize = mazeSizeRef.current[0];
    const colSize = mazeSizeRef.current[1];

    const weight =
      rowSize > MAZE_CONFIG.DENSE_CELL_THRESHOLD
        ? MAZE_CONFIG.STROKE_WEIGHT_DENSE
        : MAZE_CONFIG.STROKE_WEIGHT_DEFAULT;
    const boundaryBuffer = weight * MAZE_CONFIG.BOUNDARY_BUFFER_MULTIPLIER;

    const availableWidth = Math.max(10, width - boundaryBuffer);
    const availableHeight = Math.max(10, height - boundaryBuffer);

    const offset = Math.max(
      MAZE_CONFIG.MIN_CELL_OFFSET,
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
        if (i % 2 === 0 && j % 2 === 1 && matrix[i]?.[j] === 1) {
          const cellX = startX + Math.floor((j + 1) / 2) * offset;
          const cellY = startY + Math.floor(i / 2) * offset;
          initialLines.push({
            x1: cellX,
            y1: cellY,
            x2: cellX,
            y2: cellY + offset,
          });
        } else if (i % 2 === 1 && j % 2 === 0 && matrix[i]?.[j] === 1) {
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
  }, []);

  const getContentDimensions = useCallback((el: HTMLElement) => {
    const style = window.getComputedStyle(el);
    const paddingX = parseFloat(style.paddingLeft || "0") + parseFloat(style.paddingRight || "0");
    const paddingY = parseFloat(style.paddingTop || "0") + parseFloat(style.paddingBottom || "0");

    const w = Math.max(0, Math.floor(el.clientWidth - paddingX));
    const h = Math.max(0, Math.floor(el.clientHeight - paddingY));

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
      const cachedImages = new Map<string, p5.Image>();

      const preloadStaticVariants = () => {
        for (let i = 0; i < 5; i++) {
          const hUri = getHedgeSvgVariant("horizontal", i);
          const vUri = getHedgeSvgVariant("vertical", i);
          p.loadImage(hUri, (img) => cachedImages.set(hUri, img));
          p.loadImage(vUri, (img) => cachedImages.set(vUri, img));
        }
      };

      const refreshBuffer = () => {
        const w = p.width;
        const h = p.height;
        if (w <= 0 || h <= 0) return;

        bufferGenRef.current += 1;
        const currentGen = bufferGenRef.current;

        rebuildMazeGeometry(w, h);

        if (mazeBuffer) {
          mazeBuffer.remove();
        }

        mazeBuffer = p.createGraphics(w, h);
        mazeBuffer.clear();

        const currentMazeSize = mazeSizeRef.current;
        const weight = Math.max(
          1,
          currentMazeSize[0] > MAZE_CONFIG.DENSE_CELL_THRESHOLD
            ? MAZE_CONFIG.STROKE_WEIGHT_DENSE
            : MAZE_CONFIG.STROKE_WEIGHT_DEFAULT
        );

        const lines = linesRef.current;
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          if (!l) continue;
          const isHorizontal = l.y1 === l.y2;
          const variantIndex = i % 5;

          if (isHorizontal) {
            const rawLen = Math.abs(l.x2 - l.x1);
            if (rawLen <= 0) continue;
            const segLength = Math.max(1, rawLen);
            const posX = Math.min(l.x1, l.x2);
            const posY = l.y1 - weight / 2;

            const svgUri = getHedgeSvgVariant("horizontal", variantIndex);
            const cached = cachedImages.get(svgUri);

            if (cached) {
              mazeBuffer.image(cached, posX, posY, segLength, weight);
            } else {
              p.loadImage(svgUri, (img: p5.Image) => {
                cachedImages.set(svgUri, img);
                if (currentGen === bufferGenRef.current && mazeBuffer) {
                  mazeBuffer.image(img, posX, posY, segLength, weight);
                }
              });
            }
          } else {
            const rawLen = Math.abs(l.y2 - l.y1);
            if (rawLen <= 0) continue;
            const segLength = Math.max(1, rawLen);
            const posX = l.x1 - weight / 2;
            const posY = Math.min(l.y1, l.y2);

            const svgUri = getHedgeSvgVariant("vertical", variantIndex);
            const cached = cachedImages.get(svgUri);

            if (cached) {
              mazeBuffer.image(cached, posX, posY, weight, segLength);
            } else {
              p.loadImage(svgUri, (img: p5.Image) => {
                cachedImages.set(svgUri, img);
                if (currentGen === bufferGenRef.current && mazeBuffer) {
                  mazeBuffer.image(img, posX, posY, weight, segLength);
                }
              });
            }
          }
        }
      };

      p.setup = () => {
        preloadStaticVariants();
        const { w, h } = getContentDimensions(el);
        const safeW = Math.max(10, w);
        const safeH = Math.max(10, h);

        const canvas = p.createCanvas(safeW, safeH);
        canvas.parent(el);
        canvas.style("display", "block");
        refreshBuffer();
      };

      p.draw = () => {
        p.clear();
        if (mazeBuffer) {
          p.image(mazeBuffer, 0, 0);
        }

        const { startX, startY, offset } = layoutMetricsRef.current;
        if (offset <= 0) return;

        const currentTrail = playerTrailRef.current;
        if (hasStartedRef.current && Array.isArray(currentTrail) && currentTrail.length > 1) {
          const trailDotRadius = Math.max(2, Math.floor(offset / 4.5));
          p.noStroke();
          p.fill(234, 179, 8);
          for (let idx = 0; idx < currentTrail.length - 1; idx++) {
            const pt = currentTrail[idx];
            if (!pt) continue;
            const [tc, tr] = pt;
            const tx = startX + tc * offset + Math.floor(offset / 2);
            const ty = startY + tr * offset + Math.floor(offset / 2);
            p.ellipse(tx, ty, trailDotRadius, trailDotRadius);
          }
        }

        const curSolution = solutionPathRef.current;
        const curCount = revealedSolutionCountRef.current;
        if (Array.isArray(curSolution) && curSolution.length > 0 && curCount > 0) {
          const dotRadius = Math.max(2, Math.floor(offset / 4));
          p.noStroke();
          p.fill(234, 179, 8);
          const limit = Math.min(curCount, curSolution.length);
          for (let idx = 0; idx < limit; idx++) {
            const spt = curSolution[idx];
            if (!spt) continue;
            const [sc, sr] = spt;
            const sx = startX + sc * offset + Math.floor(offset / 2);
            const sy = startY + sr * offset + Math.floor(offset / 2);
            p.ellipse(sx, sy, dotRadius, dotRadius);
          }
        }

        const currentGrid = playerGridRef.current;
        if (Array.isArray(currentGrid)) {
          const [col, row] = currentGrid;
          const px = startX + col * offset + Math.floor(offset / 2);
          const py = startY + row * offset + Math.floor(offset / 2);
          const playerSize = Math.max(
            MAZE_CONFIG.MIN_PLAYER_SIZE,
            Math.floor(offset / MAZE_CONFIG.PLAYER_SIZE_DIVISOR)
          );
          p.noStroke();
          p.fill(255);
          p.ellipse(px, py, playerSize, playerSize);
        }
      };

      p.windowResized = () => {
        const { w, h } = getContentDimensions(el);
        if (w > 0 && h > 0) {
          p.resizeCanvas(w, h);
          refreshBuffer();
        }
      };
    };

    const instance = new p5(sketch);
    p5InstanceRef.current = instance;

    const resizeObserver = new ResizeObserver(() => {
      if (!el) return;
      const { w, h } = getContentDimensions(el);
      if (w > 0 && h > 0 && (instance.width !== w || instance.height !== h)) {
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
      if (!hasStartedRef.current || isVictory || isGameOver || isSolving) return;

      const currentMazeSize = mazeSizeRef.current;
      const currentMatrix = levelMatrixRef.current;

      if (!Array.isArray(currentMatrix) || currentMatrix.length === 0) return;

      let [col, row] = playerGridRef.current;
      let moved = false;

      if (direction === "up") {
        if (row - 1 >= 0 && currentMatrix[2 * row - 1]?.[2 * col] !== 1) {
          row -= 1;
          moved = true;
        }
      } else if (direction === "down") {
        if (row + 1 < currentMazeSize[0] && currentMatrix[2 * row + 1]?.[2 * col] !== 1) {
          row += 1;
          moved = true;
        }
      } else if (direction === "left") {
        if (col - 1 >= 0 && currentMatrix[2 * row]?.[2 * col - 1] !== 1) {
          col -= 1;
          moved = true;
        }
      } else if (direction === "right") {
        if (col + 1 < currentMazeSize[1] && currentMatrix[2 * row]?.[2 * col + 1] !== 1) {
          col += 1;
          moved = true;
        }
      }

      if (moved) {
        playerGridRef.current = [col, row];
        recordPlayerMove(col, row);
        soundManager.playMoveSound();

        if (row === currentMazeSize[0] - 1 && col === currentMazeSize[1] - 1) {
          setVictory();
        }
      }
    },
    [isVictory, isGameOver, isSolving, recordPlayerMove, setVictory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStartedRef.current || isVictory || isGameOver || isSolving) return;
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") movePlayer("up");
      else if (key === "s" || key === "arrowdown") movePlayer("down");
      else if (key === "a" || key === "arrowleft") movePlayer("left");
      else if (key === "d" || key === "arrowright") movePlayer("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVictory, isGameOver, isSolving, movePlayer]);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!hasStartedRef.current || isVictory || isGameOver || isSolving) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [isVictory, isGameOver, isSolving]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!hasStartedRef.current || isVictory || isGameOver || isSolving || !touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > MAZE_CONFIG.TOUCH_SWIPE_THRESHOLD) movePlayer("right");
        else if (dx < -MAZE_CONFIG.TOUCH_SWIPE_THRESHOLD) movePlayer("left");
      } else {
        if (dy > MAZE_CONFIG.TOUCH_SWIPE_THRESHOLD) movePlayer("down");
        else if (dy < -MAZE_CONFIG.TOUCH_SWIPE_THRESHOLD) movePlayer("up");
      }
      touchStartRef.current = null;
    },
    [isVictory, isGameOver, isSolving, movePlayer]
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

  return {
    containerRef,
    isVictory,
    isGameOver,
    timeLeft,
    score,
    lastEarned,
    nextLevel,
    playAgain,
    levelMatrixRef,
  };
}
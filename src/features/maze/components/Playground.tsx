import p5 from "p5";
import { useEffect, useRef, useState, useCallback } from "react";
import { KruskalMaze } from "../algorithms/kruskal";
import type { LineCoord, PlaygroundProps } from "../types";

function Playground({ inputData, onVictory }: PlaygroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const [mazeSize, setMazeSize] = useState<[number, number]>([15, 15]);
  const [levelMatrix, setLevelMatrix] = useState<number[][]>([]);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const playerPosRef = useRef<[number, number]>([0, 0]);
  const mazeSizeRef = useRef<[number, number]>([15, 15]);
  const levelMatrixRef = useRef<number[][]>([]);
  const linesRef = useRef<LineCoord[]>([]);
  const layoutMetricsRef = useRef<{ startX: number; startY: number; offset: number }>({
    startX: 0,
    startY: 0,
    offset: 0,
  });

  useEffect(() => {
    mazeSizeRef.current = mazeSize;
  }, [mazeSize]);

  useEffect(() => {
    levelMatrixRef.current = levelMatrix;
  }, [levelMatrix]);

  useEffect(() => {
    if (inputData.length === 2) {
      setMazeSize(inputData[0]);
      onVictory(false);
    }
  }, [inputData, onVictory]);

  useEffect(() => {
    const kruskal = new KruskalMaze(mazeSize[0], mazeSize[1]);
    const matrix = kruskal.transformMazeData([mazeSize[0], mazeSize[1]], kruskal.maze_data);
    setLevelMatrix(matrix);
  }, [mazeSize, inputData]);

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

    const startX = Math.floor((width - totalWidth) / 2);
    const startY = Math.floor((height - totalHeight) / 2);

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
    if (!el || levelMatrix.length === 0) return;

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
  }, [levelMatrix, rebuildMazeGeometry, getContentDimensions]);

  const movePlayer = useCallback((direction: "up" | "down" | "left" | "right") => {
    const currentMazeSize = mazeSizeRef.current;
    const currentMatrix = levelMatrixRef.current;
    const { startX, startY, offset } = layoutMetricsRef.current;

    if (offset <= 0) return;

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
      onVictory(true);
      alert("Victory!");
    }
  }, [onVictory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") movePlayer("up");
      else if (key === "s" || key === "arrowdown") movePlayer("down");
      else if (key === "a" || key === "arrowleft") movePlayer("left");
      else if (key === "d" || key === "arrowright") movePlayer("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) movePlayer("right");
      else if (dx < -20) movePlayer("left");
    } else {
      if (dy > 20) movePlayer("down");
      else if (dy < -20) movePlayer("up");
    }
    setTouchStart(null);
  }, [touchStart, movePlayer]);

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
    />
  );
}

export default Playground;
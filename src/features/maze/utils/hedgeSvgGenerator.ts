function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface PrebakedStamp {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

function createHedgeStamp(isHoriz: boolean, variant: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const rand = pseudoRandom((variant + 1) * 7919);
  const steps = 24;
  const baseLen = 100;
  const baseThick = 2;

  canvas.width = isHoriz ? baseLen : baseThick;
  canvas.height = isHoriz ? baseThick : baseLen;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const stepSize = baseLen / steps;
  const maxJitter = 0.85;

  const topPoints: [number, number][] = [];
  const bottomPoints: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const pos = i * stepSize;
    const wave1 = Math.sin(i * 0.9 + variant * 1.3) * 0.45;
    const wave2 = Math.cos(i * 2.1 - variant * 0.7) * 0.25;
    const microNoise = (rand() - 0.5) * maxJitter;

    const noiseTop = microNoise + wave1 + wave2;
    const noiseBottom = (rand() - 0.5) * maxJitter - wave1 + wave2;

    if (isHoriz) {
      topPoints.push([pos, Math.max(-0.2, noiseTop)]);
      bottomPoints.push([pos, baseThick + Math.min(0.2, noiseBottom)]);
    } else {
      topPoints.push([Math.max(-0.2, noiseTop), pos]);
      bottomPoints.push([baseThick + Math.min(0.2, noiseBottom), pos]);
    }
  }

  const hedgePath = new Path2D();
  const snowPath = new Path2D();

  hedgePath.moveTo(topPoints[0][0], topPoints[0][1]);
  snowPath.moveTo(topPoints[0][0], topPoints[0][1]);

  for (let i = 1; i < topPoints.length; i++) {
    hedgePath.lineTo(topPoints[i][0], topPoints[i][1]);
    snowPath.lineTo(topPoints[i][0], topPoints[i][1]);
  }
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    hedgePath.lineTo(bottomPoints[i][0], bottomPoints[i][1]);
  }
  hedgePath.closePath();

  const grad = ctx.createLinearGradient(
    0,
    0,
    isHoriz ? 0 : baseThick,
    isHoriz ? baseThick : 0
  );
  grad.addColorStop(0, "#2e6f40");
  grad.addColorStop(0.5, "#225833");
  grad.addColorStop(1, "#133820");

  ctx.fillStyle = grad;
  ctx.fill(hedgePath);

  ctx.strokeStyle = "#eafaf1";
  ctx.lineWidth = 0.4;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.75;
  ctx.stroke(snowPath);

  return canvas;
}

const PREBAKED_STAMPS = {
  horizontal: [
    createHedgeStamp(true, 0),
    createHedgeStamp(true, 1),
    createHedgeStamp(true, 2),
    createHedgeStamp(true, 3),
    createHedgeStamp(true, 4),
    createHedgeStamp(true, 5),
    createHedgeStamp(true, 6),
    createHedgeStamp(true, 7),
    createHedgeStamp(true, 8),
    createHedgeStamp(true, 9),
  ],
  vertical: [
    createHedgeStamp(false, 0),
    createHedgeStamp(false, 1),
    createHedgeStamp(false, 2),
    createHedgeStamp(false, 3),
    createHedgeStamp(false, 4),
    createHedgeStamp(false, 5),
    createHedgeStamp(false, 6),
    createHedgeStamp(false, 7),
    createHedgeStamp(false, 8),
    createHedgeStamp(false, 9),
  ],
};

export function getHedgeStamp(
  orientation: "horizontal" | "vertical",
  variantIndex: number
): HTMLCanvasElement {
  const idx = Math.abs(variantIndex) % 10;
  return PREBAKED_STAMPS[orientation][idx];
}
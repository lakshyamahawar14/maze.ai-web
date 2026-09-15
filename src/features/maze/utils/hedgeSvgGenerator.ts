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
  const steps = 16;
  const baseLen = 100;
  const baseThick = 2;

  canvas.width = isHoriz ? baseLen : baseThick;
  canvas.height = isHoriz ? baseThick : baseLen;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const stepSize = baseLen / steps;
  const maxJitter = 0.45;

  const topPoints: [number, number][] = [];
  const bottomPoints: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const pos = i * stepSize;
    const wave = Math.sin(i * 0.75) * 0.25;
    const noiseTop = (rand() - 0.5) * maxJitter + wave;
    const noiseBottom = (rand() - 0.5) * maxJitter - wave;

    if (isHoriz) {
      topPoints.push([pos, Math.max(0, noiseTop)]);
      bottomPoints.push([pos, baseThick + Math.min(0, noiseBottom)]);
    } else {
      topPoints.push([Math.max(0, noiseTop), pos]);
      bottomPoints.push([baseThick + Math.min(0, noiseBottom), pos]);
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
  grad.addColorStop(0, "#1b4d2e");
  grad.addColorStop(0.5, "#143922");
  grad.addColorStop(1, "#0a1d12");

  ctx.fillStyle = grad;
  ctx.fill(hedgePath);

  ctx.strokeStyle = "#dbeafe";
  ctx.lineWidth = 0.35;
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
  ],
  vertical: [
    createHedgeStamp(false, 0),
    createHedgeStamp(false, 1),
    createHedgeStamp(false, 2),
    createHedgeStamp(false, 3),
    createHedgeStamp(false, 4),
  ],
};

export function getHedgeStamp(
  orientation: "horizontal" | "vertical",
  variantIndex: number
): HTMLCanvasElement {
  const idx = Math.abs(variantIndex) % 5;
  return PREBAKED_STAMPS[orientation][idx];
}
function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildStaticSvg(isHoriz: boolean, variant: number): string {
  const rand = pseudoRandom((variant + 1) * 7919);
  const steps = 16;
  const length = 100;
  const thickness = 2;
  const stepSize = length / steps;
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
      bottomPoints.push([pos, thickness + Math.min(0, noiseBottom)]);
    } else {
      topPoints.push([Math.max(0, noiseTop), pos]);
      bottomPoints.push([thickness + Math.min(0, noiseBottom), pos]);
    }
  }

  let basePolygonD = `M ${topPoints[0][0].toFixed(2)} ${topPoints[0][1].toFixed(2)} `;
  for (let i = 1; i < topPoints.length; i++) {
    basePolygonD += `L ${topPoints[i][0].toFixed(2)} ${topPoints[i][1].toFixed(2)} `;
  }
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    basePolygonD += `L ${bottomPoints[i][0].toFixed(2)} ${bottomPoints[i][1].toFixed(2)} `;
  }
  basePolygonD += "Z";

  let snowPathD = `M ${topPoints[0][0].toFixed(2)} ${topPoints[0][1].toFixed(2)} `;
  for (let i = 1; i < topPoints.length; i++) {
    snowPathD += `L ${topPoints[i][0].toFixed(2)} ${topPoints[i][1].toFixed(2)} `;
  }

  const viewBox = isHoriz ? "0 0 100 2" : "0 0 2 100";
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hedgeG_${variant}_${isHoriz ? "h" : "v"}" x1="0%" y1="0%" x2="${isHoriz ? "0%" : "100%"}" y2="${isHoriz ? "100%" : "0%"}">
          <stop offset="0%" stop-color="#1b4d2e"/>
          <stop offset="50%" stop-color="#143922"/>
          <stop offset="100%" stop-color="#0a1d12"/>
        </linearGradient>
      </defs>
      <path d="${basePolygonD}" fill="url(#hedgeG_${variant}_${isHoriz ? "h" : "v"})" />
      <path d="${snowPathD}" stroke="#dbeafe" stroke-width="0.35" stroke-linecap="round" opacity="0.75" fill="none" />
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

const HEDGE_SVG_CACHE = {
  horizontal: [
    buildStaticSvg(true, 0),
    buildStaticSvg(true, 1),
    buildStaticSvg(true, 2),
    buildStaticSvg(true, 3),
    buildStaticSvg(true, 4),
  ] as const,
  vertical: [
    buildStaticSvg(false, 0),
    buildStaticSvg(false, 1),
    buildStaticSvg(false, 2),
    buildStaticSvg(false, 3),
    buildStaticSvg(false, 4),
  ] as const,
} as const;

export function getHedgeSvgVariant(
  orientation: "horizontal" | "vertical",
  variantIndex: number
): string {
  const idx = Math.abs(variantIndex) % 5;
  return HEDGE_SVG_CACHE[orientation][idx];
}
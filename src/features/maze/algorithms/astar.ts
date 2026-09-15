interface Node {
  r: number;
  c: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export function findAStarPath(
  matrix: number[][],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): [number, number][] {
  const openSet: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = {
    r: startRow,
    c: startCol,
    g: 0,
    h: Math.abs(startRow - endRow) + Math.abs(startCol - endCol),
    f: Math.abs(startRow - endRow) + Math.abs(startCol - endCol),
    parent: null,
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    const current = openSet.splice(lowestIndex, 1)[0];
    const key = `${current.r},${current.c}`;

    if (current.r === endRow && current.c === endCol) {
      const path: [number, number][] = [];
      let temp: Node | null = current;
      while (temp) {
        path.push([temp.c, temp.r]);
        temp = temp.parent;
      }
      return path.reverse();
    }

    closedSet.add(key);

    const neighbors: [number, number][] = [
      [current.r - 1, current.c],
      [current.r + 1, current.c],
      [current.r, current.c - 1],
      [current.r, current.c + 1],
    ];

    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nc < 0 || nr > endRow || nc > endCol) continue;
      if (closedSet.has(`${nr},${nc}`)) continue;

      if (nr < current.r && matrix[2 * current.r - 1]?.[2 * current.c] === 1) continue;
      if (nr > current.r && matrix[2 * current.r + 1]?.[2 * current.c] === 1) continue;
      if (nc < current.c && matrix[2 * current.r]?.[2 * current.c - 1] === 1) continue;
      if (nc > current.c && matrix[2 * current.r]?.[2 * current.c + 1] === 1) continue;

      const gScore = current.g + 1;
      let neighbor = openSet.find((node) => node.r === nr && node.c === nc);

      if (!neighbor) {
        const h = Math.abs(nr - endRow) + Math.abs(nc - endCol);
        neighbor = {
          r: nr,
          c: nc,
          g: gScore,
          h,
          f: gScore + h,
          parent: current,
        };
        openSet.push(neighbor);
      } else if (gScore < neighbor.g) {
        neighbor.g = gScore;
        neighbor.f = gScore + neighbor.h;
        neighbor.parent = current;
      }
    }
  }

  return [];
}
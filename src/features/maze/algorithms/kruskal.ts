export type Point = [number, number];
export type Edge = [Point, Point];
export type WeightedEdge = [number, Point, Point];
export type LineSegment = [[number, number], [number, number]];

export class KruskalMaze {
  colSize: number;
  rowSize: number;
  nodes: Point[];
  edges: Edge[];
  maze_edges: Edge[];
  legal_edges: Record<string, Point[]>;
  entry_exit_points: Point[];
  entry_exit_edges: LineSegment[];
  maze_data: Edge[];

  constructor(colSize: number, rowSize: number) {
    this.colSize = colSize;
    this.rowSize = rowSize;
    const [nodes, edges] = this.createGraph();
    this.nodes = nodes;
    this.edges = edges;
    this.maze_edges = this.generateGrid();
    this.legal_edges = this.getLegalTraversalEdges();
    const [entryExitPoints, entryExitEdges] = this.getEntryExits();
    this.entry_exit_points = entryExitPoints;
    this.entry_exit_edges = entryExitEdges;
    this.maze_data = this.getMazeWalls();
  }

  private getRandomEdgeWeights(): WeightedEdge[] {
    const edgeWeights: WeightedEdge[] = [];
    const len = this.edges.length;
    for (let i = 0; i < len; i++) {
      const [x, y] = this.edges[i];
      const weight = Math.random() < 0.2
        ? Math.floor(Math.random() * 4) + 5
        : Math.floor(Math.random() * 4) + 1;
      edgeWeights.push([weight, x, y]);
    }
    return edgeWeights;
  }

  private getLegalTraversalEdges(): Record<string, Point[]> {
    const legalEdges: Record<string, Point[]> = {};
    const obstacles: Point[] = [];

    for (let i = 0; i < this.maze_edges.length; i++) {
      const [x, y] = this.maze_edges[i];
      const isObstacle = obstacles.some(([ox, oy]) => x[0] === ox && x[1] === oy);
      if (isObstacle) continue;

      const keyX = `${x[0]},${x[1]}`;
      const keyY = `${y[0]},${y[1]}`;

      if (!legalEdges[keyX]) legalEdges[keyX] = [y];
      else legalEdges[keyX].push(y);

      if (!legalEdges[keyY]) legalEdges[keyY] = [x];
      else legalEdges[keyY].push(x);

      if (Math.random() < 0.2) obstacles.push(x);
    }
    return legalEdges;
  }

  private createGraph(): [Point[], Edge[]] {
    const x = this.colSize;
    const y = this.rowSize;
    const nodes: Point[] = [];
    const edges: Edge[] = [];

    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        const u: Point = [i, j];
        nodes.push(u);
        if (i > 0) edges.push([u, [i - 1, j]]);
        if (i < x - 1) edges.push([u, [i + 1, j]]);
        if (j > 0) edges.push([u, [i, j - 1]]);
        if (j < y - 1) edges.push([u, [i, j + 1]]);
      }
    }
    return [nodes, edges];
  }

  private generateGrid(): Edge[] {
    const edgeWeights = this.getRandomEdgeWeights();
    const clusters = new Map<string, string>();
    const ranks = new Map<string, number>();
    const solution: Edge[] = [];

    for (let i = 0; i < this.nodes.length; i++) {
      const key = `${this.nodes[i][0]},${this.nodes[i][1]}`;
      clusters.set(key, key);
      ranks.set(key, 0);
    }

    const find = (u: string): string => {
      let root = u;
      while (root !== clusters.get(root)) {
        root = clusters.get(root)!;
      }
      let curr = u;
      while (curr !== root) {
        const next = clusters.get(curr)!;
        clusters.set(curr, root);
        curr = next;
      }
      return root;
    };

    const union = (xKey: string, yKey: string): void => {
      const rootX = find(xKey);
      const rootY = find(yKey);
      if (rootX === rootY) return;

      const rankX = ranks.get(rootX)!;
      const rankY = ranks.get(rootY)!;

      if (rankX > rankY) {
        clusters.set(rootY, rootX);
      } else {
        clusters.set(rootX, rootY);
        if (rankX === rankY) ranks.set(rootY, rankY + 1);
      }
    };

    const totalEdges = edgeWeights.length;
    for (let i = 0; i < totalEdges; i++) {
      if (edgeWeights.length === 0) break;
      const randomIndex = Math.floor(Math.random() * edgeWeights.length);
      const [, x, y] = edgeWeights.splice(randomIndex, 1)[0];
      const keyX = `${x[0]},${x[1]}`;
      const keyY = `${y[0]},${y[1]}`;

      if (find(keyX) !== find(keyY)) {
        solution.push([x, y]);
        union(keyX, keyY);
      }
    }
    return solution;
  }

  private getEdgeLocations(): LineSegment[] {
    const edgeData: LineSegment[] = [];
    const len = this.maze_edges.length;

    for (let i = 0; i < len; i++) {
      const [e1, e2] = this.maze_edges[i];
      if (e1[0] === e2[0]) {
        if (e1[1] > e2[1]) {
          edgeData.push([[e1[1], e1[1]], [e1[0] + 1, e1[0]]]);
        } else {
          edgeData.push([[e1[1] + 1, e1[1] + 1], [e1[0], e1[0] + 1]]);
        }
      }
      if (e1[1] === e2[1]) {
        if (e1[0] > e2[0]) {
          edgeData.push([[e1[1], e1[1] + 1], [e1[0], e1[0]]]);
        } else {
          edgeData.push([[e1[1] + 1, e1[1]], [e1[0] + 1, e1[0] + 1]]);
        }
      }
    }

    edgeData.push(...this.entry_exit_edges);
    return edgeData;
  }

  private isEdgeInData(edge: LineSegment, edgeData: LineSegment[]): boolean {
    const [[ax1, ax2], [ay1, ay2]] = edge;
    for (let i = 0; i < edgeData.length; i++) {
      const [[bx1, bx2], [by1, by2]] = edgeData[i];
      if (ax1 === bx1 && ax2 === bx2 && ay1 === by1 && ay2 === by2) {
        return true;
      }
    }
    return false;
  }

  private getMazeWalls(): Edge[] {
    const edgeData = this.getEdgeLocations();
    const mazeData: Edge[] = [];

    for (let i = 0; i < this.rowSize; i++) {
      for (let j = 0; j < this.colSize; j++) {
        const topEdge: LineSegment = [[j, j + 1], [i, i]];
        const topEdgeRev: LineSegment = [[j + 1, j], [i, i]];
        if (!this.isEdgeInData(topEdge, edgeData) && !this.isEdgeInData(topEdgeRev, edgeData)) {
          mazeData.push([[j, i], [j + 1, i]]);
        }

        const bottomEdge: LineSegment = [[j + 1, j], [i + 1, i + 1]];
        const bottomEdgeRev: LineSegment = [[j, j + 1], [i + 1, i + 1]];
        if (!this.isEdgeInData(bottomEdge, edgeData) && !this.isEdgeInData(bottomEdgeRev, edgeData)) {
          mazeData.push([[j + 1, i + 1], [j, i + 1]]);
        }

        const rightEdge: LineSegment = [[j + 1, j + 1], [i, i + 1]];
        const rightEdgeRev: LineSegment = [[j + 1, j + 1], [i + 1, i]];
        if (!this.isEdgeInData(rightEdge, edgeData) && !this.isEdgeInData(rightEdgeRev, edgeData)) {
          mazeData.push([[j + 1, i], [j + 1, i + 1]]);
        }

        const leftEdge: LineSegment = [[j, j], [i + 1, i]];
        const leftEdgeRev: LineSegment = [[j, j], [i, i + 1]];
        if (!this.isEdgeInData(leftEdge, edgeData) && !this.isEdgeInData(leftEdgeRev, edgeData)) {
          mazeData.push([[j, i], [j, i + 1]]);
        }
      }
    }
    return mazeData;
  }

  private getEntryExits(): [Point[], LineSegment[]] {
    const p1: Point = [this.rowSize - 1, 0];
    const p2: Point = [0, this.rowSize - 1];
    const entryExitEdges: LineSegment[] = [
      [[p1[1], p1[1] + 1], [p1[0], p1[0]]],
      [[p2[1], p2[1]], [p2[0] + 1, p2[0]]]
    ];
    return [[p1, p2], entryExitEdges];
  }

  transformMazeData(size: [number, number], mazeData: Edge[]): number[][] {
    const row = 2 * size[0] - 1;
    const col = 2 * size[1] - 1;
    const levelMatrix: number[][] = Array.from({ length: row }, () => new Array(col).fill(0));

    for (let i = 0; i < mazeData.length; i++) {
      const [p1, p2] = mazeData[i];
      const x1 = p1[0];
      const y1 = p1[1];
      const x2 = p2[0];
      const y2 = p2[1];

      if (x1 === x2 && x1 === 0) continue;
      if (y1 === y2 && y1 === size[0]) continue;
      if (x1 === x2 && x1 === size[1]) continue;
      if (y1 === y2 && y1 === 0) continue;

      if (x1 === x2) {
        const r = 2 * (size[1] - Math.max(y1, y2));
        const c = 2 * x1 - 1;
        if (r >= 0 && r < row && c >= 0 && c < col) {
          levelMatrix[r][c] = 1;
        }
      } else {
        const r = 2 * (size[0] - y1) - 1;
        const c = 2 * Math.min(x1, x2);
        if (r >= 0 && r < row && c >= 0 && c < col) {
          levelMatrix[r][c] = 1;
        }
      }
    }

    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        if (i % 2 === 0 && j % 2 === 0) {
          levelMatrix[i][j] = 0;
        } else if (i % 2 === 1 && j % 2 === 1) {
          levelMatrix[i][j] = -1;
        }
      }
    }
    return levelMatrix;
  }
}
import p5 from "p5";
import { useEffect, useRef, useState, useCallback } from "react";
import Input from "./Input";

class KruskalMaze {
  constructor(colSize, rowSize) {
    this.colSize = colSize;
    this.rowSize = rowSize;
    [this.nodes, this.edges] = this.createGraph();
    this.maze = this.generateGrid();
    this.maze_edges = this.maze;
    this.legal_edges = this.getLegalTraversalEdges();
    this.entry_exit_points = [];
    this.entry_exit_edges = [];
    [this.entry_exit_points, this.entry_exit_edges] = this.getEntryExits();
    this.maze_data = this.getMazeWalls();
  }

  getRandomEdgeWeights() {
    let edge_weights = [];
    for (let [x, y] of this.edges) {
      let weight = Math.floor(Math.random() * 4) + 1;
      edge_weights.push([weight, x, y]);
    }
    return edge_weights;
  }

  getLegalTraversalEdges() {
    let legal_edges = {};
    for (let s of this.maze) {
      let [x, y] = s;
      if (!(x in legal_edges)) {
        legal_edges[x] = [y];
      } else {
        legal_edges[x].push(y);
      }
      if (!(y in legal_edges)) {
        legal_edges[y] = [x];
      } else {
        legal_edges[y].push(x);
      }
    }
    return legal_edges;
  }

  createGraph() {
    let x = this.colSize;
    let y = this.rowSize;
    let nodes = new Set();
    let edges = new Set();
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        nodes.add([i, j]);
        if (i > 0) {
          let e1 = [i - 1, j];
          edges.add([[i, j], e1]);
        }
        if (i < x - 1) {
          let e2 = [i + 1, j];
          edges.add([[i, j], e2]);
        }
        if (j > 0) {
          let e3 = [i, j - 1];
          edges.add([[i, j], e3]);
        }
        if (j < y - 1) {
          let e4 = [i, j + 1];
          edges.add([[i, j], e4]);
        }
      }
    }
    return [nodes, edges];
  }

  generateGrid() {
    let edgeWeights = this.getRandomEdgeWeights();
    let clusters = {};
    let ranks = {};
    let solution = new Set();
  
    // Initialize clusters and ranks for each node
    for (let node of this.nodes) {
      clusters[node] = node;
      ranks[node] = 0;
    }
  
    function find(u) {
      if (clusters[u] !== u) {
        clusters[u] = find(clusters[u]);
      }
      return clusters[u];
    }
  
    function union(x, y) {
      [x, y] = [find(x), find(y)];
      if (ranks[x] > ranks[y]) {
        clusters[y] = x;
      } else {
        clusters[x] = y;
      }
      if (ranks[x] === ranks[y]) {
        ranks[y] += 1;
      }
    }
  
    // Sort the edges by weight in ascending order
    edgeWeights.sort((a, b) => a[0] - b[0]);
  
    // Apply Kruskal's algorithm to find minimum spanning tree
    for (let [, x, y] of edgeWeights) {
      if (x !== y) {
        if (find(x) !== find(y)) {
          // Add edge to solution
          solution.add([x, y]);
          union(x, y);
        }
      }
    }
  
    return solution;
  }
  

  getEdgeLocations() {
    let edge_data = [];
    for (let edge of this.maze_edges) {
      let e1 = edge[0];
      let e2 = edge[1];
      if (e1[0] === e2[0]) {
        if (e1[1] > e2[1]) {
          edge_data.push([
            [e1[1], e1[1]],
            [e1[0] + 1, e1[0]],
          ]);
        } else {
          edge_data.push([
            [e1[1] + 1, e1[1] + 1],
            [e1[0], e1[0] + 1],
          ]);
        }
      }
      if (e1[1] === e2[1]) {
        if (e1[0] > e2[0]) {
          edge_data.push([
            [e1[1], e1[1] + 1],
            [e1[0], e1[0]],
          ]);
        } else {
          edge_data.push([
            [e1[1] + 1, e1[1]],
            [e1[0] + 1, e1[0] + 1],
          ]);
        }
      }
    }
    edge_data.push(...this.entry_exit_edges);
    return edge_data;
  }

  getMazeWalls() {
    var edge_data = this.getEdgeLocations();
    var maze_data = [];
  
    for (var i = 0; i < this.rowSize; i++) {
      for (var j = 0; j < this.colSize; j++) {
        var top_edge = [[j, j + 1], [i, i]];
        if (!this.isEdgeInData(top_edge, edge_data) && !this.isEdgeInData([[j + 1, j], [i, i]], edge_data)) {
          maze_data.push([[j, i], [j + 1, i]]);
        }
  
        var bottom_edge = [[j + 1, j], [i + 1, i + 1]];
        if (!this.isEdgeInData(bottom_edge, edge_data) && !this.isEdgeInData([[j, j + 1], [i + 1, i + 1]], edge_data)) {
          maze_data.push([[j + 1, i + 1], [j, i + 1]]);
        }
  
        var right_edge = [[j + 1, j + 1], [i, i + 1]];
        if (!this.isEdgeInData(right_edge, edge_data) && !this.isEdgeInData([[j + 1, j + 1], [i + 1, i]], edge_data)) {
          maze_data.push([[j + 1, i], [j + 1, i + 1]]);
        }
  
        var left_edge = [[j, j], [i + 1, i]];
        if (!this.isEdgeInData(left_edge, edge_data) && !this.isEdgeInData([[j, j], [i, i + 1]], edge_data)) {
          maze_data.push([[j, i], [j, i + 1]]);
        }
      }
    }
  
    return maze_data;
  }
  
  isEdgeInData(edge, edge_data) {
    for (var i = 0; i < edge_data.length; i++) {
      if (this.isEqual(edge, edge_data[i])) {
        return true;
      }
    }
    return false;
  }
  
  isEqual(arr1, arr2){
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }
  

  getEntryExits() {
    let p1 = [this.rowSize - 1, 0];
    let p2 = [0, this.rowSize - 1];
    this.entry_exit_points = [p1, p2];
    let entry_exit_edge_data = [];
    entry_exit_edge_data.push([
      [p1[1], p1[1] + 1],
      [p1[0], p1[0]],
    ]);
    entry_exit_edge_data.push([
      [p2[1], p2[1]],
      [p2[0] + 1, p2[0]],
    ]);
    return [this.entry_exit_points, entry_exit_edge_data];
  }

  transformMazeData(size, mazeData) {
    let row = 2 * size[0] - 1;
    let col = 2 * size[1] - 1;
    let levelMatrix = [];
    for (let i = 0; i < row; i++) {
      levelMatrix.push(new Array(col).fill(0));
    }
    for (let i = 0; i < mazeData.length; i++) {
      let edge = mazeData[i];
      let x1 = edge[0][0];
      let y1 = edge[0][1];
      let x2 = edge[1][0];
      let y2 = edge[1][1];

      if (x1 === x2 && x1 === 0) {
        continue;
      } else if (y1 === y2 && y1 === size[0]) {
        continue;
      } else if (x1 === x2 && x1 === size[1]) {
        continue;
      } else if (y1 === y2 && y1 === 0) {
        continue;
      } else {
        if (x1 === x2) {
          let x = 2 * (size[1] - Math.max(y1, y2));
          let y = 2 * x1 - 1;
          levelMatrix[x][y] = 1;
        } else {
          let x = 2 * (size[0] - y1) - 1;
          let y = 2 * Math.min(x1, x2);
          levelMatrix[x][y] = 1;
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

function Playground() {
  const canvasRef = useRef(null);
  const [mazeSize, setMazeSize] = useState([15, 15]);
  const [lines, setLines] = useState([]);
  const [level_matrix, setLevelMatrix] = useState([]);
  const [requestID, setRequestID] = useState([]);
  

  const generateMaze = (height, width) => {
    const kruskalMaze = new KruskalMaze(height, width);
    const mazeData = kruskalMaze.maze_data;

    const levelMatrix = kruskalMaze.transformMazeData(
      [height, width],
      mazeData
    );

    setLevelMatrix(levelMatrix);
  };

  const addLines = useCallback(() => {
    const X = canvasRef.current.offsetWidth;
    const Y = canvasRef.current.offsetHeight;
    if (level_matrix.length === 0) {
      return () => {};
    }
    const row_size = (level_matrix.length + 1) / 2;
    const col_size = (level_matrix[0].length + 1) / 2;
    const offset = 18;
    const rows = 2 * row_size - 1;
    const cols = 2 * col_size - 1;

    var initialLines = [];

    var x = X / 2 - (offset / 2) * col_size;
    var y = Y / 2 - offset - 250;

    var i;
    for (i = 0; i < col_size; ++i) {
      initialLines.push({ x1: x, y1: y, x2: x + offset, y2: y });
      x += offset;
    }
    for (i = 0; i < row_size; ++i) {
      initialLines.push({ x1: x, y1: y, x2: x, y2: y + offset });
      y += offset;
    }
    for (i = 0; i < col_size; ++i) {
      initialLines.push({ x1: x, y1: y, x2: x - offset, y2: y });
      x -= offset;
    }
    for (i = 0; i < row_size; ++i) {
      initialLines.push({ x1: x, y1: y, x2: x, y2: y - offset });
      y -= offset;
    }

    for (i = 0; i < rows; ++i) {
      if (i % 2 === 0) {
        x += offset;
      }
      var j;
      for (j = 0; j < cols; ++j) {
        if (i % 2 === 0 && j % 2 === 0) {
          continue;
        }
        if (i % 2 === 1 && j % 2 === 1) {
          continue;
        }
        if (i % 2 === 0 && j % 2 === 1 && level_matrix[i][j] === 1) {
          initialLines.push({ x1: x, y1: y, x2: x, y2: y + offset });
        } else if (i % 2 === 1 && j % 2 === 0 && level_matrix[i][j] === 1) {
          initialLines.push({ x1: x, y1: y, x2: x + offset, y2: y });
        }
        x += offset;
      }
      if (i % 2 === 0) {
        y += offset;
      }
      x -= col_size * offset;
    }

    setLines(initialLines);
  }, [level_matrix]);

  useEffect(() => {
    generateMaze(mazeSize[0], mazeSize[1]);
  }, [mazeSize, requestID]);

  useEffect(() => {
    addLines();
  }, [addLines]);

  useEffect(() => {
    const sketch = (p) => {
      let canvas;

      p.setup = () => {
        canvas = p.createCanvas(
          canvasRef.current.offsetWidth,
          canvasRef.current.offsetHeight
        );
        canvas.parent(canvasRef.current);
        p.background(0, 0, 0, 0);
      };

      p.draw = () => {
        p.background(0, 0, 0, 0);
        drawLinesOnCanvas();
      };

      const drawLinesOnCanvas = () => {
        p.stroke(0, 255, 75);
        p.strokeWeight(3);
        for (let i = 0; i < lines.length; i++) {
          const { x1, y1, x2, y2 } = lines[i];
          p.line(x1, y1, x2, y2);
        }
      };
    };
    if (lines.length === 0) {
      return () => {};
    }
    const p5Instance = new p5(sketch);

    // Cleanup function to remove the p5 instance
    return () => {
      p5Instance.remove();
    };
  }, [lines]);

  const handleInputChange = (data) => {
    setRequestID(data[1])
    setMazeSize(data[0]);
  };

  return (
    <div
      ref={canvasRef}
      className="playground flex-col h-[85vh] h-max-[85vh] w-full w-max-full flex justify-center items-center absolute"
    >
      <Input onInputChange={handleInputChange}/>
    </div>
  );
}

export default Playground;

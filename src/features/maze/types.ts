export type MazeRequestData = [[number, number], number];

export interface ControlsProps {
  onInputChange: (data: MazeRequestData) => void;
  isVictory: boolean;
}

export interface PlaygroundProps {
  inputData: MazeRequestData | [];
  onVictory: (victoryState: boolean) => void;
}

export interface LineCoord {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type Point = [number, number];
export type Edge = [Point, Point];
export type WeightedEdge = [number, Point, Point];
export type LineSegment = [[number, number], [number, number]];

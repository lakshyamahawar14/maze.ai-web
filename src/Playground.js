import p5 from "p5";
import { useEffect, useRef, useState, useCallback } from "react";

function Playground() {
  const canvasRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [level_matrix, setLevelMatrix] = useState([]);
  const [mazeSize, setMazeSize] = useState([25, 25]);

  const generateMaze = (height, width) => {
    const rows = 2*height-1
    const cols = 2*width-1
    const temp_matrix =  Array(rows).fill(0).map(() => Array(cols).fill(0));
    var i;
    for(i=0; i<rows; ++i){
      var j;
      for(j=0; j<cols; ++j){
        if(i%2 === 0 && j%2 === 0){
          temp_matrix[i][j] = 0
        }
        else if(i%2 === 1 && j%2 === 1){
          temp_matrix[i][j] = -1
        }
        else{
          temp_matrix[i][j] = Math.round(Math.random())
        }
      }
    }
    setLevelMatrix(temp_matrix)
  }

  const addLines = useCallback(() => {
    const X = canvasRef.current.offsetWidth
    const Y = canvasRef.current.offsetHeight
    if(level_matrix.length === 0){
      return () => {
        
      }
    }
    const row_size = (level_matrix.length+1)/2
    const col_size = (level_matrix[0].length+1)/2
    const offset = 18
    const rows = 2*row_size-1
    const cols = 2*col_size-1

    var initialLines = []

    var x = X/2 - (offset/2)*col_size
    var y = Y/2 - offset - 250

    var i;
    for(i=0; i<col_size; ++i){
      initialLines.push({ x1:x, y1:y, x2:x+offset, y2:y });
      x += offset;
    }
    for(i=0; i<row_size; ++i){
      initialLines.push({ x1:x, y1:y, x2:x, y2:y+offset });
      y += offset;
    }
    for(i=0; i<col_size; ++i){
      initialLines.push({ x1:x, y1:y, x2:x-offset, y2:y });
      x -= offset;
    }
    for(i=0; i<row_size; ++i){
      initialLines.push({ x1:x, y1:y, x2:x, y2:y-offset });
      y -= offset;
    }

    for(i=0; i<rows; ++i){
      if(i%2 === 0){
        x += offset
      }
      var j
      for(j=0; j<cols; ++j){
        if(i%2 === 0 && j%2 === 0){
          continue
        }
        if(i%2 === 1 && j%2 === 1){
          continue
        }
        if(i%2 === 0 && j%2 === 1 && level_matrix[i][j] === 1){
          initialLines.push({ x1:x, y1:y, x2:x, y2:y+offset });
        }
        else if(i%2 === 1 && j%2 === 0 && level_matrix[i][j] === 1){
          initialLines.push({ x1:x, y1:y, x2:x+offset, y2:y });
        }
        x += offset
      }
      if(i%2 === 0){
        y += offset
      }
      x -= col_size*offset
    }
    
    setLines(initialLines);
  }, [level_matrix]);

  useEffect(() => {
    generateMaze(mazeSize[0], mazeSize[1])
  }, [mazeSize]);

  useEffect(() => {
    addLines()
  }, [addLines]);

  useEffect(() => {
    const sketch = (p) => {
      let canvas;

      p.setup = () => {
        canvas = p.createCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        canvas.parent(canvasRef.current);
        p.background(0,0,0,0);
      };

      p.draw = () => {
        p.background(0,0,0,0);
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
    if(lines.length === 0){
      return () => {

      }
    }
    const p5Instance = new p5(sketch);

    // Cleanup function to remove the p5 instance
    return () => {
      p5Instance.remove();
    };
  }, [lines]);

  const handleClick = () => {
    const inputSize = document.getElementById('mazeSize').value
    if(inputSize === ''){
      alert('Please Fill Maze Size!')
      return
    }
    setMazeSize([inputSize, inputSize])
    console.log(mazeSize)
  }

  return (
    <div
      ref={canvasRef}
      className="playground flex-col h-[85vh] h-max-[85vh] w-full w-max-full flex justify-center items-center absolute"
    >
    <div className='input mt-[50px]'>
        <label htmlFor='mazeSize'>
            Maze Size:
            <input type='text' className='px-2 mx-4 outline-none w-[100px] bg-transparent border-b-2 border-[rgb(0,255,75)]' id='mazeSize' name='mazeSize' maxLength={2} placeholder='e.g. 25'>
            </input>
        </label>
        <input type='button' value={'Generate'} className='cursor-pointer bg-[rgb(0,255,75)] text-[rgb(30,30,30)] px-2 rounded-sm hover:bg-[rgb(150,250,125)]' onClick={handleClick}></input>
    </div>
    </div>
  );
}

export default Playground;
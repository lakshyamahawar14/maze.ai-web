import React from "react";
import { useState, useEffect } from "react";

function Input(props) {
  const [mazeSize, setMazeSize] = useState([15, 15]);
  const [tempMazeSize, setTempMazeSize] = useState(mazeSize);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  

  useEffect(() => {
    const storedScore = localStorage.getItem("highscore");
    if(storedScore != null){
      setHighscore(parseInt(storedScore))
    }
    else{
      localStorage.setItem("highscore", (0).toString());
      setHighscore(0);
    }
  }, [highscore]);

  useEffect(() => {
    const storedScore = localStorage.getItem("highscore");
    if (parseInt(storedScore) < score) {
      console.log('set kardis')
      localStorage.setItem("highscore", score.toString());
      setHighscore(score)
    }
  }, [score]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => {
        const seconds = parseInt(prevTime, 10);
        const newSeconds = seconds + 1;
        return newSeconds
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    if (tempMazeSize[0] === 0) {
      alert("Please Give Valid Maze Size!");
      return
    }
    setMazeSize(tempMazeSize);
    setTime(0)
    const requestID = Math.floor(Math.random() * 10000) + 1;
    props.onInputChange([tempMazeSize, requestID]);
  };

  useEffect(() => {
    if(props.isVictory === true){
      setScore(prevScore => prevScore + mazeSize[0]);
    }
  }, [props.isVictory, mazeSize]);

  const handleChange = () => {
    const inputSize = document.getElementById("mazeSize").value;
    if (inputSize === "" || isNaN(inputSize) === true || isNaN(parseInt(inputSize)) === true) {
      setTempMazeSize([0, 0]);
    } else {
      setTempMazeSize([parseInt(inputSize), parseInt(inputSize)]);
    }
  };

  return (
    <div className="input h-[15vh] flex flex-col justify-center items-center">
      <div className="flex mx-2 items-center justify-center">
        <label htmlFor="mazeSize">
          Maze Size:
          <input
            type="text"
            className="px-2 mx-4 outline-none w-[75px] bg-transparent border-b-2 border-[rgb(0,255,75)]"
            id="mazeSize"
            name="mazeSize"
            value={tempMazeSize[0]}
            onChange={handleChange}
            maxLength={2}
            placeholder="e.g. 25"
          ></input>
        </label>
        <input
          type="button"
          value={"Generate"}
          className="cursor-pointer bg-[rgb(38,143,29)] outline-none font-bold px-2 rounded hover:bg-[rgb(27,110,6)] text-[#000000]"
          onClick={handleClick}
        ></input>
      </div>
      <div className="flex">
        <div
          id="time"
          className="px-2 my-[15px] text-center rounded font-bold bg-[rgb(255,89,89)] text-[#000000]"
        >
          {time} sec
        </div>
        <div
          id="score"
          className="px-2 ml-2 my-[15px] text-center   rounded font-bold bg-[rgb(145,8,134)] text-[#000000]"
        >
          Score: {score}
        </div>
        <div
          id="highscore"
          className="px-2 ml-2 my-[15px] text-center rounded font-bold bg-[rgb(17,144,172)] text-[#000000]"
        >
          Highscore: {highscore}
        </div>
      </div>
    </div>
  );
}

export default Input;

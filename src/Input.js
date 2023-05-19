import React from "react";
import { useState, useEffect } from "react";

function Input(props) {
  const [mazeSize, setMazeSize] = useState([15, 15]);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);

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
    if (mazeSize[0] === 0) {
      alert("Please Give Valid Maze Size!");
    }
    const requestID = Math.floor(Math.random() * 10000) + 1;
    setTime(0)
    setScore(score+mazeSize[0])
    props.onInputChange([mazeSize, requestID]);
  };

  const handleChange = () => {
    const inputSize = document.getElementById("mazeSize").value;
    if (inputSize === "" || isNaN(inputSize) === true || isNaN(parseInt(inputSize)) === true) {
      setMazeSize([0, 0]);
    } else {
      setMazeSize([parseInt(inputSize), parseInt(inputSize)]);
    }
  };
  return (
    <div className="input mt-[25px] h-[5vh] flex flex-col justify-center items-center">
      <div className="flex items-center justify-center">
        <label htmlFor="mazeSize">
          Maze Size:
          <input
            type="text"
            className="px-2 mx-4 outline-none w-[75px] bg-transparent border-b-2 border-[rgb(0,255,75)]"
            id="mazeSize"
            name="mazeSize"
            value={mazeSize[0]}
            onChange={handleChange}
            maxLength={2}
            placeholder="e.g. 25"
          ></input>
        </label>
        <input
          type="button"
          value={"Generate"}
          className="cursor-pointer bg-[rgb(0,255,75)] text-[rgb(30,30,30)] outline-none font-bold px-2 rounded-sm hover:bg-[rgb(150,250,125)]"
          onClick={handleClick}
        ></input>
      </div>
      <div className="flex">
        <div
          id="time"
          className="px-2 my-[15px] text-center rounded font-bold bg-[rgb(255,89,89)] text-black"
        >
          {time} sec
        </div>
        <div
          id="score"
          className="px-2 mx-2 my-[15px] text-center rounded font-bold bg-[rgb(231,255,51)] text-black"
        >
          Score: {score}
        </div>
      </div>
    </div>
  );
}

export default Input;

import React from 'react'
import { useState } from 'react';

function Input(props) {
    const [mazeSize, setMazeSize] = useState([15, 15]);

    const handleClick = () => {
        if(mazeSize[0] === 0){
            alert('Please Give Valid Maze Size!')
        }
        const requestID = Math.floor(Math.random() * 10000) + 1;
        props.onInputChange([mazeSize, requestID])
    }

    const handleChange = () => {
        const inputSize = document.getElementById("mazeSize").value;
        if (inputSize === "") {
            setMazeSize([0, 0]);
        }
        else{
            setMazeSize([parseInt(inputSize), parseInt(inputSize)]);
        }
    }
  return (
    <div className="input m-[25px] h-[10vh] h-max-[10vh]">
        <label htmlFor="mazeSize">
          Maze Size:
          <input
            type="text"
            className="px-2 mx-4 outline-none w-[100px] bg-transparent border-b-2 border-[rgb(0,255,75)]"
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
          className="cursor-pointer bg-[rgb(0,255,75)] text-[rgb(30,30,30)] px-2 rounded-sm hover:bg-[rgb(150,250,125)]"
          onClick={handleClick}
        ></input>
      </div>
  )
}

export default Input
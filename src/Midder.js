import React, { useState } from "react";
import Input from "./Input";
import Playground from "./Playground";

function Midder() {
  const [data, setData] = useState([]);
  const [isVictory, setIsVictory] = useState(false);
  const handleInputChange = (newData) => {
    setData(newData);
  };
  const handleVictory = (props) => {
    setIsVictory(props);
  }
  return (
    <div className="midder h-[85vh] h-max-[85vh] w-full w-max-full flex absolute justify-center">
      <Input onInputChange={handleInputChange} isVictory={isVictory}/>
      <Playground inputData={data} onVictory={handleVictory}/>
    </div>
  );
}

export default Midder;

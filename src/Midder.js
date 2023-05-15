import React, { useState } from 'react'
import Input from './Input'
import Playground from './Playground'

function Midder() {
    const [data, setData] = useState([])
    const handleInputChange = (newData) => {
        setData(newData)
    }
  return (
    <div className='midder h-[85vh] h-max-[85vh] w-full w-max-full flex absolute'>
        <Input onInputChange={handleInputChange}/>
        <Playground inputData={data}/>
    </div>
  )
}

export default Midder
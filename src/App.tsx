import { useState, useCallback } from "react";
import Header from "./components/Header";
import Controls from "./features/maze/components/Controls";
import Playground from "./features/maze/components/Playground";
import type { MazeRequestData } from "./features/maze/types";

function App() {
  const [data, setData] = useState<MazeRequestData | []>([]);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  const handleInputChange = useCallback((newData: MazeRequestData) => {
    setData(newData);
  }, []);

  const handleVictory = useCallback((victoryState: boolean) => {
    setIsVictory(victoryState);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-canvas)] text-[var(--color-content)] overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row-reverse items-center justify-between min-h-0 w-full overflow-hidden">
        <Controls onInputChange={handleInputChange} isVictory={isVictory} />
        <Playground inputData={data} onVictory={handleVictory} />
      </main>
    </div>
  );
}

export default App;
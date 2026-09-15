import Controls from "./features/maze/components/Controls";
import Playground from "./features/maze/components/Playground";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-canvas)] text-[var(--color-content)] overflow-hidden">
      <main className="flex-1 flex flex-col lg:flex-row-reverse items-center justify-between min-h-0 w-full overflow-hidden">
        <Controls />
        <Playground />
      </main>
    </div>
  );
}

export default App;
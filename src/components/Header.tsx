import logo from "../assets/logo.ico";

function Header() {
  return (
    <header className="h-14 p-[8px] lg:p-[16px] flex items-center justify-center w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
      <div className="flex items-center gap-1">
        <img
          src={logo}
          alt="Maze.AI Logo"
          className="w-8 h-8 object-contain"
          width={32}
          height={32}
        />
        <h1 className="text-title font-bold tracking-wider">
          Maze<span className="text-[var(--color-accent)]">.AI</span>
        </h1>
      </div>
    </header>
  );
}

export default Header;
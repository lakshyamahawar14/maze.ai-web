function Header() {
  return (
    <header className="h-14 p-2 flex items-center justify-center w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
      <h1 className="text-title font-bold tracking-wider">
        MAZE<span className="text-[var(--color-accent)]">.AI</span>
      </h1>
    </header>
  );
}

export default Header;
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import logo from "./assets/logo.ico";

function FontGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const fontLoads = [
      document.fonts.load('400 16px "Geist"'),
      document.fonts.load('500 16px "Geist"'),
      document.fonts.load('600 16px "Geist"'),
      document.fonts.load('700 16px "Geist"'),
      document.fonts.load('600 16px "Chakra Petch"'),
      document.fonts.load('700 16px "Chakra Petch"'),
      document.fonts.ready,
    ];

    const logoPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.src = logo;
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });

    Promise.all([...fontLoads, logoPromise])
      .then(() => {
        if (active) {
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return <div className="h-screen w-screen bg-[var(--color-canvas)]" />;
  }

  return <App />;
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(<FontGate />);
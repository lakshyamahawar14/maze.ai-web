import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import logo from "./assets/logo.ico";

const REQUIRED_FONTS = [
  "400 16px Geist",
  "500 16px Geist",
  "600 16px Geist",
  "700 16px Geist",
  "600 16px \"Chakra Petch\"",
  "700 16px \"Chakra Petch\"",
];

function FontGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const waitForAssets = async () => {
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

      await logoPromise;

      const maxAttempts = 60;
      let attempts = 0;

      while (!cancelled && attempts < maxAttempts) {
        await document.fonts.ready;

        const loadPromises = REQUIRED_FONTS.map((fontSpec) =>
          document.fonts.load(fontSpec)
        );
        await Promise.all(loadPromises);

        const allAvailable = REQUIRED_FONTS.every((fontSpec) =>
          document.fonts.check(fontSpec)
        );

        if (allAvailable) {
          break;
        }

        await new Promise((res) => setTimeout(res, 50));
        attempts++;
      }

      if (cancelled) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) {
            setReady(true);
          }
        });
      });
    };

    waitForAssets();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <div className="h-screen w-screen bg-[var(--color-canvas)]" />;
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FontGate />
  </StrictMode>
);
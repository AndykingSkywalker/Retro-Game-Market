"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "rgm_theme";

function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (storedValue === "light" || storedValue === "dark") {
    return storedValue;
  }

  return getSystemTheme();
}

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3c0 6 4.79 10.79 9.79 9.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);
  const { isCartOpen } = useStore();

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  function handleModeChange(nextMode: ThemeMode) {
    setMode(nextMode);
  }

  function buttonClass(buttonMode: ThemeMode): string {
    return mode === buttonMode
      ? "ui-button p-2 transition-transform duration-150 hover:scale-105"
      : "ui-button-secondary p-2 transition-transform duration-150 hover:scale-105";
  }

  return (
    <div
      className={`ui-card ui-float-toggle fixed bottom-3 right-3 flex items-center gap-1 rounded-full p-1 shadow-lg backdrop-blur ${
        isCartOpen ? "z-10 pointer-events-none opacity-60" : "z-30"
      }`}
      role="group"
      aria-label="Theme mode"
    >
      <button
        type="button"
        className={buttonClass("light")}
        onClick={() => handleModeChange("light")}
        title="Use light theme"
        aria-pressed={mode === "light"}
        aria-label="Use light theme"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={buttonClass("dark")}
        onClick={() => handleModeChange("dark")}
        title="Use dark theme"
        aria-pressed={mode === "dark"}
        aria-label="Use dark theme"
      >
        <MoonIcon />
      </button>
    </div>
  );
}




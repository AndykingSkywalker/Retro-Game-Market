"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useStore } from "@/components/StoreProvider";

interface TerminalLine {
  id: number;
  text: string;
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function DevTerminal() {
  const { user, isCartOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, text: "Dev terminal ready. Type 'help' for commands." },
  ]);

  const nextIdRef = useRef(2);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const availableCommands = useMemo(
    () => ["help", "getRole", "clear"],
    [],
  );

  function pushLine(text: string) {
    setLines((previous) => [...previous, { id: nextIdRef.current++, text }]);
  }

  function runCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    pushLine(`> ${trimmed}`);

    if (trimmed === "help") {
      pushLine(`Commands: ${availableCommands.join(", ")}`);
      return;
    }

    if (trimmed === "getRole") {
      pushLine(
        toJson({
          username: user?.username ?? null,
          role: user?.role ?? null,
        }),
      );
      return;
    }

    if (trimmed === "clear") {
      setLines([]);
      return;
    }

    pushLine(`Unknown command: ${trimmed}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(command);
    setCommand("");
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsOpen((previous) => !previous);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-16 right-3 ui-button-secondary px-2 py-1 text-xs ${
            isCartOpen ? "z-10 pointer-events-none opacity-60" : "z-40"
          }`}
          aria-label="Open dev terminal"
          title="Ctrl+Shift+C"
        >
          Terminal
        </button>
      ) : null}

      {isOpen ? (
        <section
          className={`fixed bottom-3 left-3 right-3 ui-card p-3 shadow-xl ${
            isCartOpen ? "z-10 pointer-events-none opacity-60" : "z-40"
          }`}
          aria-label="Development terminal"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Dev Terminal (Ctrl+Shift+C)</p>
            <button
              type="button"
              className="ui-button-secondary px-2 py-1 text-xs"
              onClick={() => setIsOpen(false)}
              aria-label="Close dev terminal"
            >
              Close
            </button>
          </div>

          <div className="mb-2 max-h-44 overflow-y-auto rounded-md border border-zinc-300 bg-black p-2 font-mono text-xs text-green-300">
            {lines.length > 0 ? (
              lines.map((line) => (
                <pre key={line.id} className="whitespace-pre-wrap leading-5">
                  {line.text}
                </pre>
              ))
            ) : (
              <pre className="leading-5">(cleared)</pre>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="font-mono text-sm">$</span>
            <input
              ref={inputRef}
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="ui-input mt-0"
              placeholder="Enter command..."
              aria-label="Terminal command input"
              autoComplete="off"
            />
            <button type="submit" className="ui-button-secondary px-3 py-2 text-sm">
              Run
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}



"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/data/store";
import { personas, getPersona } from "@/lib/data/personas";
import { cn } from "@/lib/cn";

export function PersonaSwitcher() {
  const activePersonaId = useAppStore((s) => s.activePersonaId);
  const setPersona = useAppStore((s) => s.setPersona);
  const [open, setOpen] = useState(false);

  const active = getPersona(activePersonaId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-surface/95 py-1 pr-2.5 pl-1 text-xs shadow-[0_4px_12px_-4px_rgba(26,22,18,0.2)] ring-1 ring-stone-line/60 hover:ring-ink/30"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss text-[10px] font-medium text-paper">
          {active?.initials ?? "?"}
        </span>
        <span className="font-medium text-ink">
          {active?.displayName ?? "Sign in"}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-ink-muted">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <button
            aria-hidden
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-9 z-50 w-64 overflow-hidden rounded-xl bg-surface shadow-[0_16px_36px_-12px_rgba(26,22,18,0.35)] ring-1 ring-stone-line/60">
            <div className="eyebrow border-b border-stone-line px-3 py-2 text-[9px]">
              Demo: switch persona
            </div>
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPersona(p.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 border-b border-stone-line/60 px-3 py-2 text-left text-xs hover:bg-paper-warm/50",
                  activePersonaId === p.id && "bg-paper-warm/40",
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss text-[10px] font-medium text-paper">
                  {p.initials}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-ink">
                    {p.displayName}
                  </span>
                  <span className="block truncate text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                    {p.tier === "founding"
                      ? "Founding member"
                      : p.tier === "verified"
                        ? "Verified local"
                        : "Visitor"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

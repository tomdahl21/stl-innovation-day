"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/data/store";
import { useAllPlaces } from "@/lib/data/places";
import { archetypes } from "@/archetypes";
import { cn } from "@/lib/cn";
import { thumbStyle } from "@/lib/imagery";
import type { LogbookState } from "@/lib/data/types";

const TABS: { state: LogbookState; label: string }[] = [
  { state: "been", label: "Been" },
  { state: "want", label: "Want to go" },
  { state: "saved", label: "Saved" },
];

export function Logbook() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const logbook = useAppStore((s) => s.logbook);
  const selectPlace = useAppStore((s) => s.selectPlace);

  const allPlaces = useAllPlaces();
  const [active, setActive] = useState<LogbookState>("been");

  if (overlay !== "logbook") return null;

  const counts = {
    been: 0,
    want: 0,
    saved: 0,
  } as Record<LogbookState, number>;
  for (const e of Object.values(logbook)) counts[e.state]++;

  const entries = Object.values(logbook)
    .filter((e) => e.state === active)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      <div className="flex shrink-0 items-baseline justify-between border-b border-stone-line px-5 pb-3 pt-5">
        <h2 className="serif-heading text-2xl text-ink">Your logbook</h2>
        <button
          onClick={() => setOverlay(null)}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <div className="flex shrink-0 gap-5 border-b border-stone-line px-5 pb-2 pt-3">
        {TABS.map((t) => (
          <button
            key={t.state}
            onClick={() => setActive(t.state)}
            className={cn(
              "relative pb-2 text-[11px] font-medium uppercase tracking-[0.16em]",
              active === t.state ? "text-ink" : "text-ink-muted",
            )}
          >
            {t.label} ({counts[t.state]})
            {active === t.state && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-brick" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex h-full items-center justify-center px-8 py-12 text-center">
            <p className="font-serif text-sm italic text-ink-muted">
              {active === "been"
                ? "Nothing logged yet. Tap a pin and mark it Been when you go."
                : active === "want"
                  ? "Save spots you want to hit. They'll show up here."
                  : "Save anything that catches your eye."}
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const place = allPlaces.find((p) => p.id === entry.placeId);
            if (!place) return null;
            const meta = archetypes[place.archetype];
            const date = new Date(entry.updatedAt);
            const dateStr = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return (
              <button
                key={entry.placeId}
                onClick={() => {
                  selectPlace(place.id);
                  setOverlay("place");
                }}
                className="flex w-full gap-3 border-b border-stone-line px-5 py-3 text-left hover:bg-paper-warm/40"
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-lg bg-paper-warm"
                  style={thumbStyle(place)}
                />
                <div className="min-w-0 flex-1">
                  <div className="eyebrow text-[9px] !text-brick">
                    {meta.label}
                  </div>
                  <div className="serif-heading text-[14px] text-ink">
                    {place.name}
                  </div>
                  {entry.note ? (
                    <div className="mt-0.5 line-clamp-2 text-[11px] italic text-ink-muted">
                      &ldquo;{entry.note}&rdquo;
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[11px] text-ink-muted">
                      {place.neighborhood}
                    </div>
                  )}
                </div>
                <div className="shrink-0 self-start text-[9px] uppercase tracking-[0.12em] text-ink-muted">
                  {dateStr}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

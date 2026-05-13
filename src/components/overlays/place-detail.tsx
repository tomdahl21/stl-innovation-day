"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/data/store";
import { usePlaceById } from "@/lib/data/places";
import { archetypes } from "@/archetypes";
import { getPersona } from "@/lib/data/personas";
import { cn } from "@/lib/cn";
import { heroStyle, photoTileStyle } from "@/lib/imagery";
import type { LogbookState } from "@/lib/data/types";
import { AddToListSheet } from "./add-to-list-sheet";

export function PlaceDetail() {
  const overlay = useAppStore((s) => s.overlay);
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const logbook = useAppStore((s) => s.logbook);
  const setLogbookState = useAppStore((s) => s.setLogbookState);
  const setLogbookNote = useAppStore((s) => s.setLogbookNote);

  const [listSheetOpen, setListSheetOpen] = useState(false);

  // Reset active photo on place change via the React-recommended derived-state
  // pattern (https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes).
  const [activePhoto, setActivePhoto] = useState(0);
  const [lastPlaceId, setLastPlaceId] = useState(selectedPlaceId);
  if (selectedPlaceId !== lastPlaceId) {
    setLastPlaceId(selectedPlaceId);
    setActivePhoto(0);
  }

  const place = usePlaceById(selectedPlaceId);
  if (overlay !== "place" || !selectedPlaceId || !place) return null;

  const meta = archetypes[place.archetype];
  const contributor = getPersona(place.contributorId);
  const entry = logbook[place.id];
  const detailRows = meta.detailRows(place.archetypeData).filter((r) => r.value);

  const setState = (state: LogbookState) => {
    if (entry?.state === state) {
      setLogbookState(place.id, null);
    } else {
      setLogbookState(place.id, state);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      {/* Hero */}
      <div
        className="relative h-44 shrink-0 bg-paper-warm"
        style={heroStyle(place, activePhoto)}
      >
        {/* Close — min 44×44px touch target */}
        <button
          onClick={() => setOverlay(null)}
          aria-label="Close place detail"
          className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 text-base text-ink hover:bg-paper"
        >
          ←
        </button>
        {entry && (
          <div className="absolute right-3 top-3 rounded-full bg-paper/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ink">
            {entry.state === "been"
              ? "Been there"
              : entry.state === "want"
                ? "Want to go"
                : "Saved"}
          </div>
        )}
        {place.photos[activePhoto]?.source && (
          <div className="absolute bottom-2 right-3 rounded bg-ink/55 px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-paper/90">
            {place.photos[activePhoto].source}
          </div>
        )}
      </div>

      {/* Gallery strip — only renders with 2+ photos */}
      {place.photos.length > 1 && (
        <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-stone-line bg-surface px-3 py-2">
          {place.photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(i)}
              aria-label={`Photo ${i + 1} of ${place.photos.length}`}
              aria-current={i === activePhoto}
              className={cn(
                "h-12 w-16 shrink-0 rounded-sm border-2 bg-paper-warm transition-colors",
                i === activePhoto
                  ? "border-brick"
                  : "border-transparent hover:border-ink/25",
              )}
              style={photoTileStyle(photo)}
            />
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="eyebrow !text-brick">
          {meta.label} · {place.neighborhood}
        </div>
        <h2 className="serif-heading mt-1 text-2xl text-ink">{place.name}</h2>

        {detailRows.length > 0 && (
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
            {detailRows.map((row) => (
              <div key={row.label} className="flex items-baseline gap-1">
                <dt className="text-[11px] uppercase tracking-[0.1em]">
                  {row.label}
                </dt>
                <dd className="text-ink-soft">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <blockquote className="mt-4 border-l-2 border-brick pl-3 font-serif text-sm italic leading-relaxed text-ink-soft">
          {place.pitch}
        </blockquote>

        {contributor && (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-ink-muted">
            <div
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-moss text-[11px] font-medium text-paper"
            >
              {contributor.initials}
            </div>
            Added by {contributor.displayName}
            {contributor.tier === "founding" && (
              /* bg-brick-deep instead of bg-brick — paper text on brick-deep = 6.6:1 ✓ */
              <span className="ml-1 rounded-full bg-brick-deep px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-paper">
                Founding
              </span>
            )}
          </div>
        )}

        {entry && (
          <div className="mt-5">
            <label className="eyebrow block">Your note</label>
            <textarea
              defaultValue={entry.note ?? ""}
              onBlur={(e) => setLogbookNote(place.id, e.target.value)}
              placeholder="Add a private note for next time…"
              className="mt-2 w-full resize-none rounded-md border border-stone-line bg-paper-warm/40 p-2.5 font-serif text-[13px] italic text-ink-soft outline-none focus:border-ink/40"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1.5 border-t border-stone-line bg-surface px-5 py-3">
        <ActionButton
          active={entry?.state === "want"}
          aria-pressed={entry?.state === "want"}
          onClick={() => setState("want")}
        >
          Want to go
        </ActionButton>
        <ActionButton
          active={entry?.state === "saved"}
          aria-pressed={entry?.state === "saved"}
          onClick={() => setState("saved")}
        >
          Saved
        </ActionButton>
        <ActionButton
          active={entry?.state === "been"}
          aria-pressed={entry?.state === "been"}
          onClick={() => setState("been")}
          primary
        >
          Been there
        </ActionButton>
        <ActionButton onClick={() => setListSheetOpen(true)}>
          + List
        </ActionButton>
      </div>

      {/* Add to list bottom sheet */}
      <AddToListSheet
        placeId={place.id}
        open={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
      />
    </div>
  );
}

function ActionButton({
  children,
  active,
  primary,
  onClick,
  "aria-pressed": ariaPressed,
}: {
  children: React.ReactNode;
  active?: boolean;
  primary?: boolean;
  onClick: () => void;
  "aria-pressed"?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ariaPressed}
      className={cn(
        /* min 44px height touch target */
        "flex-1 rounded-lg border px-2 py-3 text-[11px] font-medium transition-colors",
        active && primary
          ? "border-ink bg-ink text-paper"
          : active
            ? "border-brick bg-brick text-paper"
            : "border-stone-line bg-paper-warm text-ink hover:border-ink/30",
      )}
    >
      {children}
    </button>
  );
}

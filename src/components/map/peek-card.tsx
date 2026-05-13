"use client";

import { useAppStore } from "@/lib/data/store";
import { usePlaceById } from "@/lib/data/places";
import { archetypes } from "@/archetypes";
import { getPersona } from "@/lib/data/personas";
import { thumbStyle } from "@/lib/imagery";
import { distanceMi, formatDistance } from "@/lib/geo";

export function PeekCard() {
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const selectPlace = useAppStore((s) => s.selectPlace);
  const userLat = useAppStore((s) => s.userLat);
  const userLng = useAppStore((s) => s.userLng);

  const place = usePlaceById(selectedPlaceId);
  if (!selectedPlaceId || overlay || !place) return null;

  const meta = archetypes[place.archetype];
  const contributor = getPersona(place.contributorId);
  const distance =
    userLat !== null && userLng !== null
      ? formatDistance(distanceMi(userLat, userLng, place.lat, place.lng))
      : null;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-20 z-20">
      <div className="pointer-events-auto flex items-stretch gap-3 rounded-xl bg-surface p-3 shadow-[0_12px_28px_-14px_rgba(26,22,18,0.35)] ring-1 ring-stone-line/60">
        <button
          aria-label="Close peek"
          onClick={() => selectPlace(null)}
          className="absolute right-2 top-2 text-xs text-ink-muted hover:text-ink"
        >
          ×
        </button>
        <div
          className="h-14 w-14 shrink-0 rounded-lg bg-paper-warm"
          style={thumbStyle(place)}
        />
        <button
          onClick={() => setOverlay("place")}
          className="flex flex-1 flex-col items-start text-left"
        >
          <div className="eyebrow text-[10px] !text-brick">
            {meta.label} · {place.neighborhood}
          </div>
          <div className="serif-heading text-[15px] mt-0.5 text-ink">
            {place.name}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-muted">
            Added by {contributor?.displayName ?? "—"} · {place.saveCount} saves
            {distance && <> · {distance}</>}
          </div>
        </button>
      </div>
    </div>
  );
}

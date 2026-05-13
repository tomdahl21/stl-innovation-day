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
      <div className="pointer-events-auto relative flex items-stretch gap-3 rounded-xl bg-surface p-3 shadow-[0_12px_28px_-14px_rgba(26,22,18,0.35)] ring-1 ring-stone-line/60">
        {/* Dismiss — min 44×44px touch target */}
        <button
          aria-label="Dismiss peek"
          onClick={() => selectPlace(null)}
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-lg text-ink-muted hover:text-ink"
        >
          ×
        </button>
        <div
          className="h-14 w-14 shrink-0 rounded-lg bg-paper-warm"
          style={thumbStyle(place)}
          aria-hidden="true"
        />
        <button
          onClick={() => setOverlay("place")}
          aria-label={`View details for ${place.name}`}
          className="flex flex-1 flex-col items-start pr-8 text-left"
        >
          <div className="eyebrow !text-brick">
            {meta.label} · {place.neighborhood}
          </div>
          <div className="serif-heading mt-0.5 text-[15px] text-ink">
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

"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/data/store";
import { useAllPlaces } from "@/lib/data/places";
import { archetypes } from "@/archetypes";
import { cn } from "@/lib/cn";
import { thumbStyle } from "@/lib/imagery";
import { shareList } from "@/lib/data/list-sharing";

export function ListDetail() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const activeListId = useAppStore((s) => s.activeListId);
  const lists = useAppStore((s) => s.lists);
  const removePlaceFromList = useAppStore((s) => s.removePlaceFromList);
  const renameList = useAppStore((s) => s.renameList);
  const selectPlace = useAppStore((s) => s.selectPlace);
  const logbook = useAppStore((s) => s.logbook);
  const displayName = useAppStore((s) => s.displayName);
  const setArchetypeFilter = useAppStore((s) => s.setArchetypeFilter);

  const allPlaces = useAllPlaces();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  if (overlay !== "list-detail" || !activeListId) return null;

  const list = lists.find((l) => l.id === activeListId);
  if (!list) return null;

  const places = list.placeIds
    .map((id) => allPlaces.find((p) => p.id === id))
    .filter(Boolean) as typeof allPlaces;

  const handleShare = async () => {
    const result = await shareList(list, displayName || undefined);
    if (result === "copied") {
      setToast("Link copied!");
      setTimeout(() => setToast(null), 2000);
    } else if (result === "shared") {
      setToast("Shared!");
      setTimeout(() => setToast(null), 2000);
    } else {
      setToast("Couldn't share — try again");
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleViewOnMap = () => {
    // Get unique archetypes from the list's places, then filter the map
    const placeArchetypes = [
      ...new Set(places.map((p) => p.archetype)),
    ];
    setArchetypeFilter(placeArchetypes.length > 0 ? placeArchetypes : null);
    setOverlay(null);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-stone-line px-5 pb-3 pt-5">
        <button
          onClick={() => setOverlay("lists")}
          className="text-sm text-ink-muted hover:text-ink"
        >
          ← Back
        </button>
        <button
          onClick={() => setOverlay(null)}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      {/* List info */}
      <div className="shrink-0 border-b border-stone-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{list.emoji}</span>
          {editing ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameList(list.id, editName);
                    setEditing(false);
                  }
                  if (e.key === "Escape") setEditing(false);
                }}
                className="flex-1 rounded-lg border border-stone-line bg-paper-warm/40 px-3 py-1.5 text-lg font-medium text-ink outline-none focus:border-ink/40"
              />
              <button
                onClick={() => {
                  renameList(list.id, editName);
                  setEditing(false);
                }}
                className="text-xs font-medium text-brick"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditName(list.name);
                setEditing(true);
              }}
              className="serif-heading text-xl text-ink"
            >
              {list.name}
            </button>
          )}
        </div>
        {list.source?.sharedBy && (
          <div className="mt-1 text-[11px] text-ink-muted">
            Shared by {list.source.sharedBy}
          </div>
        )}
        <div className="mt-2 text-[11px] text-ink-muted">
          {list.placeIds.length}{" "}
          {list.placeIds.length === 1 ? "place" : "places"}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 rounded-lg bg-brick px-3 py-2 text-xs font-medium text-paper"
          >
            Share list
          </button>
          <button
            onClick={handleViewOnMap}
            className="flex-1 rounded-lg border border-stone-line bg-paper-warm px-3 py-2 text-xs font-medium text-ink hover:border-ink/30"
          >
            View on map
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mx-5 mt-2 rounded-lg bg-ink px-3 py-2 text-center text-xs font-medium text-paper">
          {toast}
        </div>
      )}

      {/* Places list */}
      <div className="flex-1 overflow-y-auto">
        {places.length === 0 ? (
          <div className="flex h-full items-center justify-center px-8 py-12 text-center">
            <p className="font-serif text-sm italic text-ink-muted">
              No places yet. Tap a pin on the map and add it to this list.
            </p>
          </div>
        ) : (
          places.map((place) => {
            const meta = archetypes[place.archetype];
            const entry = logbook[place.id];
            return (
              <div
                key={place.id}
                className="flex items-center gap-3 border-b border-stone-line px-5 py-3 hover:bg-paper-warm/40"
              >
                <button
                  onClick={() => {
                    selectPlace(place.id);
                    setOverlay("place");
                  }}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg bg-paper-warm"
                    style={thumbStyle(place)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow text-[9px] !text-brick">
                      {meta.label}
                    </div>
                    <div className="serif-heading text-[14px] text-ink">
                      {place.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
                      {place.neighborhood}
                      {entry && (
                        <span
                          className={cn(
                            "ml-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em]",
                            entry.state === "been"
                              ? "bg-moss/15 text-moss"
                              : entry.state === "want"
                                ? "bg-brick/15 text-brick"
                                : "bg-ink/10 text-ink-muted",
                          )}
                        >
                          {entry.state === "been"
                            ? "Been"
                            : entry.state === "want"
                              ? "Want"
                              : "Saved"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => removePlaceFromList(list.id, place.id)}
                  className="shrink-0 rounded-md px-2 py-1 text-[10px] text-ink-muted hover:bg-paper-warm hover:text-brick"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

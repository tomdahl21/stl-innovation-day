"use client";

import { useAppStore } from "@/lib/data/store";
import { useAllPlaces } from "@/lib/data/places";
import { archetypes } from "@/archetypes";
import { thumbStyle } from "@/lib/imagery";

export function ListImport() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const pendingImport = useAppStore((s) => s.pendingImport);
  const importList = useAppStore((s) => s.importList);
  const setPendingImport = useAppStore((s) => s.setPendingImport);
  const lists = useAppStore((s) => s.lists);
  const mergeIntoList = useAppStore((s) => s.mergeIntoList);
  const setActiveList = useAppStore((s) => s.setActiveList);

  const allPlaces = useAllPlaces();

  if (overlay !== "list-import" || !pendingImport) return null;

  const previewPlaces = pendingImport.p
    .slice(0, 5)
    .map((id) => allPlaces.find((p) => p.id === id))
    .filter(Boolean) as typeof allPlaces;

  const matchingList = lists.find(
    (l) => l.name.toLowerCase() === pendingImport.n.toLowerCase(),
  );

  const handleImport = () => {
    const id = importList(pendingImport);
    setActiveList(id);
    setOverlay("list-detail");
  };

  const handleMerge = () => {
    if (!matchingList) return;
    mergeIntoList(matchingList.id, pendingImport);
    setActiveList(matchingList.id);
    setOverlay("list-detail");
  };

  const handleBrowse = () => {
    setPendingImport(null);
    setOverlay(null);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-surface">
      {/* Header */}
      <div className="flex shrink-0 items-baseline justify-between border-b border-stone-line px-5 pb-3 pt-5">
        <h2 className="serif-heading text-2xl text-ink">Shared list</h2>
        <button
          onClick={handleBrowse}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      {/* List info */}
      <div className="shrink-0 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{pendingImport.e ?? "📍"}</span>
          <div>
            <h3 className="serif-heading text-xl text-ink">
              {pendingImport.n}
            </h3>
            {pendingImport.by && (
              <div className="mt-0.5 text-[11px] text-ink-muted">
                Shared by {pendingImport.by}
              </div>
            )}
          </div>
        </div>
        {pendingImport.d && (
          <p className="mt-2 font-serif text-sm italic text-ink-soft">
            {pendingImport.d}
          </p>
        )}
        <div className="mt-2 text-[11px] text-ink-muted">
          {pendingImport.p.length}{" "}
          {pendingImport.p.length === 1 ? "place" : "places"}
        </div>
      </div>

      {/* Preview places */}
      <div className="flex-1 overflow-y-auto border-t border-stone-line">
        {previewPlaces.map((place) => {
          const meta = archetypes[place.archetype];
          return (
            <div
              key={place.id}
              className="flex items-center gap-3 border-b border-stone-line px-5 py-3"
            >
              <div
                className="h-10 w-10 shrink-0 rounded-lg bg-paper-warm"
                style={thumbStyle(place)}
              />
              <div className="min-w-0 flex-1">
                <div className="eyebrow text-[9px] !text-brick">
                  {meta.label}
                </div>
                <div className="serif-heading text-[13px] text-ink">
                  {place.name}
                </div>
              </div>
            </div>
          );
        })}
        {pendingImport.p.length > 5 && (
          <div className="px-5 py-3 text-center text-[11px] text-ink-muted">
            +{pendingImport.p.length - 5} more{" "}
            {pendingImport.p.length - 5 === 1 ? "place" : "places"}
          </div>
        )}
        {previewPlaces.length === 0 && (
          <div className="px-5 py-8 text-center font-serif text-sm italic text-ink-muted">
            These places aren&apos;t in your local data yet — they&apos;ll
            appear once synced.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-stone-line px-5 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <button
          onClick={handleImport}
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-medium text-paper"
        >
          Import to my lists
        </button>
        {matchingList && (
          <button
            onClick={handleMerge}
            className="w-full rounded-lg border border-brick bg-brick/10 px-4 py-3 text-sm font-medium text-brick"
          >
            Merge into &ldquo;{matchingList.name}&rdquo;
          </button>
        )}
        <button
          onClick={handleBrowse}
          className="w-full rounded-lg border border-stone-line px-4 py-3 text-sm font-medium text-ink-muted hover:text-ink"
        >
          Just browse
        </button>
      </div>
    </div>
  );
}

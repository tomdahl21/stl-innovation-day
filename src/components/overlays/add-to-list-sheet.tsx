"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/data/store";

export function AddToListSheet({
  placeId,
  open,
  onClose,
}: {
  placeId: string;
  open: boolean;
  onClose: () => void;
}) {
  const lists = useAppStore((s) => s.lists);
  const addPlaceToList = useAppStore((s) => s.addPlaceToList);
  const removePlaceFromList = useAppStore((s) => s.removePlaceFromList);
  const createList = useAppStore((s) => s.createList);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createList(newName);
    addPlaceToList(id, placeId);
    setNewName("");
    setCreating(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/30"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-surface pb-[max(env(safe-area-inset-bottom),1rem)] shadow-[0_-8px_30px_-12px_rgba(26,22,18,0.3)]">
        <div className="flex items-baseline justify-between border-b border-stone-line px-5 pb-3 pt-4">
          <h3 className="serif-heading text-lg text-ink">Add to list</h3>
          <button
            onClick={onClose}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Done
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {lists.length === 0 && !creating && (
            <div className="px-5 py-6 text-center">
              <p className="font-serif text-sm italic text-ink-muted">
                No lists yet — create one below.
              </p>
            </div>
          )}

          {lists.map((list) => {
            const isInList = list.placeIds.includes(placeId);
            return (
              <button
                key={list.id}
                onClick={() =>
                  isInList
                    ? removePlaceFromList(list.id, placeId)
                    : addPlaceToList(list.id, placeId)
                }
                className="flex w-full items-center gap-3 border-b border-stone-line px-5 py-3 text-left hover:bg-paper-warm/40"
              >
                <span className="text-lg">{list.emoji}</span>
                <span className="flex-1 text-sm text-ink">{list.name}</span>
                <span
                  className={
                    isInList
                      ? "text-sm font-medium text-brick"
                      : "text-sm text-ink-muted"
                  }
                >
                  {isInList ? "✓" : "+"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick create */}
        {creating ? (
          <div className="flex items-center gap-2 border-t border-stone-line px-5 py-3">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="List name…"
              className="flex-1 rounded-lg border border-stone-line bg-paper-warm/40 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-ink/40"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-lg bg-ink px-3 py-2 text-xs font-medium text-paper disabled:opacity-40"
            >
              Create
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
              className="text-xs text-ink-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-2 border-t border-stone-line px-5 py-3 text-left text-sm font-medium text-brick hover:bg-paper-warm/40"
          >
            + New list
          </button>
        )}
      </div>
    </>
  );
}

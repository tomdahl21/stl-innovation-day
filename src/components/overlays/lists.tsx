"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/data/store";
import { cn } from "@/lib/cn";

export function Lists() {
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const lists = useAppStore((s) => s.lists);
  const createList = useAppStore((s) => s.createList);
  const deleteList = useAppStore((s) => s.deleteList);
  const setActiveList = useAppStore((s) => s.setActiveList);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📍");

  if (overlay !== "lists") return null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createList(newName, newEmoji);
    setNewName("");
    setNewEmoji("📍");
    setCreating(false);
    setActiveList(id);
    setOverlay("list-detail");
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface">
      {/* Header */}
      <div className="flex shrink-0 items-baseline justify-between border-b border-stone-line px-5 pb-3 pt-5">
        <h2 className="serif-heading text-2xl text-ink">Your lists</h2>
        <button
          onClick={() => setOverlay(null)}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      {/* New list form */}
      {creating ? (
        <div className="flex items-center gap-2 border-b border-stone-line px-5 py-3">
          <button
            onClick={() => {
              const emojis = ["📍", "🍕", "🎵", "🌳", "☕", "🛍️", "⭐", "❤️", "🔥", "🗺️"];
              const idx = emojis.indexOf(newEmoji);
              setNewEmoji(emojis[(idx + 1) % emojis.length]);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper-warm text-lg"
          >
            {newEmoji}
          </button>
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
            className="text-xs text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 border-b border-stone-line px-5 py-3 text-left text-sm text-brick hover:bg-paper-warm/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-brick/40 text-brick">
            +
          </span>
          <span className="font-medium">New list</span>
        </button>
      )}

      {/* List cards */}
      <div className="flex-1 overflow-y-auto">
        {lists.length === 0 && !creating ? (
          <div className="flex h-full items-center justify-center px-8 py-12 text-center">
            <p className="font-serif text-sm italic text-ink-muted">
              Create a list to group your favorite gems — perfect for sharing
              with friends.
            </p>
          </div>
        ) : (
          lists
            .slice()
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((list) => {
              const date = new Date(list.updatedAt);
              const dateStr = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={list.id}
                  className="flex items-center gap-3 border-b border-stone-line px-5 py-3 hover:bg-paper-warm/40"
                >
                  <button
                    onClick={() => {
                      setActiveList(list.id);
                      setOverlay("list-detail");
                    }}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper-warm text-lg">
                      {list.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="serif-heading text-[14px] text-ink">
                        {list.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">
                        {list.placeIds.length}{" "}
                        {list.placeIds.length === 1 ? "place" : "places"} ·{" "}
                        {dateStr}
                        {list.source?.sharedBy && (
                          <span> · from {list.source.sharedBy}</span>
                        )}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${list.name}"?`)) {
                        deleteList(list.id);
                      }
                    }}
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper-warm hover:text-brick",
                    )}
                  >
                    Delete
                  </button>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

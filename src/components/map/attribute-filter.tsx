"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/data/store";
import { cn } from "@/lib/cn";

// Defers the portal until after client hydration to avoid SSR/CSR mismatch
// (document.body doesn't exist server-side). useSyncExternalStore returns the
// server snapshot during the initial client render, then switches to the
// client snapshot on the next paint — same effect as a mounted-flag with
// useEffect, without tripping the no-setState-in-effect lint rule.
const noop = () => () => {};
function useMountedClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export const ATTRIBUTE_TAGS = [
  { id: "family-friendly", label: "Family-friendly" },
  { id: "dog-friendly", label: "Dog-friendly" },
  { id: "open-late", label: "Open late" },
  { id: "quiet-atmosphere", label: "Quiet" },
  { id: "date-night", label: "Date night" },
] as const;

export type AttributeTagId = (typeof ATTRIBUTE_TAGS)[number]["id"];

// Dismissible chip row — shows only active filters, collapses when empty.
export function ActiveAttributeChips() {
  const attributeFilter = useAppStore((s) => s.attributeFilter);
  const toggleAttributeFilter = useAppStore((s) => s.toggleAttributeFilter);

  if (attributeFilter.length === 0) return null;

  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-3 pb-2"
      style={{ scrollbarWidth: "none" }}
    >
      {attributeFilter.map((tagId) => {
        const tag = ATTRIBUTE_TAGS.find((t) => t.id === tagId);
        if (!tag) return null;
        return (
          <button
            key={tagId}
            onClick={() => toggleAttributeFilter(tagId)}
            className="shrink-0 flex items-center gap-1 whitespace-nowrap rounded-full bg-ink text-paper border border-ink px-3 py-1 text-xs font-medium"
          >
            {tag.label}
            <XIcon />
          </button>
        );
      })}
    </div>
  );
}

// Bottom sheet for picking attribute filters.
export function AttributeFilterSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const attributeFilter = useAppStore((s) => s.attributeFilter);
  const toggleAttributeFilter = useAppStore((s) => s.toggleAttributeFilter);
  const clearAttributeFilter = useAppStore((s) => s.clearAttributeFilter);

  const mounted = useMountedClient();
  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-paper rounded-t-2xl px-4 pt-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-ink">Filter by vibe</span>
          <div className="flex items-center gap-3">
            {attributeFilter.length > 0 && (
              <button
                onClick={clearAttributeFilter}
                className="text-xs text-ink-soft hover:text-ink transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-paper-warm text-ink-soft hover:text-ink transition-colors"
            >
              <XIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {ATTRIBUTE_TAGS.map((tag) => {
            const active = attributeFilter.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleAttributeFilter(tag.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper-warm/90 text-ink-soft border-stone-line hover:border-ink/40",
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-full bg-ink text-paper py-3 text-sm font-semibold"
        >
          {attributeFilter.length === 0
            ? "Done"
            : `Show results · ${attributeFilter.length} filter${attributeFilter.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M1 1l8 8M9 1L1 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

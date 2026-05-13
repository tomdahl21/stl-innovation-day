"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { archetypeOrder, archetypes, type ArchetypeName } from "@/archetypes";
import { useAppStore } from "@/lib/data/store";
import { cn } from "@/lib/cn";

const POPOVER_WIDTH = 224;
const VIEWPORT_PAD = 12;

// Single-pill replacement for the inline archetype chip row. Opens a popover
// with checkbox rows: "All categories" plus one row per archetype. Auto-
// applies on each toggle — no Apply button, mirroring how the old chips
// worked. The popover is portalled to document.body so it escapes the
// overflow-x-auto clipping context of the filter strip it lives in.
export function CategoryFilter() {
  const mounted = useMountedClient();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const archetypeFilter = useAppStore((s) => s.archetypeFilter);
  const toggleArchetype = useAppStore((s) => s.toggleArchetype);
  const setArchetypeFilter = useAppStore((s) => s.setArchetypeFilter);

  const isAll = archetypeFilter === null;
  const isActive = (name: ArchetypeName) =>
    !isAll && archetypeFilter!.includes(name);
  const count = isAll ? 0 : archetypeFilter!.length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleTriggerClick = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(true);
  };

  const triggerLabel = isAll
    ? "All categories"
    : count === 1
      ? archetypes[archetypeFilter![0]].label
      : "Categories";

  // Clamp the popover's left edge so it stays within the viewport.
  const popoverLeft = rect
    ? Math.max(
        VIEWPORT_PAD,
        Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_PAD),
      )
    : 0;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Filter by category — ${
          isAll ? "all categories" : `${count} selected`
        }`}
        className={cn(
          "flex shrink-0 min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
          !isAll
            ? "border-ink/30 bg-ink/10 text-ink"
            : "border-stone-line bg-paper-warm/90 text-ink-soft hover:border-ink/40",
        )}
      >
        <CategoriesIcon />
        {triggerLabel}
        {count > 1 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-paper">
            {count}
          </span>
        )}
        <Chevron open={open} />
      </button>

      {mounted &&
        open &&
        rect &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Select categories"
            style={{
              position: "fixed",
              top: rect.bottom + 8,
              left: popoverLeft,
              width: POPOVER_WIDTH,
            }}
            className="z-50 overflow-hidden rounded-xl bg-surface shadow-[0_16px_36px_-12px_rgba(26,22,18,0.35)] ring-1 ring-stone-line/60"
          >
            <div className="eyebrow border-b border-stone-line px-3 py-2">
              Categories
            </div>
            <OptionRow
              label="All categories"
              checked={isAll}
              onChange={() => setArchetypeFilter(null)}
            />
            <div className="h-px bg-stone-line/40" aria-hidden="true" />
            {archetypeOrder.map((name) => (
              <OptionRow
                key={name}
                label={archetypes[name].label}
                checked={isActive(name)}
                onChange={() => toggleArchetype(name)}
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

function OptionRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-xs text-ink hover:bg-paper-warm/50">
      <span
        aria-hidden="true"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-ink bg-ink text-paper"
            : "border-stone-line bg-surface",
        )}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M2 5.5l2 2 4-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="flex-1 font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

function CategoriesIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="3.5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="7" y="1.5" width="3.5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="7" width="3.5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="7" y="7" width="3.5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={cn("text-ink-muted transition-transform", open && "rotate-180")}
    >
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Defers the portal until after client hydration (same pattern as attribute-filter).
const noop = () => () => {};
function useMountedClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
